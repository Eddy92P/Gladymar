"""
Serializers for warehouse app
"""

from django.db import transaction
from rest_framework import serializers
from core.models import *
from sale.services.entries_service import IncreaseProductStockService
from sale.services.update_product_stock_service import UpdateProductStockService
from sale.services.output_service import DecreaseProductStockService


class AgencySerializer(serializers.ModelSerializer):
    """Serializer for Agency model"""

    class Meta:
        model = Agency
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class WarehouseSerializer(serializers.ModelSerializer):
    """Serializer for Warehouse model"""

    class Meta:
        model = Warehouse
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
        

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""

    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

        
class BatchSerializer(serializers.ModelSerializer):
    """Serializer for Batch model"""

    class Meta:
        model = Batch
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""

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
        return data


class SupplierSerializer(serializers.ModelSerializer):
    """Serializer for Supplier model"""
    products = ProductSerializer(many=True, read_only=True, source='product')
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

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            existing_items = instance.entry_items.all()
            try:
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
        items_data = validated_data.pop('output_items')
        output = Output.objects.create(**validated_data)
        for item_data in items_data:
            OutputItem.objects.create(output=output, **item_data)
        DecreaseProductStockService(output).decrease_product_stock()
        return output
    
    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop('output_items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if items_data is not None:
            existing_items = instance.output_items.all()
            try:
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
    product_name = serializers.CharField(source='product.name', read_only=True)
    selling_channel_name = serializers.CharField(source='selling_channel.name', read_only=True)
    
    class Meta:
        model = ProductChannelPrice
        fields = [
            'id', 'product', 'selling_channel', 'price', 
            'start_date', 'end_date', 'product_name', 'selling_channel_name'
        ]
        read_only_fields = ['id']
        
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
    products = ProductSerializer(many=True, read_only=True, source='product')
    product_prices = ProductChannelPriceSerializer(many=True, read_only=True, source='productchannelprice_set')
    product_prices_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = SellingChannel
        fields = ['id', 'name', 'products', 'product_prices', 'product_prices_data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_product_prices_data(self, value):
        """Validate product prices data."""
        if value:
            for item_data in value:
                # Create a copy of item_data for validation
                validation_data = item_data.copy()

                # Validate required fields manually
                if 'product' not in validation_data:
                    raise serializers.ValidationError("El campo 'product' es requerido.")
                if 'price' not in validation_data:
                    raise serializers.ValidationError("El campo 'price' es requerido.")

                # Validate price is positive
                if validation_data.get('price') and validation_data['price'] <= 0:
                    raise serializers.ValidationError("El precio debe ser mayor a 0.")

                # Validate dates if provided
                start_date = validation_data.get('start_date')
                end_date = validation_data.get('end_date')
                
                if start_date and end_date and start_date > end_date:
                    raise serializers.ValidationError({
                        'end_date': "La fecha de fin no puede ser anterior a la fecha de inicio."
                    })
        return value
        
    def validate(self, data):
        """Validate product prices data."""
        product_prices_data = data.get('product_prices_data', [])
        
        # Validate that all products in product_prices_data have valid data
        if product_prices_data:
            product_ids = set()
            for item in product_prices_data:
                if 'product' in item:
                    product_ids.add(item['product'])
            
            # Check for duplicate products
            if len(product_ids) != len(product_prices_data):
                raise serializers.ValidationError({
                    'product_prices_data': "No puede haber productos duplicados en la lista de precios."
                })
        
        return data

    def create(self, validated_data):
        items_data = validated_data.pop('product_prices_data', [])
        
        # Create selling channel without products first
        selling_channel = SellingChannel.objects.create(**validated_data)
        
        # Create product prices (this will automatically establish the many-to-many relationship)
        for item_data in items_data:
            # Convert product ID to Product instance
            product_id = item_data.pop('product')
            product = Product.objects.get(id=product_id)
            ProductChannelPrice.objects.create(selling_channel=selling_channel, product=product, **item_data)

        return selling_channel

    def update(self, instance, validated_data):
        items_data = validated_data.pop('product_prices_data', [])

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update product prices if provided
        if items_data is not None:
            existing_items = instance.productchannelprice_set.all()
            try:
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
                        # Convert product ID to Product instance
                        product_id = item_data.pop('product')
                        product = Product.objects.get(id=product_id)
                        ProductChannelPrice.objects.create(selling_channel=instance, product=product, **item_data)
            except Exception as e:
                raise e

        return instance 


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

        
class PurchaseSerializer(serializers.ModelSerializer):
    """Serializer for Purchase model."""
    buyer = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    purchase_items = PurchaseItemSerializer(many=True, required=True)
    suppliers = SupplierSerializer(read_only=True, source='supplier')
    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(),
        write_only=True,
    )

    class Meta:
        model = Purchase
        fields = [
            'id',
            'buyer',
            'purchase_items',
            'supplier',
            'suppliers',
            'purchase_type',
            'purchase_date',
            'invoice_number',
            'total',
            'balance_due',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('purchase_items', [])
        purchase = Purchase.objects.create(**validated_data)
        for item_data in items_data:
            PurchaseItem.objects.create(purchase=purchase, **item_data)
        return purchase

    def update(self, instance, validated_data):
        items_data = validated_data.pop('purchase_items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            existing_items = instance.purchase_items.all()
            try:
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
    seller = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    sale_items = SaleItemSerializer(many=True, required=True)
    clients = ClientSerializer(read_only=True, source='client')
    client = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        write_only=True,
    )
    
    class Meta:
        model = Sale
        fields = [
            'id',
            'selling_channel',
            'selling_channels',
            'seller',
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
        
    def create(self, validated_data):
        items_data = validated_data.pop('sale_items', [])
        sale = Sale.objects.create(**validated_data)
        for item_data in items_data:
            SaleItem.objects.create(sale=sale, **item_data)

        return sale
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('sale_items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        try:
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
    
    
class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model."""

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
