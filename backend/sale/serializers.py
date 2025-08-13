"""
Serializers for warehouse app
"""

from django.db import transaction
from rest_framework import serializers
from core.models import (
    Warehouse,
    Category,
    Batch,
    Product,
    Entry,
    Supplier,
    EntryItem,
    Output,
    OutputItem,
    Client,
    User,
    Agency,
)
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


class ClientSerializer(serializers.ModelSerializer):
    """Serializer for Client model"""
    
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class SupplierSerializer(serializers.ModelSerializer):
    """Serializer for Supplier model"""

    class Meta:
        model = Supplier
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class EntryItemSerializer(serializers.ModelSerializer):
    """Serializer for EntryItem model"""
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = EntryItem
        fields = ['id', 'product', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['id']


class EntrySerializer(serializers.ModelSerializer):
    """Serializer for Entry model"""
    warehouse_keeper = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    entry_items = EntryItemSerializer(many=True)

    class Meta:
        model = Entry
        fields = ['id', 'warehouse_keeper', 'supplier', 'entry_date', 'invoice_number', 'entry_items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    @transaction.atomic
    def create(self, validated_data):
        try:
            items_data = validated_data.pop('entry_items')
            entry = Entry.objects.create(**validated_data)
            for item_data in items_data:
                entry_item = EntryItem.objects.create(entry=entry, **item_data)
                entry_item.product.supplier.add(entry.supplier)
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
    client = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all())
    output_items = OutputItemSerializer(many=True)

    class Meta:
        model = Output
        fields = ['id', 'warehouse_keeper', 'client', 'output_date', 'output_items', 'created_at', 'updated_at']
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
    
    
class SaleSerializer(serializers.ModelSerializer):
    """Serializer for Sale model."""
    
