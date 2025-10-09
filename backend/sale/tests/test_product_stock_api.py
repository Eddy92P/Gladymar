"""
Tests for the ProductStock API
"""
import uuid
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework.test import APIClient
from rest_framework import status

from core.models import (
    ProductStock,
    Product,
    Warehouse,
    Agency,
    Category,
    Batch
)


def create_user(**params):
    """Helper function to create a user."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'email': f'test{unique_suffix}@example.com',
        'password': 'testpass123',
        'first_name': 'Test',
        'last_name': 'User',
    }
    defaults.update(params)
    return get_user_model().objects.create_user(**defaults)


def create_product_stock(**params):
    """Helper function to create a product stock."""
    unique_suffix = str(uuid.uuid4())[:8]
    
    # Create category
    category = Category.objects.create(name=f'Test Category {unique_suffix}')
    
    # Create batch
    batch = Batch.objects.create(
        name=f'Test Batch {unique_suffix}',
        category=category
    )
    
    # Create product
    product = Product.objects.create(
        name=f'Test Product {unique_suffix}',
        code=f'TEST-{unique_suffix}',
        batch=batch,
        minimum_sale_price=10.00,
        maximum_sale_price=100.00
    )
    
    # Create agency
    agency = Agency.objects.create(
        name=f'Test Agency {unique_suffix}',
        location=f'Test Location {unique_suffix}',
        city='La Paz'
    )
    
    # Create warehouse
    warehouse = Warehouse.objects.create(
        agency=agency,
        name=f'Test Warehouse {unique_suffix}',
        location=f'Test Location {unique_suffix}'
    )
    
    defaults = {
        'product': product,
        'warehouse': warehouse,
        'stock': 100,
        'reserved_stock': 20,
        'available_stock': 80,
        'damaged_stock': 0,
        'minimum_stock': 10,
        'maximum_stock': 200
    }
    defaults.update(params)
    
    return ProductStock.objects.create(**defaults)


class PublicProductStockApiTests(TestCase):
    """Test unauthenticated API requests."""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_auth_required(self):
        """Test that authentication is required for accessing the endpoint."""
        product_stock = create_product_stock()
        url = reverse('sale:productstock-increment-damaged-stock', args=[product_stock.id])
        res = self.client.post(url, {'quantity': 10})
        
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateProductStockApiTests(TestCase):
    """Test authenticated API requests."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.client.force_authenticate(self.user)
    
    def test_increment_damaged_stock_success(self):
        """Test successfully incrementing damaged stock."""
        product_stock = create_product_stock(
            stock=100,
            reserved_stock=20,
            available_stock=80,
            damaged_stock=5
        )
        
        url = reverse('sale:productstock-increment-damaged-stock', args=[product_stock.id])
        payload = {'quantity': 10}
        
        res = self.client.post(url, payload)
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['damaged_stock'], 15)
        self.assertIn('Stock dañado incrementado en 10 unidades', res.data['message'])
        
        # Verify in database
        product_stock.refresh_from_db()
        self.assertEqual(product_stock.damaged_stock, 15)
    
    def test_increment_damaged_stock_exceeds_available(self):
        """Test that incrementing damaged stock beyond available stock fails."""
        product_stock = create_product_stock(
            stock=100,
            reserved_stock=20,
            available_stock=80,
            damaged_stock=0
        )
        
        url = reverse('sale:productstock-increment-damaged-stock', args=[product_stock.id])
        payload = {'quantity': 90}  # Exceeds available_stock of 80
        
        res = self.client.post(url, payload)
        
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quantity', res.data)
        self.assertIn('no puede ser mayor al stock disponible', str(res.data['quantity']))
        
        # Verify damaged_stock was not changed
        product_stock.refresh_from_db()
        self.assertEqual(product_stock.damaged_stock, 0)
    
    def test_increment_damaged_stock_exactly_available(self):
        """Test incrementing damaged stock with exact available stock amount."""
        product_stock = create_product_stock(
            stock=100,
            reserved_stock=20,
            available_stock=80,
            damaged_stock=0
        )
        
        url = reverse('sale:productstock-increment-damaged-stock', args=[product_stock.id])
        payload = {'quantity': 80}  # Exactly equal to available_stock
        
        res = self.client.post(url, payload)
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['damaged_stock'], 80)
        
        # Verify in database
        product_stock.refresh_from_db()
        self.assertEqual(product_stock.damaged_stock, 80)
    
    def test_increment_damaged_stock_negative_quantity(self):
        """Test that negative quantity is rejected."""
        product_stock = create_product_stock()
        
        url = reverse('sale:productstock-increment-damaged-stock', args=[product_stock.id])
        payload = {'quantity': -10}
        
        res = self.client.post(url, payload)
        
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quantity', res.data)
    
    def test_increment_damaged_stock_zero_quantity(self):
        """Test that zero quantity is rejected."""
        product_stock = create_product_stock()
        
        url = reverse('sale:productstock-increment-damaged-stock', args=[product_stock.id])
        payload = {'quantity': 0}
        
        res = self.client.post(url, payload)
        
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quantity', res.data)
    
    def test_increment_damaged_stock_missing_quantity(self):
        """Test that missing quantity field is rejected."""
        product_stock = create_product_stock()
        
        url = reverse('sale:productstock-increment-damaged-stock', args=[product_stock.id])
        payload = {}
        
        res = self.client.post(url, payload)
        
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quantity', res.data)
    
    def test_increment_damaged_stock_with_existing_damaged_stock(self):
        """Test incrementing damaged stock when there's already some damaged stock."""
        product_stock = create_product_stock(
            stock=100,
            reserved_stock=20,
            available_stock=60,
            damaged_stock=20
        )
        
        url = reverse('sale:productstock-increment-damaged-stock', args=[product_stock.id])
        payload = {'quantity': 30}
        
        res = self.client.post(url, payload)
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['damaged_stock'], 50)
        
        # Verify in database
        product_stock.refresh_from_db()
        self.assertEqual(product_stock.damaged_stock, 50)
    
    def test_increment_damaged_stock_exceeds_with_existing_damaged(self):
        """Test validation still works when there's existing damaged stock."""
        product_stock = create_product_stock(
            stock=100,
            reserved_stock=20,
            available_stock=50,
            damaged_stock=30
        )
        
        url = reverse('sale:productstock-increment-damaged-stock', args=[product_stock.id])
        payload = {'quantity': 60}  # Exceeds available_stock of 50
        
        res = self.client.post(url, payload)
        
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quantity', res.data)
        
        # Verify damaged_stock was not changed
        product_stock.refresh_from_db()
        self.assertEqual(product_stock.damaged_stock, 30)

