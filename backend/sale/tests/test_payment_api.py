from unittest import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from core.models import Payment
from sale.serializers import PaymentSerializer
import uuid
from datetime import datetime

PAYMENT_URL = reverse('sale:payment-list')

def detail_url(payment_id):
    return reverse('sale:payment-detail', args=[payment_id])

def create_user(**params):
    """Create and return a sample User."""
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

def create_payment(**params):
    defaults = {
        'transaction_id': 1,
        'payment_method': 'card',
        'transaction_type': 'sale',
        'amount': 100.00,
        'payment_date': datetime.now().date(),
    }
    defaults.update(params)
    
    return Payment.objects.create(**defaults)


class PublicPaymentApiTests(TestCase):
    """Test API for unauthorized users."""
    def setUp(self):
        self.client = APIClient()
        
    def test_auth_required(self):
        res = self.client.get(PAYMENT_URL)
        
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivatePaymentApiTests(TestCase):
    """Test API for authorized users."""
    def setUp(self):
        self.client = APIClient()
        self.user = create_user()

        self.client.force_authenticate(self.user)
        
    def test_retrieve_payment(self):
        """Test for retrieve a list of payments."""
        create_payment()
        create_payment()
        
        payment = Payment.objects.all().order_by('-id')
        serializer = PaymentSerializer(payment, many=True)
        res = self.client.get(PAYMENT_URL)
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)
        
    def test_create_payment(self):
        """Test for create a payment."""
        payload = {
            'transaction_id': 2,
            'payment_method': 'card',
            'transaction_type': 'sale',
            'amount': 150.00,
            'payment_date': datetime.now().date(),
        }
        
        res = self.client.post(PAYMENT_URL, payload)
        payment = Payment.objects.get(id=res.data['id'])
        
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(payload['transaction_id'], payment.transaction_id)
        self.assertEqual(payload['payment_method'], payment.payment_method)
        self.assertEqual(payload['transaction_type'], payment.transaction_type)
        self.assertEqual(payload['amount'], payment.amount)
        self.assertEqual(payload['payment_date'], payment.payment_date)
        
    def test_partial_update_payment(self):
        """Test for partial update a payment."""
        payment = create_payment(payment_method='card')
        payload = {'payment_method': 'cash'}
        
        url = detail_url(payment.id)
        res = self.client.patch(url, payload)
        payment.refresh_from_db()
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(payload['payment_method'], payment.payment_method)
        
    def test_full_update_payment(self):
        """Test for full update a payment."""
        payment = create_payment()
        payload = {
            'transaction_id': 3,
            'payment_method': 'cash',
            'transaction_type': 'purchase',
            'amount': 500.00,
            'payment_date': datetime.now().date(),
        }

        url = detail_url(payment.id)
        res = self.client.put(url, payload)
        payment.refresh_from_db()

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(payload['transaction_id'], payment.transaction_id)
        self.assertEqual(payload['payment_method'], payment.payment_method)
        self.assertEqual(payload['transaction_type'], payment.transaction_type)
        self.assertEqual(payload['amount'], payment.amount)
        self.assertEqual(payload['payment_date'], payment.payment_date)
