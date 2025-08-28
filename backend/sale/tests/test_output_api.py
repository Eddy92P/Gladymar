"""
Tests for output APIs
"""
from unittest import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils import timezone
from sale.serializers import OutputSerializer
from core.models import (
    Client,
    Batch,
    Warehouse,
    Output,
    OutputItem,
    Product,
    Category,
    Agency
)
import uuid
from datetime import timedelta

OUTPUT_URL = reverse('sale:output-list')

def create_user(**params):
    """Create and return a sample user."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'first_name': 'Test',
        'last_name': 'User',
        'ci': f'12345{unique_suffix}',
        'phone': '12345678',
        'address': 'Test Address',
        'email': f't{unique_suffix}@test.com',
    }
    defaults.update(params)
    return get_user_model().objects.create_user(**defaults)

def create_client(**params):
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Test Client {unique_suffix}',
        'phone': '75871256',
        'nit': f'12{unique_suffix}',
        'email': f'test{unique_suffix}@example.com',
        'address': 'Test Address'
    }
    defaults.update(params)

    return Client.objects.create(**defaults)

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

def create_product(**params):
    """Create and return a sample product."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Sample Product {unique_suffix}',
        'batch': create_batch(),
        'stock': 50,
        'code': f'CODE-{unique_suffix}',
        'unit_of_measurement': 'Unit',
        'minimum_stock': 10,
        'maximum_stock': 200,
        'minimum_sale_price': 10.00,
        'maximum_sale_price': 100.00,
    }
    defaults.update(params)
    product = Product.objects.create(**defaults)
    return product

def detail_url(output_id):
    return reverse('sale:output-detail', args=[output_id])

def create_output(**params):
    """Create and return a sample output."""
    defaults = {
        'warehouse_keeper': create_user(),
        'client': create_client(),
        'output_date': timezone.now().date(),
    }
    defaults.update(params)

    entry_items_data = defaults.pop('output_items', None)

    output = Output.objects.create(**defaults)

    if entry_items_data:
        for item_data in entry_items_data:
            OutputItem.objects.create(output=output, **item_data)
    else:
        OutputItem.objects.create(
            output=output,
            product=create_product(),
            quantity=10,
        )

    return output

class PublicOutputApiTests(TestCase):
    """Test API request for unathenticated users."""
    def setUp(self):
        self.client = APIClient()

    def test_auth_required(self):
        """Test that authentication is requrired for accesing endpoint."""
        res = self.client.get(OUTPUT_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateOutputApiTests(TestCase):
    """Test API request for authorized users."""
    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.client.force_authenticate(self.user)

    def test_retrieve_outputs(self):
        """Test for get a list of outputs."""
        create_output()
        create_output()

        res = self.client.get(OUTPUT_URL)
        outputs = Output.objects.all().order_by('-id')
        serializer = OutputSerializer(outputs, many=True)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['rows'], serializer.data)
        
    def test_create_output(self):
        """Test for create an output."""
        payload = {
            'warehouse_keeper': create_user().id,
            'client': create_client().id,
            'output_date': timezone.now().date(),
            'output_items': [
                {
                    'product': create_product().id,
                    'quantity': 10,
                }
            ]
        }

        res = self.client.post(OUTPUT_URL, payload, format = 'json')
        output = Output.objects.get(id=res.data['id'])

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(output.client.id, payload['client'])
        
    def test_partial_update_output(self):
        """Test for partial update an output."""
        output = create_output(output_date=timezone.now().date())
        payload = {'output_date': (timezone.now() + timedelta(days=1)).date()}

        url = detail_url(output.id)
        res = self.client.patch(url, payload)
        output.refresh_from_db()

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(output.output_date, payload['output_date'])
        
    def test_full_update_output(self):
        """Test for full update an output."""
        output = create_output()
        payload = {
            'warehouse_keeper': create_user().id,
            'client': create_client().id,
            'output_date': timezone.now().date(),
            'output_items': [
                {
                    'product': create_product().id,
                    'quantity': 5,
                }
            ]
        }

        url = detail_url(output.id)
        res = self.client.patch(url, payload, format='json')
        output.refresh_from_db()
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.assertEqual(output.client.id, payload['client'])
        self.assertEqual(output.output_date, payload['output_date'])

        self.assertEqual(output.output_items.count(), len(payload['output_items']))

        for i, payload_item in enumerate(payload['output_items']):
            db_item = output.output_items.all()[i]
            self.assertEqual(db_item.product.id, payload_item['product'])
            self.assertEqual(db_item.quantity, payload_item['quantity'])
