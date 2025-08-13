"""
Service to update product stock when an output is updated
"""

from django.core.exceptions import ValidationError


class DecreaseProductStockService:
    def __init__(self, output):
        self.output = output
        
    def decrease_product_stock(self):
        """
        Decrease product stock when an output is created
        """
        try:
            for item in self.output.output_items.all():
                product = item.product
                if product.minimum_stock > 0:
                    if product.stock - item.quantity < product.minimum_stock:
                        raise ValidationError("El stock no puede ser menor al stock mínimo.")
                    product.stock -= item.quantity
                    product.save()
        except Exception as e:
            raise e
