"""
Tests for output product stock service.
"""
from core.models import *
from unittest import TestCase
from django.utils import timezone
from sale.services.output_service import DecreaseProductStockService
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
import uuid

def create_user(**params):
    """Create and return a sample user."""
    unique_suffix = str(uuid.uuid4())[:4]
    agency = Agency.objects.create(
        name=f'Test Agency {unique_suffix}',
        location=f'Test Location {unique_suffix}',
        city='La Paz',
    )
    
    defaults = {
        'first_name': 'Test',
        'last_name': 'User',
        'ci': f'1234567{unique_suffix}',
        'phone': '12345678',
        'address': 'Test Address',
        'email': f't{unique_suffix}@test.com',
        'agency': agency,
    }
    defaults.update(params)
    return get_user_model().objects.create_user(**defaults)

def create_agency(**params):
    """Create and return a sample agency."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Test Agency {unique_suffix}',
        'location': f'Test Agency Location {unique_suffix}',
        'city': 'La Paz',
    }
    defaults.update(params)
    return Agency.objects.create(**defaults)

def create_warehouse(**params):
    unique_suffix = str(uuid.uuid4())[:8]
    defaults={
        'agency': create_agency(),
        'name': f'Warehouse {unique_suffix}',
        'location': 'Test location',
    }
    defaults.update(params)

    return Warehouse.objects.create(**defaults)


class TestDecreaseProductStockService(TestCase):
    
    def setUp(self):
        self.product_stock = self.create_test_product_stock()
        
    def create_test_product(self, **kwargs):
        unique_suffix = str(uuid.uuid4())[:8]
        category = Category.objects.create(
            name = f'Test Category {unique_suffix}',
        )
        batch = Batch.objects.create(
            category = category,
            name = f'Test Batch {unique_suffix}',
        )
        defaults = {
            'name': f'Test Product {unique_suffix}',
            'batch': batch,
            'code': f'TEST-{unique_suffix}',
            'minimum_sale_price': 10.00,
            'maximum_sale_price': 100.00
        }
        defaults.update(kwargs)
        
        return Product.objects.create(**defaults)
    
    def create_test_product_stock(self, **kwargs):
        unique_suffix = str(uuid.uuid4())[:8]
        agency = Agency.objects.create(
            name = f'Test Warehouse{unique_suffix}',
            location = 'Test Location',
        )
        warehouse = Warehouse.objects.create(
            agency=agency,
            name = f'Test Warehouse {unique_suffix}',
            location = 'Test Location',
        )
        defaults = {
            'product': self.create_test_product(),
            'warehouse': warehouse,
            'stock': 50,
            'reserved_stock': 10,
            'available_stock': 40,
            'minimum_stock': 10,
            'maximum_stock': 70
        }
        
        defaults.update(kwargs)

        return ProductStock.objects.create(**defaults)

    def test_decrease_stock(self):
        """Test decreasing stock."""
        unique_suffix = str(uuid.uuid4())[:8]
        output = Output.objects.create(
            agency=create_agency(),
            warehouse_keeper=create_user(),
            client = Client.objects.create(
                name = 'Test Client 1',
                phone = '123456789',
                nit = f'{unique_suffix}',
                email = f'test4{unique_suffix}@example.com',
                address = 'test address'
            ),
            output_date = timezone.now()
        )
        output_item = OutputItem.objects.create(
            output = output,
            product_stock = self.product_stock,
            quantity = 30
        )
        
        service = DecreaseProductStockService(output_item, self.product_stock)
        service.decrease_product_stock()

        self.product_stock.refresh_from_db()
        self.assertEqual(self.product_stock.stock, 20)
        
    def test_decrease_stock_raise_error(self):
        """Test service for increase product stock fails."""
        output = Output.objects.create(
            agency=create_agency(),
            warehouse_keeper=create_user(),
            client = Client.objects.create(
                name = 'Test Client 1',
                phone = '123456789',
                nit = '8598887016',
                email = 'test2@example.com',
                address = 'test address'
            ),
            output_date = timezone.now()
        )
        output_item = OutputItem.objects.create(
            output = output,
            product_stock = self.product_stock,
            quantity = 60
        )
        
        service = DecreaseProductStockService(output_item, self.product_stock)

        with self.assertRaises(ValidationError) as context:
            service.decrease_product_stock()

        self.assertIn("La cantidad excede el stock disponible.", str(context.exception))
