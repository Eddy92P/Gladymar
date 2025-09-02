from unittest import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from core.models import Sale, SellingChannel, SaleItem, Product, Warehouse, Agency, Category, Batch, Client
from sale.serializers import SaleSerializer
import uuid
from datetime import datetime

SALE_URL = reverse('sale:sale-list')

def detail_url(sale_id):
    return reverse('sale:sale-detail', args=[sale_id])

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
        'description': 'Test product description',
        'minimum_stock': 10,
        'maximum_stock': 100,
        'minimum_sale_price': 10.00,
        'maximum_sale_price': 50.00,
    }
    defaults.update(params)
    return Product.objects.create(**defaults)

def create_selling_channel(**params):
    defaults = {
        'name': 'Test selling channel',
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
        'sale_date': '2024-01-01',
    }
    
    defaults.update(params)
    sale_items_data = defaults.pop('sale_items', [])
    sale = Sale.objects.create(**defaults)
    
    if sale_items_data:
        for item_data in sale_items_data:
            SaleItem.objects.create(sale=sale, **item_data)
    else:
        SaleItem.objects.create(
            sale=sale,
            product=create_product(),
            quantity=10,
            unit_price=10.00,
            total_price=10.00,
        )
    
    return sale


class PublicSaleApiTests(TestCase):
    """Test API for unauthorized users."""
    def setUp(self):
        self.client = APIClient()
        
    def test_auth_required(self):
        res = self.client.get(SALE_URL)
        
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        
        
class PrivatePurchaseApiTests(TestCase):
    """Test API request for authorized users."""
    def setUp(self):
        self.client = APIClient()
        self.user = create_user(
            password='testpass',
        )

        self.client.force_authenticate(self.user)
        
    def test_retrieve_sale(self):
        """Test for retrieve a list of sales."""
        create_sale()
        create_sale()
        
        res = self.client.get(SALE_URL)
        sales = Sale.objects.all().order_by('-id')
        serializer = SaleSerializer(sales, many=True)
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['rows'], serializer.data)
        
    def test_create_sale(self):
        """Test for create a sale."""
        payload = {
            'client': create_client().id,
            'selling_channel': create_selling_channel().id,
            'total': 100.00,
            'balance_due': 100.00,
            'status': 'generado',
            'sale_type': 'contado',
            'sale_date': '2024-01-01',
            'sale_items': [
                {
                    'product': create_product().id,
                    'quantity': 10,
                    'unit_price': 10.00,
                    'total_price': 100.00,
                }
            ],
            'payments': {
                'payment_method': 'efectivo',
                'transaction_type': 'venta',
                'amount': 100.00,
                'payment_date': '2024-01-01',
            }
        }

        res = self.client.post(SALE_URL, payload, format='json')
        sale = Sale.objects.get(id=res.data['id'])

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(payload['selling_channel'], sale.selling_channel.id)
        self.assertEqual(payload['total'], sale.total)
        for sale_item in sale.sale_items.all():
            self.assertEqual(payload['sale_items'][0]['product'], sale_item.product.id)
            self.assertEqual(payload['sale_items'][0]['quantity'], sale_item.quantity)
            
    def test_partial_update_sale(self):
        """Test for partial update a sale."""
        sale = create_sale(total=100.00)
        payload = {'total': 150.00}
        
        url = detail_url(sale.id)
        res = self.client.patch(url, payload)
        sale.refresh_from_db()
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(payload['total'], sale.total)
        
    def test_full_update_sale(self):
        """Test for full update a sale."""
        sale = create_sale()
        payload = {
            'client': create_client().id,
            'selling_channel': create_selling_channel().id,
            'total': 100.00,
            'balance_due': 100.00,
            'status': 'generado',
            'sale_type': 'contado',
            'sale_date': '2024-01-01',
            'sale_items': [
                {
                    'product': create_product().id,
                    'quantity': 50,
                    'unit_price': 50.00,
                    'total_price': 2500.00,
                }
            ]
        }
        
        url = detail_url(sale.id)
        res = self.client.put(url, payload, format='json')
        sale.refresh_from_db()
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(payload['total'], sale.total)
        self.assertEqual(payload['balance_due'], sale.balance_due)
        self.assertEqual(payload['status'], sale.status)
        self.assertEqual(payload['sale_type'], sale.sale_type)
        self.assertEqual(datetime.strptime(payload['sale_date'], '%Y-%m-%d').date(), sale.sale_date)
        sale_items = list(sale.sale_items.all())
        self.assertEqual(len(payload['sale_items']), len(sale_items))
        for i, payload_item in enumerate(payload['sale_items']):
            db_item = sale_items[i]
            self.assertEqual(payload_item['quantity'], db_item.quantity)
            self.assertEqual(payload_item['unit_price'], db_item.unit_price)
            self.assertEqual(payload_item['total_price'], db_item.total_price)
        