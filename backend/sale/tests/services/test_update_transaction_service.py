"""
Tests for update transaction service.
"""
from sale.services.update_transaction_service import UpdateTransactionService

from core.models import Agency, Warehouse, Category, Batch, Product, Purchase, Supplier, Payment, Sale, Client, SellingChannel
from django.contrib.auth import get_user_model
from unittest import TestCase
from django.core.exceptions import ValidationError
import uuid

def create_user(**params):
    """Create and return a sample user."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'first_name': 'Test',
        'last_name': 'User',
        'ci': f'1234567{unique_suffix}',
        'phone': '12345678',
        'address': 'Test Address',
        'email': f't{unique_suffix}@test.com',
    }
    defaults.update(params)
    return get_user_model().objects.create_user(**defaults)

def create_client(**params):
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'name': 'Test Client',
        'phone': '79434113',
        'nit': f'123{unique_suffix}',
        'email': f'test{unique_suffix}@gmail.com',
        'address': 'Test Address',
        'client_type': 'showroom'
    }
    defaults.update(params)
    
    return Client.objects.create(**defaults)

def create_selling_channel(**params):
    defaults = {
        'name': 'Test selling channel',
    }
    defaults.update(params)
    return SellingChannel.objects.create(**defaults)


class UpdateTransactionServiceTest(TestCase):
    def setUp(self):
        self.product = self.create_test_product()
        
    def create_test_product(self, **kwargs):
        unique_suffix = str(uuid.uuid4())[:8]
        agency = Agency.objects.create(
            name = f'Test Warehouse{unique_suffix}',
            location = 'Test Location',
        )
        warehouse = Warehouse.objects.create(
            agency=agency,
            name = f'Test Warehouse{unique_suffix}',
            location = 'Test Location',
        )
        category = Category.objects.create(
            warehouse = warehouse,
            name = f'Test Category{unique_suffix}',
        )
        batch = Batch.objects.create(
            category = category,
            name = f'Test Batch{unique_suffix}',
        )
        defaults = {
            'name': f'Test Product{unique_suffix}',
            'batch': batch,
            'stock': 50,
            'code': f'TEST-{unique_suffix}',
            'unit_of_measurement': 'Unit',
            'minimum_stock': 10,
            'maximum_stock': 200,
            'minimum_sale_price': 10.00,
            'maximum_sale_price': 100.00
        }
        defaults.update(kwargs)

        return Product.objects.create(**defaults)
    
    def test_update_purchase_balance_due(self):
        """Test for update balance due when a payment is done for a purchase."""
        unique_suffix = str(uuid.uuid4())[:8]
        purchase = Purchase.objects.create(
            buyer=create_user(),
            supplier = Supplier.objects.create(
                name=f'Test Supplier{unique_suffix}',
                phone='12345678',
                nit=f'NIT-{unique_suffix}',
                email=f'test{unique_suffix}@example.com',
                address='Test Address'
            ),
            purchase_type='contado',
            purchase_date='2025-05-05',
            invoice_number='12345678',
            total=100,
            balance_due=100,
        )
        
        payment = Payment.objects.create(
            transaction_id=purchase.id,
            payment_method='efectivo',
            transaction_type='compra',
            amount=50,
            payment_date='2025-05-06',
        )
        
        service = UpdateTransactionService(purchase.id, payment.amount, payment.transaction_type)
        service.update_transaction_balance_due()
        
        purchase.refresh_from_db()
        self.assertEqual(purchase.balance_due, 50)
        
    def test_update_purchase_balance_due_payment_exceeds(self):
        """Test for update balance due when a payment is done for a purchase but the payment exceeds the balance."""
        unique_suffix = str(uuid.uuid4())[:8]
        purchase = Purchase.objects.create(
            buyer=create_user(),
            supplier = Supplier.objects.create(
                name=f'Test Supplier{unique_suffix}',
                phone='12345678',
                nit=f'NIT-{unique_suffix}',
                email=f'test{unique_suffix}@example.com',
                address='Test Address'
            ),
            purchase_type='contado',
            purchase_date='2025-05-05',
            invoice_number='12345678',
            total=100,
            balance_due=100,
        )
        
        payment = Payment.objects.create(
            transaction_id=purchase.id,
            payment_method='efectivo',
            transaction_type='compra',
            amount=150,
            payment_date='2025-05-06',
        )
        
        service = UpdateTransactionService(purchase.id, payment.amount, payment.transaction_type)
        with self.assertRaises(ValidationError) as context:
            service.update_transaction_balance_due()

        self.assertIn("El pago excede el saldo pendiente.", str(context.exception))
        
    def test_update_purchase_balance_due_done(self):
        """Test for update balance due when a payment is done for all the amount for a purchase."""
        unique_suffix = str(uuid.uuid4())[:8]
        purchase = Purchase.objects.create(
            buyer=create_user(),
            supplier = Supplier.objects.create(
                name=f'Test Supplier{unique_suffix}',
                phone='12345678',
                nit=f'NIT-{unique_suffix}',
                email=f'test{unique_suffix}@example.com',
                address='Test Address'
            ),
            purchase_type='full_payment',
            purchase_date='2025-05-05',
            invoice_number='12345678',
            total=100,
            balance_due=100,
        )
        
        payment = Payment.objects.create(
            transaction_id=purchase.id,
            payment_method='efectivo',
            transaction_type='compra',
            amount=100,
            payment_date='2025-05-06',
        )
        
        service = UpdateTransactionService(purchase.id, payment.amount, payment.transaction_type)
        service.update_transaction_balance_due()
        
        purchase.refresh_from_db()
        self.assertEqual(purchase.balance_due, 0)
        
    def test_update_sale_balance_due(self):
        """Test for update balance due when a payment is done for a sale."""
        sale = Sale.objects.create(
            client=create_client(),
            selling_channel=create_selling_channel(),
            seller=create_user(),
            total=100,
            balance_due=100,
            status='generado',
            sale_type='contado',
            sale_date='2025-01-01',
        )
        payment = Payment.objects.create(
            transaction_id=sale.id,
            payment_method='efectivo',
            transaction_type='venta',
            amount=50,
            payment_date='2025-05-06',
        )
        
        service = UpdateTransactionService(sale.id, payment.amount, payment.transaction_type)
        service.update_transaction_balance_due()
        
        sale.refresh_from_db()
        self.assertEqual(sale.balance_due, 50)
        
    def test_update_purchase_balance_due_payment_exceeds(self):
        """Test for update balance due when a payment is done for a sale but the payment exceeds the balance."""
        unique_suffix = str(uuid.uuid4())[:8]
        sale = Sale.objects.create(
            client=create_client(),
            selling_channel=create_selling_channel(),
            seller=create_user(),
            total=100,
            balance_due=100,
            status='generado',
            sale_type='contado',
            sale_date='2025-01-01',
        )
        payment = Payment.objects.create(
            transaction_id=sale.id,
            payment_method='efectivo',
            transaction_type='venta',
            amount=150,
            payment_date='2025-05-06',
        )
        
        service = UpdateTransactionService(sale.id, payment.amount, payment.transaction_type)
        with self.assertRaises(ValidationError) as context:
            service.update_transaction_balance_due()

        self.assertIn("El pago excede el saldo pendiente.", str(context.exception))
        
    def test_update_sale_balance_due_done(self):
        """Test for update balance due when a payment is done for all the amount for a sale."""
        sale = Sale.objects.create(
            client=create_client(),
            selling_channel=create_selling_channel(),
            seller=create_user(),
            total=100,
            balance_due=100,
            status='generado',
            sale_type='contado',
            sale_date='2025-01-01',
        )
        payment = Payment.objects.create(
            transaction_id=sale.id,
            payment_method='efectivo',
            transaction_type='venta',
            amount=100,
            payment_date='2025-05-06',
        )
        
        service = UpdateTransactionService(sale.id, payment.amount, payment.transaction_type)
        service.update_transaction_balance_due()
        
        sale.refresh_from_db()
        self.assertEqual(sale.balance_due, 0)
