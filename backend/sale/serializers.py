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

    class Meta:
        model = Warehouse
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
        

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    warehouse = WarehouseSerializer(read_only=True)
    warehouse_id = serializers.PrimaryKeyRelatedField(
        queryset=Warehouse.objects.all(),
        source='warehouse',
        write_only=True
    )

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
        if data.get('minimum_stock') and data.get('maximum_stock'):
            if data['minimum_stock'] > data['maximum_stock']:
                raise serializers.ValidationError({
                    'minimum_stock': "El stock mínimo no puede ser mayor al máximo."
                })
        if data.get('minimum_sale_price') and data.get('maximum_sale_price'):
            if data['minimum_sale_price'] > data['maximum_sale_price']:
                raise serializers.ValidationError({
                    'minimum_sale_price': "El precio de venta mínimo no puede ser mayor al máximo."
                })
                
        if data.get('stock') and data.get('maximum_stock'):
            if data['stock'] > data['maximum_stock']:
                raise serializers.ValidationError({
                    'stock': "El stock no puede ser mayor al máximo."
                })
                
        if data.get('stock') and data.get('minimum_stock'):
            if data['stock'] < data['minimum_stock']:
                raise serializers.ValidationError({
                    'stock': "El stock no puede ser menor al mínimo."
                })
        
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
    products = ProductSerializer(read_only=True, source='product')
    product = serializers.PrimaryKeyRelatedField(write_only=True, queryset=Product.objects.all())

    class Meta:
        model = EntryItem
        fields = ['id', 'product', 'products', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['id']


class EntrySerializer(serializers.ModelSerializer):
    """Serializer for Entry model"""
    warehouse_keeper = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    suppliers = SupplierSerializer(read_only=True, source='supplier')
    supplier = serializers.PrimaryKeyRelatedField(write_only=True, queryset=Supplier.objects.all())
    entry_items = EntryItemSerializer(many=True)

    class Meta:
        model = Entry
        fields = ['id', 'warehouse_keeper', 'supplier', 'suppliers', 'entry_date', 'invoice_number', 'entry_items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
 
    @transaction.atomic
    def create(self, validated_data):
        try:
            items_data = validated_data.pop('entry_items')
            entry = Entry.objects.create(**validated_data)
            for item_data in items_data:
                entry_item = EntryItem.objects.create(entry=entry, **item_data)
                entry_item.product.suppliers.add(entry.supplier)
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
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = OutputItem
        fields = ['id', 'product', 'quantity']
        read_only_fields = ['id']
    
class OutputSerializer(serializers.ModelSerializer):
    """Serializer for Output model"""
    warehouse_keeper = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    clients = ClientSerializer(read_only=True, source='client')
    client = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), write_only=True)
    output_items = OutputItemSerializer(many=True)

    class Meta:
        model = Output
        fields = ['id', 'warehouse_keeper', 'client', 'clients', 'output_date', 'output_items', 'created_at', 'updated_at']
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


class PurchaseItemSerializer(serializers.ModelSerializer):
    """Serializer for Purchase Item model."""
    products = ProductSerializer(read_only=True, source='product')
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        write_only=True,
    )
    
    class Meta:
        model = PurchaseItem
        fields = ['product', 'products', 'quantity', 'unit_price', 'total_price']
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

    class Meta:
        model = Purchase
        fields = [
            'id',
            'payments',
            'purchase_items',
            'supplier',
            'suppliers',
            'purchase_type',
            'purchase_date',
            'invoice_number',
            'total',
            'balance_due',
            'status',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        
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
            purchase = Purchase.objects.create(**validated_data)
            for item_data in items_data:
                PurchaseItem.objects.create(purchase=purchase, **item_data)

            if payment_data:
                payment = Payment.objects.create(transaction_id=purchase.id, **payment_data)
                UpdateTransactionService(purchase.id, payment.amount, payment.transaction_type).update_transaction_balance_due()
        except Exception as e:
            raise e
        
        return purchase

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop('purchase_items', None)
        try:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if items_data is not None:
                existing_items = instance.purchase_items.all()

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
                        PurchaseItem.objects.create(purchase=instance, **item_data)
        except Exception as e:
            raise e

        return instance
    
    
class SaleItemSerializer(serializers.ModelSerializer):
    """Serializer for Sale Item model."""
    products = ProductSerializer(read_only=True, source='product')
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        write_only=True,
    )
    
    class Meta:
        model = SaleItem
        fields = ['product', 'products', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['id']
    
    
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
    
    class Meta:
        model = Sale
        fields = [
            'id',
            'payments',
            'selling_channel',
            'selling_channels',
            'sale_items',
            'total',
            'balance_due',
            'status',
            'sale_type',
            'sale_date',
            'client',
            'clients',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        
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
            payment_data = validated_data.pop('payments', None)
            sale = Sale.objects.create(**validated_data)
            for item_data in items_data:
                SaleItem.objects.create(sale=sale, **item_data)

            if payment_data:
                payment = Payment.objects.create(transaction_id=sale.id, **payment_data)
                UpdateTransactionService(sale.id, payment.amount, payment.transaction_type).update_transaction_balance_due()
        except Exception as e:
            raise e

        return sale
    
    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop('sale_items', None)
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
        except Exception as e:
            raise e
        
        return instance
