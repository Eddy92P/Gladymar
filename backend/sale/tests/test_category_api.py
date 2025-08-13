from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from core.models import Category, Warehouse, Agency
from sale.serializers import CategorySerializer
import uuid

CATEGORY_URL = reverse('sale:category-list')

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
    """Create a sample warehouse."""
    # Generate unique name and location to avoid constraint violations
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
    
    return Warehouse.objects.create(**defaults)

def create_category(**params):
    """Create a sample category."""
    
    defaults = {
        'name': f'Sample Category {str(uuid.uuid4())[:8]}',
        'warehouse': create_warehouse(),
    }
    defaults.update(params)
    
    return Category.objects.create(**defaults)

def detail_url(category_id):
    """Return category detail URL."""
    return reverse('sale:category-detail', args=[category_id])


class PublicCategoryApiTests(TestCase):
    """Test API requests for unauthenticated users."""
    
    def setUp(self):
        self.client = APIClient()
        
    def test_auth_required(self):
        """Test that authentication is required for accessing the endpoint."""
        res = self.client.get(CATEGORY_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        
        
class PrivatCategoryApiTests(TestCase):
    """Test API requests for authenticated users."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = create_user(
            email='test@example.com',
            password='testpass',
        )
        self.client.force_authenticate(self.user)
        
    def test_retrieve_categories(self):
        """Test retrieving a list of categories."""
        create_category()
        create_category(name='Test Category 2')
        res = self.client.get(CATEGORY_URL)
        categories = Category.objects.all().order_by('-id')
        serializer = CategorySerializer(categories, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)
        
    def test_create_category(self):
        """Test creating a category."""
        warehouse = create_warehouse()
        payload = {
            'name': 'Test category',
            'warehouse': warehouse.id,
        }
        res = self.client.post(CATEGORY_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        category = Category.objects.get(id=res.data['id'])

        self.assertEqual(category.name, payload['name'])
        self.assertEqual(category.warehouse.id, payload['warehouse'])
            
    def test_partial_update_category(self):
        """Test partial update of a category."""
        category = create_category(name='Original Name')
        payload = {'name': 'New Name'}
        url = detail_url(category.id)
        res = self.client.patch(url, payload)
        category.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(category.name, payload['name'])
        
    def test_full_update_category(self):
        """Test full update of a category."""
        category = create_category(name='Original Name')
        warehouse = create_warehouse()
        payload = {'name': 'New Name', 'warehouse': warehouse.id}
        url = detail_url(category.id)
        res = self.client.put(url, payload)
        category.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(category.name, payload['name'])
        self.assertEqual(category.warehouse.id, payload['warehouse'])
        
    def test_not_delete_category(self):
        """Test that a category cannot be deleted via API."""
        category = create_category()
        url = detail_url(category.id)
        res = self.client.delete(url)
        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertTrue(Category.objects.filter(id=category.id).exists())
