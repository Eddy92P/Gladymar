"""
Tests for output product stock service.
"""
from core.models import (
    Warehouse,
    Category,
    Batch,
    Product,
    Output,
    OutputItem,
    Client,
    Agency,
)
from unittest import TestCase
from django.utils import timezone
from sale.services.output_service import DecreaseProductStockService
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
import uuid

def create_user(**params):
    """Create and return a sample user."""
    from core.models import Agency
    
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


class TestDecreaseProductStockService(TestCase):
    
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
            name = f'Test Warehouse {unique_suffix}',
            location = 'Test Location',
        )
        category = Category.objects.create(
            warehouse = warehouse,
            name = f'Test Category {unique_suffix}',
        )
        batch = Batch.objects.create(
            category = category,
            name = f'Test Batch {unique_suffix}',
        )
        defaults = {
            'name': f'Test Product {unique_suffix}',
            'batch': batch,
            'stock': 50,
            'available_stock': 50,
            'code': f'TEST-{unique_suffix}',
            'minimum_stock': 10,
            'maximum_stock': 200,
            'minimum_sale_price': 10.00,
            'maximum_sale_price': 100.00
        }
        defaults.update(kwargs)
        
        return Product.objects.create(**defaults)
        
    def test_decrease_stock(self):
        """Test decreasing stock."""
        unique_suffix = str(uuid.uuid4())[:8]
        output = Output.objects.create(
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
        OutputItem.objects.create(
            output = output,
            product = self.product,
            quantity = 30
        )
        
        service = DecreaseProductStockService(output)
        service.decrease_product_stock()

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 20)
        
    def test_decrease_stock_raise_error(self):
        """Test service for increase product stock fails."""
        output = Output.objects.create(
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
        OutputItem.objects.create(
            output = output,
            product = self.product,
            quantity = 60
        )
        
        service = DecreaseProductStockService(output)

        with self.assertRaises(ValidationError) as context:
            service.decrease_product_stock()

        self.assertIn("La cantidad excede el stock disponible.", str(context.exception))
