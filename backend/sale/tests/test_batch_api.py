from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from core.models import Batch, Category, Warehouse, Agency
from sale.serializers import BatchSerializer
import uuid

BATCH_URL = reverse('sale:batch-list')

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

def create_warehouse(**params):
    """Create and return a sample warehouse."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'agency': Agency.objects.create(
            name=f'Test Agency {unique_suffix}',
            location=f'Test Agency Location {unique_suffix}',
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

def detail_url(batch_id):
    """Return the URL for a batch detail view."""
    return reverse('sale:batch-detail', args=[batch_id])


class PublicBatchApiTests(TestCase):
    """Test API requests for unauthenticated users."""
    def setUp(self):
        self.client = APIClient()
        
    def test_auth_required(self):
        """Test that authentication is required for accessing the endpoint."""
        res = self.client.get(BATCH_URL)
        
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        
        
class PrivateBatchApiTests(TestCase):
    """Test API requests for authenticated users."""
    def setUp(self):
        self.client = APIClient()
        self.user = create_user(
            email='test@example.com',
            password='testpass',
        )
        self.client.force_authenticate(self.user)
        
    def test_retrieve_batches(self):
        """Test retrieving a list of batches."""
        create_batch()
        create_batch()
        res = self.client.get(BATCH_URL)
        batches = Batch.objects.all().order_by('-id')
        serializer = BatchSerializer(batches, many=True)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)
        
        
    def test_create_batch(self):
        """Test creating a batch."""
        category = create_category()
        payload = {
            'name': 'Test batch',
            'category': category.id,
        }
        res = self.client.post(BATCH_URL, payload)
        batch = Batch.objects.get(id=res.data['id'])

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(batch.name, payload['name'])
        self.assertEqual(batch.category.id, payload['category'])
        
    def test_partial_update_batch(self):
        """Test partial update of a batch."""
        batch = create_batch(name='Original Name')
        payload = {'name': 'New Name'}
        url = detail_url(batch.id)
        res = self.client.patch(url, payload)
        batch.refresh_from_db()

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(batch.name, payload['name'])

    def test_full_update_batch(self):
        """Test full update of a batch."""
        category = create_category()
        batch = create_batch(name='Original Name')
        payload = {'name': 'New Name', 'category': category.id}
        url = detail_url(batch.id)
        res = self.client.put(url, payload)
        batch.refresh_from_db()

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(batch.name, payload['name'])
        self.assertEqual(batch.category.id, payload['category'])
        
    def test_not_delete_batch(self):
        """Test that a batch cannot be deleted via API."""
        batch = create_batch()
        url = detail_url(batch.id)
        res = self.client.delete(url)
        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertTrue(Batch.objects.filter(id=batch.id).exists())
