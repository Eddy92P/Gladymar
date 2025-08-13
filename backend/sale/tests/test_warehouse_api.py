from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from core.models import Warehouse, Agency
from sale.serializers import WarehouseSerializer
import uuid

WAREHOUSE_URL = reverse('sale:warehouse-list')


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
    # Generate unique name and location to avoid constraint violations
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'agency': Agency.objects.create(
            name=f'Test Agency {unique_suffix}',
            location=f'Test Agency Location {unique_suffix}',
        ),
        'name': f'Sample Warehouse {unique_suffix}',
        'location': f'Sample Location {unique_suffix}',
    }
    defaults.update(params)
    
    return Warehouse.objects.create(**defaults)

def detail_url(warehouse_id):
    """Return warehouse detail URL."""
    return reverse('sale:warehouse-detail', args=[warehouse_id])


class PublicWarehouseApiTests(TestCase):
    """Test API requests for unauthenticated users."""
    
    def setUp(self):
        self.client = APIClient()
        
    def test_auth_required(self):
        """Test that authentication is required for accessing the endpoint."""
        res = self.client.get(WAREHOUSE_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateWarehouseApiTests(TestCase):
    """Test API requests for authenticated users."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = create_user(
            email='test@example.com',
            password='testpass',
        )
        self.client.force_authenticate(self.user)
        
    def test_retrieve_warehouses(self):
        """Test retrieving a list of warehouses."""
        create_warehouse()
        create_warehouse()
        
        res = self.client.get(WAREHOUSE_URL)
        
        warehouses = Warehouse.objects.all().order_by('-id')
        serializer = WarehouseSerializer(warehouses, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)
        
    def test_create_warehouse(self):
        """Test creating a warehouse."""
        payload = {
            'agency': Agency.objects.create(
                name='Test Agency',
                location='Test Agency Location',
            ).id,
            'name': 'Test Warehouse',
            'location': 'Test Location',
        }
        res = self.client.post(WAREHOUSE_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        warehouse = Warehouse.objects.get(id=res.data['id'])
        for key, value in payload.items():
            if key == 'agency':
                self.assertEqual(warehouse.agency.id, value)
            else:
                self.assertEqual(getattr(warehouse, key), value)
            
    def test_partial_update_warehouse(self):
        """Test partial update of a warehouse."""
        warehouse = create_warehouse(name='Original Name', location='Original Location')
        payload = {'name': 'New Name'}
        url = detail_url(warehouse.id)
        res = self.client.patch(url, payload)
        warehouse.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(warehouse.name, payload['name'])
        
    def test_full_update_warehouse(self):
        """Test full update of a warehouse."""
        warehouse = create_warehouse(name='Original Name', location='Original Location')
        payload = {
            'agency': warehouse.agency.id,
            'name': 'New Name', 
            'location': 'New Location'
        }
        url = detail_url(warehouse.id)
        res = self.client.put(url, payload)
        warehouse.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        for key, value in payload.items():
            if key != 'agency':
                self.assertEqual(getattr(warehouse, key), value)
            else:
                self.assertEqual(warehouse.agency.id, value)

    def test_not_delete_warehouse(self):
        """Test that a warehouse cannot be deleted via API."""
        warehouse = create_warehouse()
        url = detail_url(warehouse.id)
        res = self.client.delete(url)
        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertTrue(Warehouse.objects.filter(id=warehouse.id).exists())
