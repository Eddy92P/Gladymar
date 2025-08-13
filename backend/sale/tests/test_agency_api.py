"""
Tests for agency API.
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from core.models import Agency
from sale.serializers import AgencySerializer
import uuid

AGENCY_URL = reverse('sale:agency-list')

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

def create_agency(**params):
    """Create and return a sample agency."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Test Agency {unique_suffix}',
        'location': f'Test Agency Location {unique_suffix}',
        'city': 'LP',
    }
    defaults.update(params)
    return Agency.objects.create(**defaults)

def detail_url(agency_id):
    """Return agency detail URL."""
    return reverse('sale:agency-detail', args=[agency_id])


class PublicAgencyApiTests(TestCase):
    """Test API requests for unauthenticated users."""
    
    def setUp(self):
        self.client = APIClient()
        
    def test_auth_required(self):
        """Test that authentication is required for accessing the endpoint."""
        res = self.client.get(AGENCY_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateAgencyApiTests(TestCase):
    """Test API requests for authenticated users."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = create_user(
            email='test@example.com',
            password='testpass',
        )
        self.client.force_authenticate(self.user)
        
    def test_retrieve_agencies(self):
        """Test retrieving a list of agencies."""
        create_agency()
        create_agency()
        
        res = self.client.get(AGENCY_URL)
        
        agencies = Agency.objects.all().order_by('-id')
        serializer = AgencySerializer(agencies, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)
        
    def test_create_agency(self):
        """Test creating an agency."""
        payload = {
            'name': 'Test Agency',
            'location': 'Test Agency Location',
            'city': 'CBBA',
        }
        res = self.client.post(AGENCY_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        agency = Agency.objects.get(id=res.data['id'])
        for key, value in payload.items():
            self.assertEqual(getattr(agency, key), value)
            
    def test_partial_update_agency(self):
        """Test partial update of an agency."""
        agency = create_agency(name='Original Name', location='Original Location')
        payload = {'name': 'New Name'}
        url = detail_url(agency.id)
        res = self.client.patch(url, payload)
        agency.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(agency.name, payload['name'])
        
    def test_full_update_agency(self):
        """Test full update of an agency."""
        agency = create_agency()
        payload = {
            'name': 'Updated Agency',
            'location': 'Updated Location',
            'city': 'SCZ',
        }
        url = detail_url(agency.id)
        res = self.client.put(url, payload)
        agency.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        for key, value in payload.items():
            self.assertEqual(getattr(agency, key), value)
