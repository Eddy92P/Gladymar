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
from core.models import *
import uuid
from datetime import timedelta

OUTPUT_URL = reverse('sale:output-list')

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
        'ci': f'12345{unique_suffix}',
        'phone': '12345678',
        'address': 'Test Address',
        'email': f't{unique_suffix}@test.com',
        'agency': agency,
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
    """Create and return a sample ProductStock."""
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

def detail_url(output_id):
    return reverse('sale:output-detail', args=[output_id])

def create_output(**params):
    """Create and return a sample output."""
    defaults = {
        'warehouse': create_warehouse(),
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
            product_stock=create_product_stock(),
            quantity=10,
        )

    return output

class PublicOutputApiTests(TestCase):
    """Test API request for unathenticated users."""
    
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        from django.core.management import call_command
        call_command('migrate', verbosity=0, interactive=False)
    
    def setUp(self):
        self.client = APIClient()

    def test_auth_required(self):
        """Test that authentication is requrired for accesing endpoint."""
        res = self.client.get(OUTPUT_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateOutputApiTests(TestCase):
    """Test API request for authorized users."""
    
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        from django.core.management import call_command
        call_command('migrate', verbosity=0, interactive=False)
    
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
            'warehouse': create_warehouse().id,
            'warehouse_keeper': create_user().id,
            'client': create_client().id,
            'output_date': timezone.now().date(),
            'output_items': [
                {
                    'product_stock': create_product_stock().id,
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
                    'product_stock': create_product_stock().id,
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
            self.assertEqual(db_item.product_stock.id, payload_item['product_stock'])
            self.assertEqual(db_item.quantity, payload_item['quantity'])
