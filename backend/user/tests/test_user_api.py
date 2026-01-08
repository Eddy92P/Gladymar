"""
Tests for the user API.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework.test import APIClient
from rest_framework import status


CREATE_USER_URL = reverse('user:create')
TOKEN_URL = reverse('user:token')
ME_URL = reverse('user:me')


def create_user(**params):
    """Create and return a user with an email and password."""
    from core.models import Agency
    
    agency = Agency.objects.create(
        name='Test Agency',
        location='Test Location',
        city='La Paz',
    )
    
    defaults = {
        'first_name': 'Test',
        'last_name': 'User',
        'ci': '1234567',
        'phone': '12345678',
        'address': 'Test Address',
        'agency': agency,
    }
    defaults.update(params)
    return get_user_model().objects.create_user(**defaults)


class PublicUserApiTests(TestCase):
    """Test the public features of the user API."""

    def setUp(self):
        self.client = APIClient()

    def test_create_user_success(self):
        """Test creating a user is successful."""
        from core.models import Agency
        
        agency = Agency.objects.create(
            name='Test Agency',
            location='Test Location',
            city='La Paz',
        )
        
        payload = {
            'email': 'test1@example.com',
            'password': 'testpass',
            'first_name': 'Test',
            'last_name': 'User',
            'ci': '1234567',
            'phone': '12345678',
            'address': 'Test Address',
            'agency': agency.id,
        }
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = get_user_model().objects.get(email=payload['email'])
        self.assertTrue(user.check_password(payload['password']))
        self.assertNotIn('password', res.data)

    def test_user_with_email_exists_error(self):
        """Test error returned if user with email exists."""
        payload = {
            'email': 'test1@example.com',
            'password': 'testpass',
            'first_name': 'Test',
            'last_name': 'User',
            'ci': '1234567',
            'phone': '12345678',
            'address': 'Test Address',
        }
        create_user(**payload)
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            res.data['email'],
            ['Ya existe user con este email.']
        )

    def test_password_too_short_error(self):
        """Test error returned if password less than 5 characters."""
        payload = {
            'email': 'test1@example.com',
            'password': 'pw',
            'first_name': 'Test',
            'last_name': 'User',
            'ci': '1234567',
            'phone': '12345678',
            'address': 'Test Address',
        }
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = get_user_model().objects.filter(
            email=payload['email']
        ).exists()
        self.assertFalse(user_exists)

    def test_create_token_for_user(self):
        """Test generate token for valid credentials."""
        user_details = {
            'first_name': 'Test',
            'last_name': 'User1',
            'email': 'test1@example.com',
            'password': 'testpass123',
            'ci': '1234567',
            'phone': '12345678',
            'address': 'Test Address',
        }
        create_user(**user_details)

        payload = {
            'email': user_details['email'],
            'password': user_details['password'],
        }
        res = self.client.post(TOKEN_URL, payload)

        self.assertIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_create_token_invalid_credentials(self):
        """Test returns error if credentials invalid."""
        create_user(email='invalid@test.com', password='testpass123')

        payload = {
            'email': 'test1@example.com',
            'password': 'badpass'
        }
        res = self.client.post(TOKEN_URL, payload)

        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_blank_password(self):
        """Test returns error if password is blank."""
        payload = {
            'email': 'test1@example.com',
            'password': '',
        }
        res = self.client.post(TOKEN_URL, payload)

        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_user_unauthorized(self):
        """Test authentication is required for users."""
        res = self.client.get(ME_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateUserApiTests(TestCase):
    """Test API requests that require authentication."""

    def setUp(self):
        self.user = create_user(
            email='test1@example.com',
            password='testpass',
            first_name='Test',
            last_name='User',
            ci='1234567',
            phone='12345678',
            address='Test Address',
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_retrieve_profile_success(self):
        """Test retrieving profile for logged in user."""
        res = self.client.get(ME_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, {
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'ci': self.user.ci,
            'phone': self.user.phone,
            'address': self.user.address,
            'agency': self.user.agency.id,
            'permissions': ['can_view_reports'],
        })

    def test_post_me_not_allowed(self):
        """Test POST is not allowed on the me endpoint."""
        res = self.client.post(ME_URL, {})

        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_update_user_profile(self):
        """Test updating the user profile for authenticated user."""
        payload = {'first_name': 'New', 'last_name': 'Name', 'password': 'newpassword'}

        res = self.client.patch(ME_URL, payload)

        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, payload['first_name'])
        self.assertEqual(self.user.last_name, payload['last_name'])
        self.assertTrue(self.user.check_password(payload['password']))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
