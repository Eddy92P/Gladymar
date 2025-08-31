from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from core.models import Batch, Category, Warehouse, Product, Supplier, Agency
from sale.serializers import ProductSerializer
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
import uuid
import os
import shutil

PRODUCT_URL = reverse('sale:product-list')

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
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'agency': Agency.objects.create(
            name=f'Test Agency {unique_suffix}',
            location=f'Test Agency Location {unique_suffix}',
            city='La Paz',
        ),
        'name': f'Sample Warehouse {unique_suffix}',
        'location': 'Sample Location',
    }
    defaults.update(params)
    warehouse = Warehouse.objects.create(**defaults)
    return warehouse

def create_category(**params):
    """Create and return a sample category."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Sample Category {unique_suffix}',
        'warehouse': create_warehouse(),
    }
    defaults.update(params)
    category = Category.objects.create(**defaults)
    return category

def create_batch(**params):
    """Create and return a sample batch."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Sample Batch {unique_suffix}',
        'category': create_category(),
    }
    defaults.update(params)
    batch = Batch.objects.create(**defaults)
    return batch

def create_supplier(**params):
    """Create and return a sample supplier."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Sample Supplier {unique_suffix}',
        'phone': '12345678',
        'nit': f'NIT-{unique_suffix}',
        'email': f'sample{unique_suffix}@example.com',
        'address': 'Sample Address',
    }
    defaults.update(params)
    supplier = Supplier.objects.create(**defaults)
    return supplier

def create_product(**params):
    """Create and return a sample product."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Sample Product {unique_suffix}',
        'batch': create_batch(),
        'stock': 100,
        'code': f'Sample Code {unique_suffix}',
        'unit_of_measurement': 'Unit',
        'description': 'Sample Description',
        'image': None,
        'minimum_stock': 10,
        'maximum_stock': 100,
        'minimum_sale_price': 100,
        'maximum_sale_price': 100,
    }
    defaults.update(params)
    
    # Handle supplier separately since it's a ManyToManyField
    supplier = defaults.pop('supplier', None)
    if supplier is None:
        supplier = create_supplier()
    
    product = Product.objects.create(**defaults)
    product.suppliers.add(supplier)
    return product

def create_test_image(name='test_image.jpg', content=None):
    """Create a test image file for testing."""
    if content is None:
        # Default to a minimal valid JPEG
        content = (
            b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00'
            b'\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08'
            b'\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e'
            b'\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9'
        )
    return SimpleUploadedFile(
        name=name,
        content=content,
        content_type='image/jpeg'
    )

def detail_url(product_id):
    """Return the URL for a product detail view."""
    return reverse('sale:product-detail', args=[product_id])


def cleanup_test_media():
    """Clean up test media files after tests."""
    if hasattr(settings, 'MEDIA_ROOT') and settings.MEDIA_ROOT:
        if os.path.exists(settings.MEDIA_ROOT):
            shutil.rmtree(settings.MEDIA_ROOT)


class PublicProductApiTests(TestCase):
    """Test API requests for unauthenticated users."""
    def setUp(self):
        self.client = APIClient()

    def tearDown(self):
        """Clean up after each test."""
        cleanup_test_media()

    def test_auth_required(self):
        """Test that authentication is required for accessing the endpoint."""
        res = self.client.get(PRODUCT_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

class PrivateProductApiTests(TestCase):
    """Test API requests for authenticated users."""
    def setUp(self):
        self.client = APIClient()
        self.user = create_user(
            email='test@example.com',
            password='testpass',
        )
        self.client.force_authenticate(self.user)

    def tearDown(self):
        """Clean up after each test."""
        cleanup_test_media()
        
    def test_retrieve_products(self):
        """Test retrieving a list of products."""
        create_product()
        create_product()
        res = self.client.get(PRODUCT_URL)
        products = Product.objects.all().order_by('-id')
        serializer = ProductSerializer(products, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['rows'], serializer.data)

    def test_create_product_with_image(self):
        """Test creating a product with an uploaded image."""
        batch = create_batch()
        
        # Create a valid test image file (minimal JPEG)
        # This is a minimal valid JPEG file content
        image_content = (
            b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00'
            b'\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08'
            b'\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e'
            b'\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9'
        )
        image = SimpleUploadedFile(
            name='test_image.jpg',
            content=image_content,
            content_type='image/jpeg'
        )
        
        # Use unique values to avoid conflicts
        unique_suffix = str(uuid.uuid4())[:8]
        supplier = create_supplier()
        payload = {
            'name': f'Test Product with Image {unique_suffix}',
            'batch_id': batch.id,
            'stock': 50,
            'code': f'TEST001_{unique_suffix}',
            'unit_of_measurement': 'Unit',
            'description': 'Test product with image',
            'image': image,
            'minimum_stock': 10,
            'maximum_stock': 100,
            'minimum_sale_price': 120.00,
            'maximum_sale_price': 200.00,
            'supplier': [supplier.id],
        }
        
        res = self.client.post(PRODUCT_URL, payload, format='multipart')
        
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        product = Product.objects.get(id=res.data['id'])
        self.assertEqual(product.name, payload['name'])
        self.assertTrue(product.image)
        self.assertIn('test_image', product.image.name)
        
        # Clean up the uploaded file
        if product.image:
            if os.path.exists(product.image.path):
                os.remove(product.image.path)

    def test_create_product_without_image(self):
        """Test creating a product without an image."""
        batch = create_batch()

        unique_suffix = str(uuid.uuid4())[:8]
        supplier = create_supplier()
        payload = {
            'name': f'Test Product without Image {unique_suffix}',
            'batch_id': batch.id,
            'stock': 25,
            'code': f'TEST002_{unique_suffix}',
            'unit_of_measurement': 'Unit',
            'description': 'Test product without image',
            'minimum_stock': 5,
            'maximum_stock': 50,
            'minimum_sale_price': 80.00,
            'maximum_sale_price': 150.00,
            'supplier': [supplier.id],
        }
        
        res = self.client.post(PRODUCT_URL, payload)
        
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        product = Product.objects.get(id=res.data['id'])
        self.assertEqual(product.name, payload['name'])
        self.assertFalse(product.image)

    def test_update_product_image(self):
        """Test updating a product's image."""
        product = create_product()

        image_content = (
            b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00'
            b'\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08'
            b'\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e'
            b'\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9'
        )
        new_image = SimpleUploadedFile(
            name='updated_image.jpg',
            content=image_content,
            content_type='image/jpeg'
        )
        
        payload = {'image': new_image}
        url = detail_url(product.id)
        res = self.client.patch(url, payload, format='multipart')
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        product.refresh_from_db()
        self.assertTrue(product.image)
        self.assertIn('updated_image', product.image.name)
        
        # Clean up the uploaded file
        if product.image:
            if os.path.exists(product.image.path):
                os.remove(product.image.path)

    def test_update_product_remove_image(self):
        """Test removing a product's image by setting it to null."""

        image_content = (
            b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00'
            b'\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08'
            b'\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e'
            b'\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9'
        )
        image = SimpleUploadedFile(
            name='original_image.jpg',
            content=image_content,
            content_type='image/jpeg'
        )
        
        product = create_product(image=image)
        self.assertTrue(product.image)
        
        # Remove the image - use JSON format to set image to null
        payload = {'image': None}
        url = detail_url(product.id)
        res = self.client.patch(url, payload, format='json')
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        product.refresh_from_db()
        self.assertFalse(product.image)

    def test_invalid_image_format(self):
        """Test uploading an invalid image format."""
        batch = create_batch()
        
        # Create a file that's not an image
        invalid_content = b'this is not an image file'
        invalid_file = SimpleUploadedFile(
            name='invalid_file.txt',
            content=invalid_content,
            content_type='text/plain'
        )

        unique_suffix = str(uuid.uuid4())[:8]
        supplier = create_supplier()
        payload = {
            'name': f'Test Product {unique_suffix}',
            'batch_id': batch.id,
            'stock': 10,
            'code': f'TEST003_{unique_suffix}',
            'unit_of_measurement': 'Unit',
            'image': invalid_file,
            'supplier': [supplier.id],
        }
        
        res = self.client.post(PRODUCT_URL, payload, format='multipart')

        self.assertIn(res.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_422_UNPROCESSABLE_ENTITY])
        
    def test_partial_update_product(self):
        """Test partial update of a product."""
        product = create_product(name='Old Name')
        payload = {'name': 'Updated Name'}
        url = detail_url(product.id)
        res = self.client.patch(url, payload)
        
        product.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(product.name, payload['name'])
        
    def test_full_update_product(self):
        """Test full update of a product."""
        image_content = (
            b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00'
            b'\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08'
            b'\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e'
            b'\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9'
        )
        new_image = SimpleUploadedFile(
            name='updated_image.jpg',
            content=image_content,
            content_type='image/jpeg'
        )
        product = create_product(name='Old Name')
        unique_suffix = str(uuid.uuid4())[:8]
        # Get the current supplier IDs
        supplier_ids = list(product.suppliers.values_list('id', flat=True))
        payload = {
            'name': 'Updated Name',
            'batch_id': product.batch.id,
            'stock': 100,
            'code': f'TEST004_{unique_suffix}',
            'unit_of_measurement': 'Unit',
            'description': 'Updated Description',
            'image': new_image,
            'minimum_stock': 10,
            'maximum_stock': 100,
            'minimum_sale_price': 120.00,
            'maximum_sale_price': 200.00,
            'supplier': supplier_ids,
        }
        url = detail_url(product.id)
        res = self.client.put(url, payload, format='multipart')
        
        product.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(product.name, payload['name'])
        
    def test_not_delete_product(self):
        """Test that a product cannot be deleted via API."""
        product = create_product()
        url = detail_url(product.id)
        res = self.client.delete(url)
        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertTrue(Product.objects.filter(id=product.id).exists())
        
    def test_minimum_stock_and_maximum_stock(self):
        """Test minimum stock can't be greater than maximum stock"""
        product = create_product(minimum_stock=0, maximum_stock=0)
        payload = {'minimum_stock': 15, 'maximum_stock': 10}
        url = detail_url(product.id)
        res = self.client.patch(url, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['minimum_stock'][0], 'El stock mínimo no puede ser mayor al máximo.')
        
    def test_minimum_sale_price_and_maximum_sale_price(self):
        """Test minimum sale price can't be greater than maximum sale price"""
        product = create_product(minimum_sale_price=0, maximum_sale_price=0)
        payload = {'minimum_sale_price': 15, 'maximum_sale_price': 10}
        url = detail_url(product.id)
        res = self.client.patch(url, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['minimum_sale_price'][0], 'El precio de venta mínimo no puede ser mayor al máximo.')
        
    def test_stock_greater_than_maximum(self):
        """Test stock can't be greater than maximum stock."""
        unique_suffix = str(uuid.uuid4())[:8]
        batch = create_batch()
        supplier = create_supplier()
        payload = {
            'name': f'Test Product with Image {unique_suffix}',
            'batch_id': batch.id,
            'stock': 50,
            'code': f'TEST001_{unique_suffix}',
            'unit_of_measurement': 'Unit',
            'description': 'Test product with image',
            'image': '',
            'minimum_stock': 10,
            'maximum_stock': 20,
            'minimum_sale_price': 120.00,
            'maximum_sale_price': 200.00,
            'supplier': [supplier.id],
        }
        
        res = self.client.post(PRODUCT_URL, payload)
        
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['stock'][0], 'El stock no puede ser mayor al máximo.')
        
    def test_stock_lower_than_minimum(self):
        """Test stock can't be lower than minimum stock."""
        unique_suffix = str(uuid.uuid4())[:8]
        batch = create_batch()
        supplier = create_supplier()
        payload = {
            'name': f'Test Product with Image {unique_suffix}',
            'batch_id': batch.id,
            'stock': 10,
            'code': f'TEST001_{unique_suffix}',
            'unit_of_measurement': 'Unit',
            'description': 'Test product with image',
            'image': '',
            'minimum_stock': 50,
            'maximum_stock': 100,
            'minimum_sale_price': 120.00,
            'maximum_sale_price': 200.00,
            'supplier': [supplier.id],
        }
        
        res = self.client.post(PRODUCT_URL, payload)
        
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['stock'][0], 'El stock no puede ser menor al mínimo.')
