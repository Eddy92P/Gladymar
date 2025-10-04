"""
Service to handle update of purchase items when an entry is done
"""
from django.core.exceptions import ValidationError


class UpdatePurchaseItem:
    def __init__(self, entry_item):
        self.entry_item = entry_item
        
    def update_purchase_item(self):
        """
        Update purchase item
        """
        try:
            purchase_item = self.entry_item.purchase_item
            if purchase_item.entered_stock + self.entry_item.quantity > purchase_item.quantity:
                raise ValidationError("La cantidad ingresada excede la cantidad comprada.")
            purchase_item.entered_stock += self.entry_item.quantity
            purchase_item.save()
        except Exception as e:
            raise e
