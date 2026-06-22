"""
Service to update product stock when an output is updated
"""

from django.db.models import F
from django.core.exceptions import ValidationError
from core.models import ProductStock
import logging

logger = logging.getLogger(__name__)


class DecreaseProductStockService:
    def __init__(self, output_item, product_stock):
        self.output_item = output_item
        self.product_stock = product_stock

    def decrease_product_stock(self):
        """
        Decrease product stock when an output is created
        """
        try:
            updated = ProductStock.objects.filter(
                id=self.product_stock.id,
                stock__gte=self.output_item.quantity
            ).update(
                stock=F('stock') - self.output_item.quantity,
                reserved_stock=F('reserved_stock') - self.output_item.quantity
            )
            if updated == 0:
                raise ValidationError(
                    "La cantidad excede el stock disponible.")
        except Exception as e:
            logger.error(f"Error decreasing product stock: {e}")
            raise e
