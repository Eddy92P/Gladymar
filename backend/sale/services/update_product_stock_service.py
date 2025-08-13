"""
Service to update product stock when an entry is updated
"""

from django.core.exceptions import ValidationError

class UpdateProductStockService:
    def __init__(self, existing_data, validated_data):
        self.existing_data = existing_data
        self.validated_data = validated_data

    def update_entry_product_stock(self):
        """
        Update product stock when an entry is updated
        """
        try:
            for item in self.existing_data.entry_items.all():
                previous_item_quantity = item.quantity
                actual_item_quantity = next(
                    (item_data.get('quantity') for item_data in self.validated_data.get('entry_items', []) 
                     if item_data.get('id') == item.id), 
                    previous_item_quantity
                )
                product = item.product
                if actual_item_quantity > previous_item_quantity or actual_item_quantity < previous_item_quantity:
                    new_item_quantity = actual_item_quantity - previous_item_quantity
                    if product.stock + new_item_quantity > product.maximum_stock:
                        raise ValidationError('El nuevo stock no puede ser mayor al máximo permitido.')
                    product.stock += new_item_quantity
                    product.save()
        except Exception as e:
            raise e
        
    def update_output_product_stock(self):
        """
        Update product stock when an output is updated
        """
        try:
            for item in self.existing_data.output_items.all():
                previous_item_quantity = item.quantity
                actual_item_quantity = next(
                    (item_data.get('quantity') for item_data in self.validated_data.get('output_items', []) 
                     if item_data.get('id') == item.id), 
                    previous_item_quantity
                )
                product = item.product
                if actual_item_quantity > previous_item_quantity or actual_item_quantity < previous_item_quantity:
                    new_item_quantity = actual_item_quantity - previous_item_quantity
                    if product.stock - new_item_quantity < product.minimum_stock:
                        raise ValidationError('El nuevo stock no puede ser menor al mínimo permitido.')
                    product.stock -= new_item_quantity
                    product.save()
        except Exception as e:
            raise e
        