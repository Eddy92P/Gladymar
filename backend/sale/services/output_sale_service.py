"""
Service to update a sale item when an output is done.
"""
from django.core.exceptions import ValidationError


class UpdateSaleItem:
    def __init__(self, output_item, product_stock):
        self.output_item = output_item
        self.product_stock = product_stock
        
    def update_sale_item(self):
        sale_item = self.output_item.sale_item
        try:
            if sale_item.dispatched_stock + self.output_item.quantity > sale_item.quantity:
                raise ValidationError("La cantidad despachada excede la cantidad vendida.")
            self.product_stock.reserved_stock -= self.output_item.quantity
            sale_item.dispatched_stock += self.output_item.quantity
            sale_item.save()
        except Exception as e:
            raise e
