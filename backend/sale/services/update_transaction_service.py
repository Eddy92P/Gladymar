"""
Service to update a sale/purchase balance_due when a payment is done.
"""
from django.core.exceptions import ValidationError
from core.models import Purchase, Sale
import logging

logger = logging.getLogger(__name__)


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
                raise ValidationError(
                    f'Tipo de transacción no válido: {self.transaction_type}')

            if transaction.balance_due - self.payment_amount < 0:
                raise ValidationError('El pago excede el saldo pendiente.')

            amount_to_deduct = self.payment_amount
            if (
                self.transaction_type == 'venta'
                and transaction.credit_balance > 0
            ):
                amount_to_deduct -= transaction.credit_balance
            transaction.balance_due -= amount_to_deduct
            transaction.save(update_fields=['balance_due'])
        except Exception as e:
            logger.error(f"Error updating transaction balance due: {e}")
            raise e

    def update_transaction_credit_balance(self):
        """Update credit balance when an advance payment is done."""
        try:
            if self.transaction_type == 'venta':
                transaction = Sale.objects.get(id=self.transaction_id)
            else:
                raise ValidationError(
                    f'Tipo de transacción no válido: {self.transaction_type}')

            if (
                transaction.credit_balance + self.payment_amount
                > transaction.total
            ):
                raise ValidationError('El pago excede el total de la venta.')

            transaction.credit_balance += self.payment_amount
            transaction.save(update_fields=['credit_balance'])
        except Exception as e:
            logger.error(f"Error updating transaction credit balance: {e}")
            raise e
