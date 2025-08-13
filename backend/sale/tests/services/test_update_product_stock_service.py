"""
Tests for update product stock when an entry is updated.
"""
from core.models import (
    Warehouse,
    Category,
    Batch,
    Product,
    Entry,
    EntryItem,
    Output,
    OutputItem,
    Client,
    Supplier,
    Agency,
)
from sale.services.update_product_stock_service import UpdateProductStockService
from unittest import TestCase
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

class TestUpdateProductStockService(TestCase):
    
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
    
    def test_update_entry_product_stock(self):
        """Test for update an entry and update product stock"""
        unique_suffix = str(uuid.uuid4())[:8]
        supplier = Supplier.objects.create(
            name=f'Test Supplier{unique_suffix}',
            phone='12345678',
            nit=f'NIT-{unique_suffix}',
            email=f'test{unique_suffix}@example.com',
            address='Test Address'
        )

        entry = Entry.objects.create(
            warehouse_keeper=create_user(),
            supplier=supplier,
            entry_date=timezone.now(),
            invoice_number=f'123456{unique_suffix}'
        )

        entry_item = EntryItem.objects.create(
            entry=entry,
            product=self.product,
            quantity=10,
            unit_price=10.00,
            total_price=100.00
        )

        validated_data = {
            'entry_items': [
                {
                    'id': entry_item.id,
                    'quantity': 15,
                    'unit_price': 10.00,
                    'total_price': 150.00
                }
            ]
        }

        service = UpdateProductStockService(entry, validated_data)
        service.update_entry_product_stock()

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 55)
        
    def test_update_entry_product_stock_decrease(self):
        """Test for update an entry with decreased quantity and update product stock"""
        unique_suffix = str(uuid.uuid4())[:8]
        supplier = Supplier.objects.create(
            name=f'Test Supplier 2{unique_suffix}',
            phone='12345679',
            nit=f'NIT-2{unique_suffix}',
            email=f'test2{unique_suffix}@example.com',
            address='Test Address 2'
        )

        entry = Entry.objects.create(
            warehouse_keeper=create_user(),
            supplier=supplier,
            entry_date=timezone.now(),
            invoice_number=f'123457{unique_suffix}'
        )

        entry_item = EntryItem.objects.create(
            entry=entry,
            product=self.product,
            quantity=20,
            unit_price=10.00,
            total_price=200.00
        )

        validated_data = {
            'entry_items': [
                {
                    'id': entry_item.id,
                    'quantity': 15,
                    'unit_price': 10.00,
                    'total_price': 150.00
                }
            ]
        }

        service = UpdateProductStockService(entry, validated_data)
        service.update_entry_product_stock()

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 45)
        
    def test_update_entry_product_stock_exceeds_maximum(self):
        """Test for update an entry that would exceed maximum stock"""
        unique_suffix = str(uuid.uuid4())[:8]
        supplier = Supplier.objects.create(
            name=f'Test Supplier 3{unique_suffix}',
            phone='12345680',
            nit=f'NIT-3{unique_suffix}',
            email=f'test3{unique_suffix}@example.com',
            address='Test Address 3'
        )

        entry = Entry.objects.create(
            warehouse_keeper=create_user(),
            supplier=supplier,
            entry_date=timezone.now(),
            invoice_number=f'123458{unique_suffix}'
        )

        entry_item = EntryItem.objects.create(
            entry=entry,
            product=self.product,
            quantity=10,
            unit_price=10.00,
            total_price=100.00
        )

        validated_data = {
            'entry_items': [
                {
                    'id': entry_item.id,
                    'quantity': 200,
                    'unit_price': 10.00,
                    'total_price': 2000.00
                }
            ]
        }

        service = UpdateProductStockService(entry, validated_data)

        with self.assertRaises(ValidationError) as context:
            service.update_entry_product_stock()

        self.assertIn("El nuevo stock no puede ser mayor al máximo permitido", str(context.exception))
        
    def test_update_output_product_increase(self):
        """
        Test for update an output with an higher quantity and update product stock.
        """
        unique_suffix = str(uuid.uuid4())[:8]
        client = Client.objects.create(
            name=f'Test Supplier 4{unique_suffix}',
            phone='12345680',
            nit=f'NIT-4{unique_suffix}',
            email=f'test4{unique_suffix}@example.com',
            address='Test Address 4'
        )

        output = Output.objects.create(
            warehouse_keeper=create_user(),
            client=client,
            output_date=timezone.now(),
        )

        output_item = OutputItem.objects.create(
            output=output,
            product=self.product,
            quantity=10,
        )

        validated_data = {
            'output_items': [
                {
                    'id': output_item.id,
                    'quantity': 15,
                }
            ]
        }
        
        service = UpdateProductStockService(output, validated_data)
        service.update_output_product_stock()
        
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 45)
        
    def test_update_output_product_decrease(self):
        """
        Test for update an output with a lower quantity and update product stock.
        """
        unique_suffix = str(uuid.uuid4())[:8]
        client = Client.objects.create(
            name=f'Test Client{unique_suffix}',
            phone='12345680',
            nit=f'NIT-5{unique_suffix}',
            email=f'test5{unique_suffix}@example.com',
            address='Test Address 4'
        )

        output = Output.objects.create(
            warehouse_keeper=create_user(),
            client=client,
            output_date=timezone.now(),
        )

        output_item = OutputItem.objects.create(
            output=output,
            product=self.product,
            quantity=10,
        )

        validated_data = {
            'output_items': [
                {
                    'id': output_item.id,
                    'quantity': 5,
                }
            ]
        }
        
        service = UpdateProductStockService(output, validated_data)
        service.update_output_product_stock()
        
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 55)
        
    def test_update_output_product_exceeds_minimum_stock(self):
        """
        Test for update an output and a exception is raised if exceeds minimum stock.
        """
        unique_suffix = str(uuid.uuid4())[:8]
        client = Client.objects.create(
            name=f'Test Client1{unique_suffix}',
            phone='12345681',
            nit=f'NIT-6{unique_suffix}',
            email=f'test6{unique_suffix}@example.com',
            address='Test Address 6'
        )

        output = Output.objects.create(
            warehouse_keeper=create_user(),
            client=client,
            output_date=timezone.now(),
        )

        output_item = OutputItem.objects.create(
            output=output,
            product=self.product,
            quantity=10,
        )

        validated_data = {
            'output_items': [
                {
                    'id': output_item.id,
                    'quantity': 55,
                }
            ]
        }

        service = UpdateProductStockService(output, validated_data)
        with self.assertRaises(ValidationError) as context:
            service.update_output_product_stock()

        self.assertIn('El nuevo stock no puede ser menor al mínimo permitido.', str(context.exception))
    