"""
Service to update product stock when an output is updated
"""

from django.core.exceptions import ValidationError


class DecreaseProductStockService:
    def __init__(self, output_item, product_stock):
        self.output_item = output_item
        self.product_stock = product_stock
        
    def decrease_product_stock(self):
        """
        Decrease product stock when an output is created
        """
        try:
            if self.product_stock.stock - self.output_item.quantity < 0:
                raise ValidationError("La cantidad excede el stock disponible.")
            self.product_stock.stock -= self.output_item.quantity
            self.product_stock.save()
        except Exception as e:
            raise e
