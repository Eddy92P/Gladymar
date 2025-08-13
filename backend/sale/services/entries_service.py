"""
Service to increase product stock when an entry is created
"""

from django.core.exceptions import ValidationError


class IncreaseProductStockService:
    def __init__(self, entry):
        self.entry = entry

    def increase_product_stock(self):
        """
        Increase product stock when an entry is created
        """
        try:
            for item in self.entry.entry_items.all():
                product = item.product
                if product.maximum_stock > 0:
                    if product.stock + item.quantity > product.maximum_stock:
                        raise ValidationError("El stock máximo no puede ser superado.")
                    product.stock += item.quantity
                    product.save()

        except Exception as e:
            raise e
