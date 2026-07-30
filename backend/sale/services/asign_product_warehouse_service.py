"""
Service to assign a product to a warehouse
"""

import logging
from decimal import Decimal
from core.models import ProductStock

logger = logging.getLogger(__name__)


class AssignProductWarehouseService:
    def __init__(self, product, warehouse, quantity):
        self.product = product
        self.warehouse = warehouse
        self.quantity = Decimal(str(quantity))

    def assign_product_warehouse(self):
        """
        Get or create the ProductStock for the product/warehouse, increasing
        its stock and available stock. Returns the ProductStock instance.
        """
        try:
            product_stock, created = ProductStock.objects.get_or_create(
                product=self.product,
                warehouse=self.warehouse,
                defaults={
                    'stock': self.quantity,
                    'available_stock': self.quantity,
                }
            )
            if not created:
                product_stock.stock += self.quantity
                product_stock.available_stock += self.quantity
                product_stock.save(update_fields=['stock', 'available_stock'])

            return product_stock
        except Exception as e:
            logger.error(f"Error assigning product warehouse: {e}")
            raise e
