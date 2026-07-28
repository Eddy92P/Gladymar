"""
Service to update product stock when an output is updated
"""

from decimal import Decimal
from django.db.models import F
from django.core.exceptions import ValidationError
from core.models import ProductStock
import logging

logger = logging.getLogger(__name__)


class DecreaseProductStockService:
    def __init__(self, output_item, product_stock, sale_item_exists):
        self.output_item = output_item
        self.product_stock = product_stock
        self.sale_item_exists = sale_item_exists

    def decrease_product_stock(self):
        """
        Decrease product stock when an output is created
        """
        try:
            quantity = Decimal(str(self.output_item.quantity))
            updated = ProductStock.objects.filter(
                id=self.product_stock.id,
                stock__gte=quantity
            ).update(
                stock=F('stock') - quantity,
                reserved_stock=F('reserved_stock') - quantity if self.sale_item_exists else F('reserved_stock')
            )
            if updated == 0:
                raise ValidationError(
                    "La cantidad excede el stock real disponible.")
        except Exception as e:
            logger.error(f"Error decreasing product stock: {e}")
            raise e
