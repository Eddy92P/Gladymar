"""
Service to increase product stock when an entry is created
"""


class IncreaseProductStockService:
    def __init__(self, entry_item):
        self.entry_item = entry_item

    def increase_product_stock(self):
        """
        Increase product stock when an entry is created
        """
        try:
            product = self.entry_item.product_stock
            product.stock += self.entry_item.quantity
            product.save()

        except Exception as e:
            raise e
