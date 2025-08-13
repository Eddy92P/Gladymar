from unittest import TestCase
from sale.services.entries_service import IncreaseProductStockService
from core.models import (
    Warehouse,
    Category,
    Product,
    Batch,
    Entry,
    EntryItem,
    Supplier,
    Agency,
)

from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
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


class TestIncreaseProductStockService(TestCase):
    """Tests of entry product service"""
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
            'price': 10.00,
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
    
    def test_increase_stock(self):
        """Test service for increase product stock."""
        entry = Entry.objects.create(
            warehouse_keeper=create_user(),
            supplier=Supplier.objects.create(
                name='Test Supplier',
                phone='12345678',
                nit='NIT-123',
                email='test@example.com',
                address='Test Address'
            ),
            entry_date=timezone.now(),
            invoice_number='123456'
        )
        EntryItem.objects.create(
            entry=entry,
            product=self.product,
            quantity=10,
            unit_price=10.00,
            total_price=100.00
        )
        
        service = IncreaseProductStockService(entry)
        service.increase_product_stock()
        
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 60)
        
    def test_increase_stock_raise_error(self):
        """Test service for increase product stock fails."""
        entry = Entry.objects.create(
            warehouse_keeper=create_user(),
            supplier=Supplier.objects.create(
                name='Test Supplier 3',
                phone='12345679',
                nit='NIT-1233',
                email='test1@example.com',
                address='Test Address'
            ),
            entry_date=timezone.now(),
            invoice_number='1234567'
        )
        EntryItem.objects.create(
            entry=entry,
            product=self.product,
            quantity=200,
            unit_price=10.00,
            total_price=100.00
        )
        
        service = IncreaseProductStockService(entry)
        
        with self.assertRaises(ValidationError) as context:
            service.increase_product_stock()
            
        self.assertIn("El stock máximo no puede ser superado", str(context.exception))
