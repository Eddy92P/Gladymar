from unittest import TestCase
from sale.services.entry_purchase_service import UpdatePurchaseItem
from core.models import *

from django.utils import timezone
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

def create_supplier(**params):
    unique_suffix = str(uuid.uuid4())[:8]
    defaults={
        'name': f'Supplier {unique_suffix}',
        'phone': '78885521',
        'nit': f'123456789{unique_suffix}',
        'email': f'test{unique_suffix}@example.com',
        'address': 'Test Address 123',
    }
    defaults.update(params)
    
    return Supplier.objects.create(**defaults)

def create_category(**params):
    """Create and return a sample category."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Sample Category {unique_suffix}',
    }
    defaults.update(params)
    category = Category.objects.create(**defaults)
    return category

def create_batch(**params):
    """Create and return a sample batch."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Sample Batch {unique_suffix}',
        'category': create_category(),
    }
    defaults.update(params)
    batch = Batch.objects.create(**defaults)
    return batch

def create_product(**params):
    """Create and return a sample product."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Sample Product {unique_suffix}',
        'batch': create_batch(),
        'code': f'Sample Code {unique_suffix}',
        'unit_of_measurement': 'Unit',
        'description': 'Sample Description',
        'image': None,
        'minimum_sale_price': 100,
        'maximum_sale_price': 2500,
    }
    defaults.update(params)

    return Product.objects.create(**defaults)

def create_product_stock(**params):
    defaults = {
        'warehouse': create_warehouse(),
        'product': create_product(),
        'stock': 50,
        'reserved_stock': 10,
        'available_stock': 40,
        'minimum_stock': 10,
        'maximum_stock': 70
    }
    defaults.update(params)

    return ProductStock.objects.create(**defaults)
    
def create_entry(**params):
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'agency': create_agency(),
        'warehouse_keeper': create_user(),
        'supplier': create_supplier(),
        'entry_date': '2025-10-02',
        'invoice_number': f'123{unique_suffix}',
        'note': 'This a test note',
    }
    defaults.update(params)

    return Entry.objects.create(**defaults)

def create_purchase(**params):
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'agency': create_agency(),
        'buyer': create_user(),
        'supplier': create_supplier(),
        'purchase_type': 'contado',
        'status': 'realizado',
        'purchase_date': '2025-10-02',
        'purchase_end_date': '2025-10-05',
        'invoice_number': f'784{unique_suffix}',
        'total': 200,
        'balance_due': 200,
    }
    defaults.update(params)

    return Purchase.objects.create(**defaults)


class TestUpdatePurchaseItem(TestCase):
    """Tests for update purchase items when an entry is done."""
    def setUp(self):
        self.purchase_item = self.create_test_purchase_item()
        
    def create_test_purchase_item(self, **kwargs):
        defaults = {
            'purchase': create_purchase(),
            'product_stock': create_product_stock(),
            'quantity': 50,
            'unit_price': 50,
            'total_price': 2500,
            'entered_stock': 0,
        }
        defaults.update(kwargs)

        return PurchaseItem.objects.create(**defaults)
        
    def test_update_purchase_item(self):
        """Test update purchase item"""
        entry_item = EntryItem.objects.create(
            purchase_item=self.purchase_item,
            entry=create_entry(),
            product_stock=create_product_stock(),
            quantity=10,
        )
        
        service = UpdatePurchaseItem(entry_item)
        service.update_purchase_item()
        
        self.purchase_item.refresh_from_db()
        self.assertEqual(self.purchase_item.entered_stock, 10)
        
    def test_entered_stock_exceeds_quantity(self):
        """Test entered stock exceeds quantity selled."""
        entry_item = EntryItem.objects.create(
            purchase_item=self.purchase_item,
            entry=create_entry(),
            product_stock=create_product_stock(),
            quantity=60,
        )

        service = UpdatePurchaseItem(entry_item)

        with self.assertRaises(ValidationError) as context:
            service.update_purchase_item()

        self.assertIn("La cantidad ingresada excede la cantidad comprada.", str(context.exception))
        
