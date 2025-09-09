from unittest import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from core.models import Payment, Sale, Purchase, Client, SellingChannel, Supplier
from sale.serializers import PaymentSerializer
import uuid
from datetime import datetime, date

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

def create_client(**params):
    """Create and return a sample Client."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'name': f'Test Client {unique_suffix}',
        'nit': f'1234567{unique_suffix}',
        'phone': '12345678',
        'address': 'Test Address',
        'email': f'c{unique_suffix}@test.com',
        'client_type': 'showroom'
    }
    defaults.update(params)
    return Client.objects.create(**defaults)

def create_supplier(**params):
    """Create and return a sample Supplier."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'name': f'Test Supplier {unique_suffix}',
        'nit': f'1234567{unique_suffix}',
        'phone': '12345678',
        'email': f's{unique_suffix}@test.com',
        'address': 'Test Address',
    }
    defaults.update(params)
    return Supplier.objects.create(**defaults)

def create_selling_channel(**params):
    """Create and return a sample SellingChannel."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'name': f'Test Channel {unique_suffix}',
    }
    defaults.update(params)
    return SellingChannel.objects.create(**defaults)

def create_sale(**params):
    """Create and return a sample Sale."""
    defaults = {
        'client': create_client(),
        'selling_channel': create_selling_channel(),
        'seller': create_user(),
        'total': 10.00,
        'balance_due': 10.00,
        'status': 'generado',
        'sale_type': 'contado',
        'sale_date': date(2024, 1, 1),
    }
    defaults.update(params)
    return Sale.objects.create(**defaults)

def create_purchase(**params):
    """Create and return a sample Purchase."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'buyer': create_user(),
        'supplier': create_supplier(),
        'purchase_type': 'contado',
        'purchase_date': date(2024, 1, 1),
        'invoice_number': f'123456{unique_suffix}',
        'total': 100.00,
        'balance_due': 0.00,
    }
    defaults.update(params)
    return Purchase.objects.create(**defaults)

def create_payment(**params):
    """Create and return a sample Payment."""
    # Create a sale by default if no transaction_id is provided
    if 'transaction_id' not in params:
        sale = create_sale()
        defaults = {
            'transaction_id': sale.id,
            'payment_method': 'tarjeta',
            'transaction_type': 'venta',
            'amount': 100.00,
            'payment_date': date(2024, 1, 2),  # One day after sale_date
        }
    else:
        defaults = {
            'payment_method': 'tarjeta',
            'transaction_type': 'venta',
            'amount': 100.00,
            'payment_date': date(2024, 1, 2),
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
        self.assertEqual(res.data['rows'], serializer.data)
        
    def test_create_payment(self):
        """Test for create a payment."""
        # Create a sale to use as transaction
        sale = create_sale()
        
        payload = {
            'transaction_id': sale.id,
            'payment_method': 'tarjeta',
            'transaction_type': 'venta',
            'amount': 150.00,
            'payment_date': date(2024, 1, 2),  # One day after sale_date
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
        payment = create_payment(payment_method='tarjeta')
        payload = {'payment_method': 'efectivo'}
        
        url = detail_url(payment.id)
        res = self.client.patch(url, payload)
        payment.refresh_from_db()
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(payload['payment_method'], payment.payment_method)
        
    def test_full_update_payment(self):
        """Test for full update a payment."""
        payment = create_payment()
        # Create a purchase to use as transaction
        purchase = create_purchase()
        
        payload = {
            'transaction_id': purchase.id,
            'payment_method': 'efectivo',
            'transaction_type': 'compra',
            'amount': 500.00,
            'payment_date': date(2024, 1, 2),  # One day after purchase_date
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
