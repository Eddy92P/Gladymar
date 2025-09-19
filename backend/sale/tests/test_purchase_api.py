from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from core.models import Batch, Category, Warehouse, Agency, Supplier, Product, Purchase, PurchaseItem, Payment
from sale.serializers import PurchaseSerializer
import uuid
from datetime import date

PURCHASE_URL = reverse('sale:purchase-list')

def detail_url(purchase_id):
    return reverse('sale:purchase-detail', args=[purchase_id])

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
        'agency': create_agency(),
    }
    defaults.update(params)
    return get_user_model().objects.create_user(**defaults)

def create_agency(**params):
    """Create and return a sample Agency."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'name': f'TestAgency{unique_suffix}',
        'location': f'TestLocation{unique_suffix}',
        'city': 'PT',
    }
    defaults.update(params)
    return Agency.objects.create(**defaults)

def create_warehouse(**params):
    """Create and return a sample Warehouse."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'agency': create_agency(),
        'name': f'TestWarehouse{unique_suffix}',
        'location': f'TestLocation{unique_suffix}',
    }
    defaults.update(params)
    return Warehouse.objects.create(**defaults)

def create_category(**params):
    """Create and return a sample Category."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'warehouse': create_warehouse(),
        'name': f'TestCategory{unique_suffix}',
    }
    defaults.update(params)
    return Category.objects.create(**defaults)

def create_batch(**params):
    """Create and return a sample Batch."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'category': create_category(),
        'name': f'TestBatch{unique_suffix}',
    }
    defaults.update(params)
    return Batch.objects.create(**defaults)

def create_product(**params):
    """Create and return a sample Product."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'batch': create_batch(),
        'name': f'TestProduct{unique_suffix}',
        'code': f'CODE{unique_suffix}',
        'unit_of_measurement': 'UN',
        'stock': 50,
        'reserved_stock': 0,
        'available_stock': 50,
        'description': 'Test product description',
        'minimum_stock': 10,
        'maximum_stock': 100,
        'minimum_sale_price': 10.00,
        'maximum_sale_price': 50.00,
    }
    defaults.update(params)
    return Product.objects.create(**defaults)

def create_supplier(**params):
    """Create and return a sample Supplier."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'name': f'TestSupplier{unique_suffix}',
        'phone': '12345678',
        'nit': f'1234567{unique_suffix}',
        'email': f'supplier{unique_suffix}@test.com',
        'address': 'Test Address',
    }
    
    # Separar los campos many-to-many de los campos normales
    products = params.pop('product', None)
    defaults.update(params)

    supplier = Supplier.objects.create(**defaults)

    if products:
        supplier.product.set(products)

    return supplier


def create_purchase(**params):
    """Create and return a sample Purchase."""
    unique_suffix = str(uuid.uuid4())[:4]
    defaults = {
        'agency': create_agency(),
        'buyer': create_user(),
        'supplier': create_supplier(),
        'purchase_type': 'contado',
        'purchase_date': date(2024, 1, 1),
        'invoice_number': f'123456{unique_suffix}',
        'total': 100.00,
        'balance_due': 0.00,
    }
    defaults.update(params)
    
    purchase_items_data = defaults.pop('purchase_items', None)
    purchase = Purchase.objects.create(**defaults)
    
    if purchase_items_data:
        for item_data in purchase_items_data:
            PurchaseItem.objects.create(purchase=purchase, **item_data)
    else:
        PurchaseItem.objects.create(
            purchase=purchase,
            product=create_product(),
            quantity=10,
            unit_price=10.00,
            total_price=100.00,
        )

    return purchase

def create_payment(**params):
    # Generate unique transaction_id to avoid constraint violations
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'transaction_id': int(unique_suffix, 16) % 10000,  # Generate unique transaction_id
        'payment_method': 'efectivo',
        'transaction_type': 'compra',
        'amount': 50.00,
        'payment_date': '2025-01-01',
    }
    defaults.update(params)

    return Payment.objects.create(**defaults)


class PublicPurchaseApiTests(TestCase):
    """Tests for an user when is unauthenticated."""
    def setUp(self):
        self.client = APIClient()
        
    def test_auth_required(self):
        res = self.client.get(PURCHASE_URL)
        
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
    
    
class PrivatePurchaseApiTests(TestCase):
    """Test for an user is authorized."""
    def setUp(self):
        self.client = APIClient()
        self.user = create_user(
            email='test@example.com',
            password='testpass',
        )

        self.client.force_authenticate(self.user)

    def test_retrieve_purchases(self):
        """Test retrieving a list of purchases."""
        create_purchase()
        create_purchase()

        res = self.client.get(PURCHASE_URL)

        purchases = Purchase.objects.all().order_by('-id')
        serializer = PurchaseSerializer(purchases, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['rows'], serializer.data)

    def test_create_purchase(self):
        """Test creating a purchase."""
        agency = create_agency()
        payload = {
            'agency': agency.id,
            'supplier': create_supplier().id,
            'purchase_type': 'contado',
            'purchase_date': '2024-01-01',
            'invoice_number': '123456789',
            'total': 150.00,
            'balance_due': 150.00,
            'purchase_items': [
                {
                    'product': create_product().id,
                    'quantity': 2,
                    'unit_price': 25.00,
                    'total_price': 50.00
                },
                {
                    'product': create_product().id,
                    'quantity': 1,
                    'unit_price': 100.00,
                    'total_price': 100.00
                }
            ],
            'payments': {
                'payment_method': 'efectivo',
                'transaction_type': 'compra',
                'amount': 150.00,
                'payment_date': '2024-01-01',
            }
        }

        res = self.client.post(PURCHASE_URL, payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        purchase = Purchase.objects.get(id=res.data['id'])

        self.assertEqual(purchase.supplier.id, payload['supplier'])
        self.assertEqual(purchase.purchase_type, payload['purchase_type'])
        self.assertEqual(purchase.invoice_number, payload['invoice_number'])
        self.assertEqual(float(purchase.total), payload['total'])
        self.assertEqual(float(purchase.balance_due), 0.0)
