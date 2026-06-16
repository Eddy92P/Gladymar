"""
Service to increase product stock when an entry is created
"""

import logging

logger = logging.getLogger(__name__)

class IncreaseProductStockService:
    def __init__(self, entry_item):
        self.entry_item = entry_item

    def increase_product_stock(self):
        """
        Increase product stock and available stock when an entry is created
        """
        try:
            product = self.entry_item.product_stock
            product.stock += self.entry_item.quantity
            product.available_stock += self.entry_item.quantity
            product.save()

        except Exception as e:
            logger.error(f"Error increasing product stock: {e}")
            raise e
