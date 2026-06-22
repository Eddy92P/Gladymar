"""
Service to update a sale item when an output is done.
"""
from django.core.exceptions import ValidationError
from django.db.models import F
from core.models import SaleItem
import logging

logger = logging.getLogger(__name__)


class UpdateSaleItem:
    def __init__(self, output_item, product_stock):
        self.output_item = output_item
        self.product_stock = product_stock

    def update_sale_item(self):
        sale_item = self.output_item.sale_item
        try:
            updated = SaleItem.objects.filter(
                id=sale_item.id,
                dispatched_stock__lte=(
                    F('quantity') - self.output_item.quantity
                )
            ).update(
                dispatched_stock=(
                    F('dispatched_stock') + self.output_item.quantity
                )
            )
            if updated == 0:
                raise ValidationError(
                    "La cantidad despachada excede la cantidad vendida.")

            sale_item.refresh_from_db()

            if sale_item.dispatched_stock < sale_item.quantity:
                sale_item.status = 'parcial'
            if sale_item.dispatched_stock == sale_item.quantity:
                sale_item.status = 'completado'
            sale_item.save()
        except Exception as e:
            logger.error(f"Error updating sale item: {e}")
            raise e
