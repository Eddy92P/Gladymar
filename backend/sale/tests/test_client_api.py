"""
Tests for client API.
"""
from unittest import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from core.models import Client
from sale.serializers import ClientSerializer
import uuid


CLIENT_URL = reverse('sale:client-list')

def detail_url(client_id):
    return reverse('sale:client-detail', args=[client_id])

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
    


class PublicClientApiTests(TestCase):
    """Test API request for unauthenticated users."""
    def setUp(self):
        self.client = APIClient()
        
    def test_auth_required(self):
        """Test that authentication is required for accessing the endpoint."""
        res = self.client.get(CLIENT_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        
        
class PrivateClientApiTests(TestCase):
    """Test API request for authenticated users."""
    def setUp(self):
        self.client = APIClient()
        self.user = create_user(
            password='testpass',
        )
        
        self.client.force_authenticate(self.user)
        
    def test_retrieve_clients(self):
        """Test for retrieve multiple clients."""
        # Create clients with specific names to avoid conflicts
        client1 = create_client(name=f'TestClient1_{str(uuid.uuid4())[:8]}')
        client2 = create_client(name=f'TestClient2_{str(uuid.uuid4())[:8]}')
        
        res = self.client.get(CLIENT_URL)
        
        # Get the created clients specifically
        created_clients = Client.objects.filter(id__in=[client1.id, client2.id]).order_by('-id')
        serializer = ClientSerializer(created_clients, many=True)
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Check that our created clients are in the response
        response_ids = [item['id'] for item in res.data['rows']]
        self.assertIn(client1.id, response_ids)
        self.assertIn(client2.id, response_ids)
        
    def test_create_client(self):
        """Test for create a simple client."""
        unique_suffix = str(uuid.uuid4())[:4]
        payload = {
            'name': f'TestClient1{unique_suffix}',
            'phone': '75871255',
            'nit': '12345678',
            'email': f'test1{unique_suffix}@example.com',
            'address': 'Test Address 1'
        }
        
        res = self.client.post(CLIENT_URL, payload)
        client = Client.objects.get(id=res.data['id'])
        
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(client.name, payload['name'])
        self.assertEqual(client.phone, payload['phone'])
        
    def test_partial_update_client(self):
        """Test for partial update of a client."""
        client = create_client(name='TestClient2', email='test5@example.com')
        payload = {'name': 'TestClient3', 'email': 'test6@example.com'}

        url = detail_url(client.id)
        res = self.client.patch(url, payload)
        client.refresh_from_db()

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(client.name, payload['name'])
        
    def test_full_update_client(self):
        client = create_client(
            name = 'ClientTest',
            phone = '41014782',
            nit = '12004785',
            email = 'testexample@example.com',
            address = 'Address Test',
        )
        payload = {
            'name': 'TestClient10',
            'phone': '75871256',
            'nit': '12004786',
            'email': 'test1example@example.com',
            'address': 'Test Address',
        }
        
        url = detail_url(client.id)
        res = self.client.put(url, payload)
        client.refresh_from_db()
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        for key, value in payload.items():
            self.assertEqual(getattr(client, key), value)
            
    def test_not_delete_client(self):
        client = create_client()
        
        url = detail_url(client.id)
        res = self.client.delete(url)
        
        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertTrue(Client.objects.filter(id=client.id).exists())
