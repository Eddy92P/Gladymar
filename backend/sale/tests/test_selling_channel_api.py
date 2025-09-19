"""
Tests for selling channel API.
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from core.models import (
    SellingChannel, Product, ProductChannelPrice, 
    Batch, Category, Warehouse, Agency, Supplier
)
from sale.serializers import SellingChannelSerializer
import uuid
from datetime import date


SELLING_CHANNEL_URL = reverse('sale:sellingchannel-list')

def detail_url(selling_channel_id):
    """Return the URL for a selling channel detail view."""
    return reverse('sale:sellingchannel-detail', args=[selling_channel_id])

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
    """Create and return a sample warehouse."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'agency': create_agency(),
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
        'warehouse': create_warehouse(),
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

def create_product(**params):
    """Create and return a sample product."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Sample Product {unique_suffix}',
        'batch': create_batch(),
        'stock': 100,
        'reserved_stock': 0,
        'available_stock': 100,
        'code': f'Sample Code {unique_suffix}',
        'unit_of_measurement': 'Unit',
        'description': 'Sample Description',
        'image': None,
        'minimum_stock': 10,
        'maximum_stock': 100,
        'minimum_sale_price': 100,
        'maximum_sale_price': 100,
    }
    defaults.update(params)
    
    # Handle supplier separately since it's a ManyToManyField
    supplier = defaults.pop('supplier', None)
    if supplier is None:
        supplier = create_supplier()
    
    product = Product.objects.create(**defaults)
    product.suppliers.add(supplier)
    return product

def create_selling_channel(**params):
    """Create and return a sample selling channel."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Sample Selling Channel {unique_suffix}',
    }
    defaults.update(params)
    selling_channel = SellingChannel.objects.create(**defaults)
    return selling_channel

def create_product_channel_price(**params):
    """Create and return a sample product channel price."""
    defaults = {
        'product': create_product(),
        'selling_channel': create_selling_channel(),
        'price': 150.00,
        'start_date': date.today(),
        'end_date': None,
    }
    defaults.update(params)
    return ProductChannelPrice.objects.create(**defaults)


class PublicSellingChannelApiTests(TestCase):
    """Test API requests for unauthenticated users."""
    
    def setUp(self):
        self.client = APIClient()
        
    def test_auth_required(self):
        """Test that authentication is required for accessing the endpoint."""
        res = self.client.get(SELLING_CHANNEL_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateSellingChannelApiTests(TestCase):
    """Test API requests for authenticated users."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = create_user(
            email='test@example.com',
            password='testpass',
        )
        self.client.force_authenticate(self.user)
        
    def test_retrieve_selling_channels(self):
        """Test retrieving a list of selling channels."""
        create_selling_channel()
        create_selling_channel()
        
        res = self.client.get(SELLING_CHANNEL_URL)
        selling_channels = SellingChannel.objects.all().order_by('-id')
        serializer = SellingChannelSerializer(selling_channels, many=True)
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['rows'], serializer.data)
        
    def test_create_selling_channel(self):
        """Test creating a selling channel."""
        unique_suffix = str(uuid.uuid4())[:8]
        
        payload = {
            'name': f'Test Selling Channel {unique_suffix}',
        }
        
        res = self.client.post(SELLING_CHANNEL_URL, payload, format='json')
        
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        selling_channel = SellingChannel.objects.get(id=res.data['id'])
        self.assertEqual(selling_channel.name, payload['name'])
        
    def test_partial_update_selling_channel_name_only(self):
        """Test partial update of only the selling channel name."""
        selling_channel = create_selling_channel(name='Old Name')
        
        payload = {'name': 'Updated Name Only'}
        
        url = detail_url(selling_channel.id)
        res = self.client.patch(url, payload, format='json')
        
        selling_channel.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(selling_channel.name, payload['name'])
        
    def test_full_update_selling_channel(self):
        """Test full update of a selling channel."""
        selling_channel = create_selling_channel(name='Old Name')
        
        payload = {
            "product_channel_price": [
                {
                "product": create_product().id,
                "selling_channel": create_selling_channel().id,
                "price": 10.00,
                "start_date": "2025-09-02",
                "end_date": "2025-09-02"
                }
            ],
            "name": "string",
        }
        
        url = detail_url(selling_channel.id)
        res = self.client.put(url, payload, format='json')
        
        selling_channel.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(selling_channel.name, payload['name'])
        
    def test_not_delete_selling_channel(self):
        """Test that a selling channel cannot be deleted via API."""
        selling_channel = create_selling_channel()
        url = detail_url(selling_channel.id)
        res = self.client.delete(url)
        
        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertTrue(SellingChannel.objects.filter(id=selling_channel.id).exists())
        
    def test_retrieve_selling_channel_detail(self):
        """Test retrieving a specific selling channel."""
        selling_channel = create_selling_channel()
        url = detail_url(selling_channel.id)
        res = self.client.get(url)
        
        serializer = SellingChannelSerializer(selling_channel)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)
        
    def test_create_selling_channel_invalid_data(self):
        """Test creating a selling channel with invalid data."""
        payload = {
            'name': '',  # Empty name should be invalid
        }
        
        res = self.client.post(SELLING_CHANNEL_URL, payload, format='json')
        
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_update_selling_channel_invalid_data(self):
        """Test updating a selling channel with invalid data."""
        selling_channel = create_selling_channel(name='Valid Name')
        
        payload = {
            'name': '',  # Empty name should be invalid
        }
        
        url = detail_url(selling_channel.id)
        res = self.client.put(url, payload, format='json')
        
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_create_selling_channel_missing_name(self):
        """Test creating a selling channel without name."""
        payload = {}
        
        res = self.client.post(SELLING_CHANNEL_URL, payload, format='json')
        
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
