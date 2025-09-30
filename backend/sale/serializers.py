"""
Serializers for warehouse app
"""

import os
from itertools import product
from django.db import transaction
from rest_framework import serializers
from core.models import *
from sale.services.entries_service import IncreaseProductStockService
from sale.services.update_product_stock_service import UpdateProductStockService
from sale.services.output_service import DecreaseProductStockService
from sale.services.update_transaction_service import UpdateTransactionService


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        exclude = ['password']
        read_only_fields = ['id', 'created_at', 'updated_at']
        

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""

    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

        
class BatchSerializer(serializers.ModelSerializer):
    """Serializer for Batch model"""
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )

    class Meta:
        model = Batch
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    batch = BatchSerializer(read_only=True)
    batch_id = serializers.PrimaryKeyRelatedField(
        queryset=Batch.objects.all(),
        source='batch',
        write_only=True
    )

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        # Validate image file if provided
        image = data.get('image')
        if image:
            # Check file type
            allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
            if image.content_type not in allowed_types:
                raise serializers.ValidationError({
                    'image': "Formato de archivo no soportado. Use JPG, PNG o GIF."
                })

        return data

    def update(self, instance, validated_data):
        """Custom update method to handle image deletion."""
        # If image is explicitly set to None, clear the field
        if 'image' in validated_data and validated_data['image'] is None:
            # Delete the old image file if it exists
            instance.delete_image()
            validated_data['image'] = None
        
        return super().update(instance, validated_data)
    
    
class CatalogProductSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    agency = serializers.CharField()
    warehouse = serializers.CharField()
    name = serializers.CharField()
    code = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    stock = serializers.IntegerField()
    minimum_stock = serializers.IntegerField()
    maximum_stock = serializers.IntegerField()
    minimum_sale_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    maximum_sale_price = serializers.DecimalField(max_digits=10, decimal_places=2)

class NestedProductStockSerializer(serializers.ModelSerializer):
    """Nested Serializer for intermediate table for product and stock model."""
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), write_only=True)
    products = ProductSerializer(read_only=True, source='product')
    id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = ProductStock
        fields = [
            'id', 'product', 'products',
            'stock', 'reserved_stock', 'available_stock', 'minimum_stock',
            'maximum_stock'
        ]
        read_only_fields = ['id']

    def validate(self, data):
        if data.get('minimum_stock') is not None and data.get('maximum_stock') is not None:
            if data['minimum_stock'] > data['maximum_stock']:
                raise serializers.ValidationError({
                    'minimum_stock': "El stock mínimo no puede ser mayor al máximo."
                })
        if data.get('minimum_sale_price') is not None and data.get('maximum_sale_price') is not None:
            if data['minimum_sale_price'] > data['maximum_sale_price']:
                raise serializers.ValidationError({
                    'minimum_sale_price': "El precio de venta mínimo no puede ser mayor al máximo."
                })
    
        return data

    def create(self, validated_data):
        validated_data['available_stock'] = validated_data['stock']
        return super().create(validated_data)


class AgencySerializer(serializers.ModelSerializer):
    """Serializer for Agency model"""

    class Meta:
        model = Agency
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class WarehouseSerializer(serializers.ModelSerializer):
    """Serializer for Warehouse model"""
    agency = AgencySerializer(read_only=True)
    agency_id = serializers.PrimaryKeyRelatedField(
        queryset=Agency.objects.all(),
        source='agency',
        write_only=True
    )
    product_stock = NestedProductStockSerializer(many=True, required=False, source='product_stocks')

    class Meta:
        model = Warehouse
        fields = ['id', 'product_stock','agency', 'agency_id', 'name', 'location', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    @transaction.atomic
    def create(self, validated_data):
        products_stock_data = validated_data.pop('product_stocks', [])
        try:
            warehouse = Warehouse.objects.create(**validated_data)

            for product_stock_data in products_stock_data:
                product_stock_data['available_stock'] = product_stock_data['stock']
                ProductStock.objects.create(warehouse=warehouse, **product_stock_data)
        except Exception as e:
            raise e

        return warehouse

    def update(self, instance, validated_data):
        products_stock_data = validated_data.pop('product_stocks', None)
        try:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if products_stock_data is not None:
                existing_items = instance.product_stocks.all()

                for item in existing_items:
                    if item.id not in [item_data.get('id') for item_data in products_stock_data if item_data.get('id')]:
                        item.delete()
                for item_data in products_stock_data:
                    if item_data.get('id'):
                        item = existing_items.get(id=item_data['id'])
                        for attr, value in item_data.items():
                            if attr != 'id':
                                setattr(item, attr, value)
                        item.save()
                    else:
                        item_data_copy = item_data.copy()
                        item_data_copy.pop('warehouse', None)
                        ProductStock.objects.create(warehouse=instance, **item_data_copy)
        except Exception as e:
            raise e

        return instance


class ProductStockSerializer(serializers.ModelSerializer):
    """Serializer for intermediate table for product and stock model."""
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), write_only=True)
    products = ProductSerializer(read_only=True, source='product')
    warehouse = serializers.PrimaryKeyRelatedField(queryset=Warehouse.objects.all(), write_only=True)
    warehouses = WarehouseSerializer(read_only=True, source='warehouse')
    id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = ProductStock
        fields = [
            'id', 'product', 'products', 'warehouse', 'warehouses', 
            'stock', 'reserved_stock', 'available_stock', 'minimum_stock',
            'maximum_stock'
        ]
        read_only_fields = ['id']

    def validate(self, data):
        if data.get('minimum_stock') is not None and data.get('maximum_stock') is not None:
            if data['minimum_stock'] > data['maximum_stock']:
                raise serializers.ValidationError({
                    'minimum_stock': "El stock mínimo no puede ser mayor al máximo."
                })
        if data.get('minimum_sale_price') is not None and data.get('maximum_sale_price') is not None:
            if data['minimum_sale_price'] > data['maximum_sale_price']:
                raise serializers.ValidationError({
                    'minimum_sale_price': "El precio de venta mínimo no puede ser mayor al máximo."
                })
                
        return data

    def create(self, validated_data):
        validated_data['available_stock'] = validated_data['stock']
        return super().create(validated_data)


class ProductMinimumSerializer(serializers.ModelSerializer):
    """Serializer to get products only to read in sales, purchases and suppliers."""
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'code']
        read_only_fields = ['id', 'name', 'code']


class SupplierSerializer(serializers.ModelSerializer):
    """Serializer for Supplier model"""
    products = ProductMinimumSerializer(many=True, read_only=True, source='product')
    product = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Product.objects.all(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Supplier
        fields = [
            'id',
            'products',
            'product',
            'name',
            'phone',
            'nit',
            'email',
            'address',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClientSerializer(serializers.ModelSerializer):
    """Serializer for Client model"""
    
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class EntryItemSerializer(serializers.ModelSerializer):
    """Serializer for EntryItem model"""
    products_stock = ProductStockSerializer(read_only=True, source='product_stock')
    product_stock = serializers.PrimaryKeyRelatedField(write_only=True, queryset=ProductStock.objects.all())

    class Meta:
        model = EntryItem
        fields = ['id', 'product_stock', 'products_stock', 'quantity', 'unit_price']
        read_only_fields = ['id']


class EntrySerializer(serializers.ModelSerializer):
    """Serializer for Entry model"""
    warehouse = serializers.PrimaryKeyRelatedField(write_only=True, queryset=Warehouse.objects.all())
    warehouses = WarehouseSerializer(read_only=True, source='warehouse')
    warehouse_keeper = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    suppliers = SupplierSerializer(read_only=True, source='supplier')
    supplier = serializers.PrimaryKeyRelatedField(write_only=True, queryset=Supplier.objects.all())
    entry_items = EntryItemSerializer(many=True)

    class Meta:
        model = Entry
        fields = ['id', 'warehouse', 'warehouses', 'warehouse_keeper',
                  'supplier', 'suppliers', 'entry_date', 'invoice_number',
                  'entry_items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
 
    @transaction.atomic
    def create(self, validated_data):
        try:
            items_data = validated_data.pop('entry_items')
            entry = Entry.objects.create(**validated_data)
            for item_data in items_data:
                EntryItem.objects.create(entry=entry, **item_data)
            IncreaseProductStockService(entry).increase_product_stock()
        except Exception as e:
            raise e
        return entry

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop('entry_items', None)
        try:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if items_data is not None:
                existing_items = instance.entry_items.all()
                for item in existing_items:
                    if item.id not in [item_data.get('id') for item_data in items_data if item_data.get('id')]:
                        item.delete()

                for item_data in items_data:
                    if item_data.get('id'):
                        item = existing_items.get(id=item_data['id'])
                        for attr, value in item_data.items():
                            if attr != 'id':
                                setattr(item, attr, value)
                        item.save()
                    else:
                        EntryItem.objects.create(entry=instance, **item_data)
                UpdateProductStockService(instance, {'entry_items': items_data}).update_entry_product_stock()
        except Exception as e:
            raise e

        return instance


class OutputItemSerializer(serializers.ModelSerializer):
    """Serializer for OutputItem model"""
    product_stock = serializers.PrimaryKeyRelatedField(queryset=ProductStock.objects.all())
    products_stock = ProductStockSerializer(read_only=True, source='product_stock')

    class Meta:
        model = OutputItem
        fields = ['id', 'product_stock', 'products_stock', 'quantity']
        read_only_fields = ['id']
    
class OutputSerializer(serializers.ModelSerializer):
    """Serializer for Output model"""
    warehouse = serializers.PrimaryKeyRelatedField(queryset=Warehouse.objects.all(), write_only=True)
    warehouses = WarehouseSerializer(read_only=True, source='warehouse')
    warehouse_keeper = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    clients = ClientSerializer(read_only=True, source='client')
    client = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), write_only=True)
    output_items = OutputItemSerializer(many=True)

    class Meta:
        model = Output
        fields = ['id', 'warehouse', 'warehouses', 'warehouse_keeper',
                  'client', 'clients', 'output_date', 'output_items',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    @transaction.atomic
    def create(self, validated_data):
        try:
            items_data = validated_data.pop('output_items')
            output = Output.objects.create(**validated_data)
            for item_data in items_data:
                OutputItem.objects.create(output=output, **item_data)
            DecreaseProductStockService(output).decrease_product_stock()
        except Exception as e:
            raise e

        return output
    
    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop('output_items', None)
        try:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            
            if items_data is not None:
                existing_items = instance.output_items.all()
                for item in existing_items:
                    if item.id not in [item_data.get('id') for item_data in items_data if item_data.get('id')]:
                        item.delete()
                for item_data in items_data:
                    if item_data.get('id'):
                        item = existing_items.get(id=item_data['id'])
                        for attr, value in item_data.items():
                            if attr != 'id':
                                setattr(item, attr, value)
                        item.save()
                    else:
                        OutputItem.objects.create(output=instance, **item_data)
                UpdateProductStockService(instance, {'output_items': items_data}).update_output_product_stock()
        except Exception as e:
            raise e

        return instance


class ProductChannelPriceSerializer(serializers.ModelSerializer):
    """Serializer for ProductChannelPrice model"""
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    selling_channel = serializers.PrimaryKeyRelatedField(queryset=SellingChannel.objects.all())
    
    class Meta:
        model = ProductChannelPrice
        fields = [
            'id', 'product', 'selling_channel', 'price', 
            'start_date', 'end_date'
        ]
        read_only_fields = ['id']
        
    def validate_start_date(self, value):
        """Convert empty string to None for optional date field"""
        if value == '':
            return None
        return value
    
    def validate_end_date(self, value):
        """Convert empty string to None for optional date field"""
        if value == '':
            return None
        return value
        
    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'end_date': "La fecha de fin no puede ser anterior a la fecha de inicio."
            })
            
        # Only validate duplicate product-channel assignment if selling_channel is provided
        selling_channel = data.get('selling_channel')
        if selling_channel and ProductChannelPrice.objects.filter(product=data['product'], selling_channel=selling_channel).exists():
            raise serializers.ValidationError(
                f"El producto {data['product'].id} ya está asignado a este selling channel."
            )
            
        return data


class NestedProductChannelPriceSerializer(serializers.ModelSerializer):
    """Serializer for ProductChannelPrice model when used in nested context"""
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), write_only=True)
    products = ProductSerializer(read_only=True, source='product')
    id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = ProductChannelPrice
        fields = [
            'id', 'product', 'products', 'price', 
            'start_date', 'end_date'
        ]
        read_only_fields = ['id']
        
    def validate_start_date(self, value):
        """Convert empty string to None for optional date field"""
        if value == '':
            return None
        return value
    
    def validate_end_date(self, value):
        """Convert empty string to None for optional date field"""
        if value == '':
            return None
        return value
        
    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'end_date': "La fecha de fin no puede ser anterior a la fecha de inicio."
            })
            
        return data
    
    
class SellingChannelSerializer(serializers.ModelSerializer):
    """Serializer for Selling Channel model."""
    product_channel_price = NestedProductChannelPriceSerializer(many=True, required=False)

    class Meta:
        model = SellingChannel
        fields = ['id', 'product_channel_price', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    @transaction.atomic
    def create(self, validated_data):
        products_channel_data = validated_data.pop('product_channel_price', [])
        try:
            selling_channel = SellingChannel.objects.create(**validated_data)

            for product_channel_data in products_channel_data:
                ProductChannelPrice.objects.create(selling_channel=selling_channel, **product_channel_data)
        except Exception as e:
            raise e
        
        return selling_channel
    
    def update(self, instance, validated_data):
        products_channel_data = validated_data.pop('product_channel_price', None)
        try:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if products_channel_data is not None:
                existing_items = instance.product_channel_price.all()

                for item in existing_items:
                    if item.id not in [item_data.get('id') for item_data in products_channel_data if item_data.get('id')]:
                        item.delete()
                for item_data in products_channel_data:
                    if item_data.get('id'):
                        item = existing_items.get(id=item_data['id'])
                        for attr, value in item_data.items():
                            if attr != 'id':
                                setattr(item, attr, value)
                        item.save()
                    else:
                        item_data_copy = item_data.copy()
                        item_data_copy.pop('selling_channel', None)
                        ProductChannelPrice.objects.create(selling_channel=instance, **item_data_copy)
        except Exception as e:
            raise e

        return instance


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model."""

    class Meta:
        model = Payment
        fields = ['id', 'transaction_id', 'payment_method', 'transaction_type', 'amount', 'payment_date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def validate(self, data):
        # For partial updates, get missing fields from the instance
        transaction_type = data.get('transaction_type')
        transaction_id = data.get('transaction_id')
        payment_date = data.get('payment_date')
        
        # Only validate if we have all required fields
        if transaction_type and transaction_id and payment_date:
            if transaction_type == 'compra':
                transaction_date = Purchase.objects.get(id=transaction_id).purchase_date
            elif transaction_type == 'venta':
                transaction_date = Sale.objects.get(id=transaction_id).sale_date
            
            if payment_date < transaction_date:
                raise serializers.ValidationError({
                        "payment_date": "La fecha de pago no puede ser anterior a la fecha de compra/venta."
                })

        return data


class PurchaseItemSerializer(serializers.ModelSerializer):
    """Serializer for Purchase Item model."""
    products_stock = ProductStockSerializer(read_only=True, source='product_stock')
    product_stock = serializers.PrimaryKeyRelatedField(
        queryset=ProductStock.objects.all(),
        write_only=True,
    )
    
    class Meta:
        model = PurchaseItem
        fields = ['product_stock', 'products_stock', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['id', 'created_at', 'updated_at']


class NestedPaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model when nested in Purchase."""
    
    class Meta:
        model = Payment
        fields = ['id', 'transaction_id', 'payment_method', 'transaction_type', 'amount', 'payment_date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'transaction_id', 'created_at', 'updated_at']


class PurchaseSerializer(serializers.ModelSerializer):
    """Serializer for Purchase model."""
    purchase_items = PurchaseItemSerializer(many=True, required=True)
    suppliers = SupplierSerializer(read_only=True, source='supplier')
    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(),
        write_only=True,
    )
    payments = NestedPaymentSerializer(required=False)
    buyer = UserSerializer(read_only=True)

    class Meta:
        model = Purchase
        fields = [
            'id',
            'agency',
            'buyer',
            'payments',
            'purchase_items',
            'supplier',
            'suppliers',
            'purchase_type',
            'purchase_date',
            'purchase_end_date',
            'invoice_number',
            'total',
            'balance_due',
            'status',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        """Custom representation to include payments in GET requests."""
        data = super().to_representation(instance)
        # Get payments for this purchase
        payments = Payment.objects.filter(
            transaction_id=instance.id,
            transaction_type='compra'
        )
        data['payments'] = NestedPaymentSerializer(payments, many=True).data
        return data
        
    def validate(self, data):
        if data.get('purchase_date') and data.get('payments'):
            if data['payments']['payment_date'] < data['purchase_date']:
                raise serializers.ValidationError({
                    "payments": {
                        "payment_date": "La fecha de pago no puede ser menor a la fecha de compra."
                    }
                })
        return data

    @transaction.atomic
    def create(self, validated_data):
        try:
            items_data = validated_data.pop('purchase_items', [])
            payment_data = validated_data.pop('payments', None)
            payment_amount = payment_data['amount']
            purchase_total_amount = validated_data['balance_due']
            if purchase_total_amount - payment_amount < 0:
                raise serializers.ValidationError({
                    "payments": {
                        "amount": "El pago no puede ser mayor al costo total."
                    }
                })
            validated_data['balance_due'] -= payment_amount
            purchase = Purchase.objects.create(**validated_data)
            for item_data in items_data:
                PurchaseItem.objects.create(purchase=purchase, **item_data)

            Payment.objects.create(transaction_id=purchase.id, **payment_data)
        except Exception as e:
            raise e

        return purchase


class SaleItemSerializer(serializers.ModelSerializer):
    """Serializer for Sale Item model."""
    products_stock = ProductStockSerializer(read_only=True, source='product_stock')
    product_stock = serializers.PrimaryKeyRelatedField(
        queryset=ProductStock.objects.all(),
        write_only=True,
    )
    id = serializers.IntegerField(required=False, allow_null=True)

    def validate(self, data):
        if data.get('product') is not None and data.get('quantity') is not None and data.get('total_price') is not None:
            if data['product'].available_stock - data['quantity'] < 0:
                raise serializers.ValidationError({
                    'quantity': "No se puede vender una cantidad mayor al stock actual."
                })
            if data['total_price'] < data['product'].minimum_sale_price or data['total_price'] > data['product'].maximum_sale_price:
                raise serializers.ValidationError({
                    'total_price': "El total de la venta no puede estar fuera de los rangos de venta."
                })
        return data

    class Meta:
        model = SaleItem
        fields = ['id', 'product_stock', 'products_stock', 'quantity', 'unit_price', 'sub_total_price', 'discount', 'total_price']


class SaleSerializer(serializers.ModelSerializer):
    """Serializer for Sale model."""
    selling_channels = SellingChannelSerializer(read_only=True, source='selling_channel')
    selling_channel = serializers.PrimaryKeyRelatedField(
        queryset=SellingChannel.objects.all(),
        write_only=True,
    )
    sale_items = SaleItemSerializer(many=True, required=True)
    clients = ClientSerializer(read_only=True, source='client')
    client = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        write_only=True,
    )
    payments = NestedPaymentSerializer(required=False)
    seller = UserSerializer(read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id',
            'seller',
            'agency',
            'payments',
            'selling_channel',
            'selling_channels',
            'sale_items',
            'total',
            'balance_due',
            'status',
            'sale_type',
            'sale_date',
            'sale_perform_date',
            'sale_done_date',
            'client',
            'clients',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        """Custom representation to include payments in GET requests."""
        data = super().to_representation(instance)
        # Get payments for this sale
        payments = Payment.objects.filter(
            transaction_id=instance.id,
            transaction_type='venta'
        )
        data['payments'] = NestedPaymentSerializer(payments, many=True).data
        return data

    def validate(self, data):
        if data.get('sale_date') and data.get('payments'):
            if data['payments']['payment_date'] < data['sale_date']:
                raise serializers.ValidationError({
                    "payments": {
                        "payment_date": "La fecha de pago no puede ser menor a la fecha de venta."
                    }
                })
        return data

    @transaction.atomic
    def create(self, validated_data):
        try:
            items_data = validated_data.pop('sale_items', [])
            sale = Sale.objects.create(**validated_data)
            for item_data in items_data:
                SaleItem.objects.create(sale=sale, **item_data)
        except Exception as e:
            raise e

        return sale
    
    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop('sale_items', None)
        payments_data = validated_data.pop('payments', None)
        try:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if items_data is not None:
                existing_items = instance.sale_items.all()
                for item in existing_items:
                    if item.id not in [item_data.get('id') for item_data in items_data if item_data.get('id')]:
                        item.delete()
                
                for item_data in items_data:
                    if item_data.get('id'):
                        item = existing_items.get(id=item_data['id'])
                        for attr, value in item_data.items():
                                if attr != 'id':
                                    setattr(item, attr, value)
                        item.save()
                    else:
                        SaleItem.objects.create(sale=instance, **item_data)
                    
                    # Actualizar stock para productos existentes y nuevos cuando el status es 'realizado'
                    if validated_data['status'] == 'realizado':
                        item_data['product'].reserved_stock += item_data['quantity']
                        item_data['product'].available_stock -= item_data['quantity']
                        item_data['product'].save()
                        
            if payments_data is not None:
                payment_amount = payments_data['amount']
                purchase_total_amount = instance.balance_due
                if purchase_total_amount - payment_amount < 0:
                    raise serializers.ValidationError({
                        "payments": {
                            "amount": "El pago no puede ser mayor al costo total."
                        }
                    })
                instance.balance_due -= payment_amount
                instance.save()
                Payment.objects.create(transaction_id=instance.id, **payments_data)
        except Exception as e:
            raise e

        return instance
