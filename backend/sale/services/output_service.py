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
                product_stock = item.product_stock
                if product_stock.available_stock - item.quantity < 0:
                    raise ValidationError("La cantidad excede el stock disponible.")
                product_stock.stock -= item.quantity
                product_stock.save()
        except Exception as e:
            raise e
