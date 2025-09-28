from unittest import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from core.models import *
from sale.serializers import ProductChannelPriceSerializer
import uuid
from datetime import datetime

PRODUCT_CHANNEL_URL = reverse('sale:productchannelprice-list')

def detail_url(product_channel_id):
    return reverse('sale:productchannelprice-detail', args=[product_channel_id])

def create_user(**params):
    """Create and return a sample User."""
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
    """Create and return a sample Agency."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'name': f'TestAgency{unique_suffix}',
        'location': f'TestLocation{unique_suffix}',
        'city': 'PT',
    }
    defaults.update(params)
    return Agency.objects.create(**defaults)

def create_warehouse(**params):
    """Create and return a sample Warehouse."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'agency': create_agency(),
        'name': f'TestWarehouse{unique_suffix}',
        'location': f'TestLocation{unique_suffix}',
    }
    defaults.update(params)
    return Warehouse.objects.create(**defaults)

def create_category(**params):
    """Create and return a sample Category."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'name': f'TestCategory{unique_suffix}',
    }
    defaults.update(params)
    return Category.objects.create(**defaults)

def create_batch(**params):
    """Create and return a sample Batch."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'category': create_category(),
        'name': f'TestBatch{unique_suffix}',
    }
    defaults.update(params)
    return Batch.objects.create(**defaults)

def create_product(**params):
    """Create and return a sample Product."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'batch': create_batch(),
        'name': f'TestProduct{unique_suffix}',
        'code': f'CODE{unique_suffix}',
        'unit_of_measurement': 'UN',
        'description': 'Test product description',
        'minimum_sale_price': 10.00,
        'maximum_sale_price': 50.00,
    }
    defaults.update(params)
    return Product.objects.create(**defaults)

def create_selling_channel(**params):
    defaults = {
        'name': 'Test Selling Channel',
    }
    defaults.update(params)
    return SellingChannel.objects.create(**defaults)

def create_product_channel(**params):
    defaults = {
        'product': create_product(),
        'selling_channel': create_selling_channel(),
        'price': 10.00,
    }
    defaults.update(params)
    return ProductChannelPrice.objects.create(**defaults)


class PublicProductChannelApiTests(TestCase):
    """Test API requests for unauthorized users."""
    def setUp(self):
        self.client = APIClient()

    def test_auth_required(self):
        res = self.client.get(PRODUCT_CHANNEL_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        
class PrivateProductChannelApiTests(TestCase):
    """Test API requests for authorized users."""
    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.client.force_authenticate(self.user)

    def test_retrieve_product_channel(self):
        """Test for retrieve a list of product channels."""
        create_product_channel()
        create_product_channel()

        res = self.client.get(PRODUCT_CHANNEL_URL)
        product_channel = ProductChannelPrice.objects.all().order_by('-id')
        serializer = ProductChannelPriceSerializer(product_channel, many=True)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['rows'], serializer.data)

    def test_create_product_channel(self):
        """Test for create a product channel."""
        payload = {
            'product': create_product().id,
            'selling_channel': create_selling_channel().id,
            'price': 30.00,
        }

        res = self.client.post(PRODUCT_CHANNEL_URL, payload)
        product_channel = ProductChannelPrice.objects.get(id=res.data['id'])

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(payload['product'], product_channel.product.id)
        self.assertEqual(payload['selling_channel'], product_channel.selling_channel.id)
        self.assertEqual(payload['price'], product_channel.price)

    def test_partial_update_product_channel(self):
        """Test for partial update a product channel."""
        product_channel = create_product_channel()
        payload = {
            'product': create_product().id,
            'selling_channel': create_selling_channel().id,
            'price': 100.00,
        }

        url = detail_url(product_channel.id)
        res = self.client.patch(url, payload)
        product_channel.refresh_from_db()

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(payload['price'], product_channel.price)

    def test_full_update_product_channel(self):
        """Test for full update a product channel."""
        product_channel = create_product_channel()
        payload = {
            'product': create_product().id,
            'selling_channel': create_selling_channel().id,
            'price': 500.00,
        }

        url = detail_url(product_channel.id)
        res = self.client.patch(url, payload)
        product_channel.refresh_from_db()

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(payload['price'], product_channel.price)
