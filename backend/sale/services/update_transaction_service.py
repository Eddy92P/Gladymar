"""
Service to update a sale/purchase balance_due when a payment is done.
"""
from django.core.exceptions import ValidationError
from core.models import Purchase, Sale


class UpdateTransactionService:
    def __init__(self, transaction_id, payment_amount, transaction_type):
        self.transaction_id = transaction_id
        self.payment_amount = payment_amount
        self.transaction_type = transaction_type
        
    def update_transaction_balance_due(self):
        """Update balance due when a payment is done."""
        try:
            if self.transaction_type == 'compra':
                transaction = Purchase.objects.get(id=self.transaction_id)
            elif self.transaction_type == 'venta':
                transaction = Sale.objects.get(id=self.transaction_id)
            else:
                raise ValidationError(f'Tipo de transacción no válido: {self.transaction_type}')

            if transaction.balance_due - self.payment_amount < 0:
                raise ValidationError('El pago excede el saldo pendiente.')

            transaction.balance_due -= self.payment_amount
            transaction.save(update_fields=['balance_due'])
        except Exception as e:
            raise e
