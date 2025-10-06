from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils import timezone
from core.models import Batch, Category, ProductStock, Warehouse, Product, Entry, Supplier, EntryItem, Agency
from sale.serializers import EntrySerializer
import uuid

ENTRY_URL = reverse('sale:entry-list')

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

def create_warehouse(**params):
    """Create and return a sample warehouse."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'agency': Agency.objects.create(
            name=f'Test Agency {unique_suffix}',
            location=f'Test Agency Location {unique_suffix}',
            city='La Paz',
        ),
        'name': f'Sample Warehouse {unique_suffix}',
        'location': 'Sample Location',
    }
    defaults.update(params)
    warehouse = Warehouse.objects.create(**defaults)
    return warehouse

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
        'code': f'CODE-{unique_suffix}',
        'unit_of_measurement': 'Unit',
        'minimum_sale_price': 10.00,
        'maximum_sale_price': 100.00,
    }
    defaults.update(params)
    product = Product.objects.create(**defaults)
    return product

def create_product_stock(**params):
    defaults = {
        'product': create_product(),
        'warehouse': create_warehouse(),
        'stock': 50,
        'reserved_stock': 10,
        'available_stock': 40,
        'minimum_stock': 10,
        'maximum_stock': 60,
    }
    defaults.update(params)
    return ProductStock.objects.create(**defaults)

def create_supplier(**params):
    """Create and return a sample supplier."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Sample Supplier {unique_suffix}',
        'phone': '12345678',
        'nit': f'NIT-{unique_suffix}',
        'email': f'sample{unique_suffix}@example.com',
        'address': 'Sample Address',
    }
    defaults.update(params)
    supplier = Supplier.objects.create(**defaults)
    return supplier

def create_entry(**params):
    """Create and return a sample entry."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'warehouse_keeper': create_user(),
        'supplier': create_supplier(),
        'entry_date': timezone.now().date(),
        'invoice_number': f'{unique_suffix}',
    }
    defaults.update(params)

    entry_items_data = defaults.pop('entry_items', None)
    
    entry = Entry.objects.create(**defaults)
    
    if entry_items_data:
        for item_data in entry_items_data:
            EntryItem.objects.create(entry=entry, **item_data)
    else:
        EntryItem.objects.create(
            entry=entry,
            product_stock=create_product_stock(),
            quantity=10,
        )
    
    return entry

def detail_url(entry_id):
    """Return the URL for a entry detail view."""
    return reverse('sale:entry-detail', args=[entry_id])


class PublicEntryApiTests(TestCase):
    """Test API requests for unauthenticated users."""
    def setUp(self):
        self.client = APIClient()

    def test_auth_required(self):
        """Test that authentication is required for accessing the endpoint."""
        res = self.client.get(ENTRY_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateEntryApiTests(TestCase):
    """Test API requests for authenticated users."""
    def setUp(self):
        self.client = APIClient()
        self.user = create_user(password='testpass123')
        self.client.force_authenticate(self.user)

    def test_retrieve_entries(self):
        """Test retrieving a list of entries."""
        create_entry()
        create_entry()
        res = self.client.get(ENTRY_URL)
        entries = Entry.objects.all().order_by('-id')
        serializer = EntrySerializer(entries, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['rows'], serializer.data)

    def test_create_entry(self):
        """Test creating an entry."""
        payload = {
            'warehouse_keeper': create_user().id,
            'supplier': create_supplier().id,
            'entry_date': '2021-01-01',
            'invoice_number': '1234567890',
            'entry_items': [
                {
                    'product_stock': create_product_stock().id,
                    'quantity': 10,
                }
            ]
        }
        res = self.client.post(ENTRY_URL, payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        entry = Entry.objects.get(id=res.data['id'])
        self.assertEqual(entry.invoice_number, payload['invoice_number'])
        self.assertEqual(entry.supplier.id, payload['supplier'])

    def test_partial_update_entry(self):
        """Test partial update of an entry."""
        entry = create_entry(invoice_number='1234567890')
        payload = {'invoice_number': '1234567891'}
        url = detail_url(entry.id)
        res = self.client.patch(url, payload)
        entry.refresh_from_db()
        self.assertEqual(entry.invoice_number, payload['invoice_number'])
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        
    def test_full_update_entry(self):
        """Test full update of an entry"""
        entry = create_entry(invoice_number='1234567890')
        payload = {
            'warehouse_keeper': create_user().id,
            'supplier': entry.supplier.id,
            'invoice_number': '1234567891',
            'entry_date': '2021-01-01',
            'entry_items': [
                {
                    'product_stock': create_product_stock().id,
                    'quantity': 15,
                }
            ]
        }
        url = detail_url(entry.id)
        res = self.client.put(url, payload, format='json')
        entry.refresh_from_db()
        self.assertEqual(entry.invoice_number, payload['invoice_number'])
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.assertEqual(entry.entry_items.count(), len(payload['entry_items']))

        for i, payload_item in enumerate(payload['entry_items']):
            db_item = entry.entry_items.all()[i]
            self.assertEqual(db_item.product_stock.id, payload_item['product_stock'])
            self.assertEqual(db_item.quantity, payload_item['quantity'])