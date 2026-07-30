from decimal import Decimal
from unittest import TestCase
from sale.services.asign_product_warehouse_service import (
    AssignProductWarehouseService,
)
from core.models import (
    Batch, Category, MeasureUnit, Product, ProductStock, Warehouse,
)
import uuid


def create_warehouse(**params):
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Warehouse {unique_suffix}',
        'location': 'Test location',
    }
    defaults.update(params)

    return Warehouse.objects.create(**defaults)


def create_category(**params):
    """Create and return a sample category."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Sample Category {unique_suffix}',
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


def create_measure_unit(**params):
    """Create and return a sample measure unit."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Unit {unique_suffix}',
    }
    defaults.update(params)
    return MeasureUnit.objects.create(**defaults)


def create_product(**params):
    """Create and return a sample product."""
    unique_suffix = str(uuid.uuid4())[:8]
    defaults = {
        'name': f'Sample Product {unique_suffix}',
        'batch': create_batch(),
        'code': f'Sample Code {unique_suffix}',
        'measure_unit': create_measure_unit(),
        'description': 'Sample Description',
        'image': None,
        'minimum_sale_price': 100,
        'maximum_sale_price': 2500,
    }
    defaults.update(params)

    return Product.objects.create(**defaults)


class TestAssignProductWarehouseService(TestCase):
    """Tests for assigning a product to a warehouse."""

    def setUp(self):
        self.product = create_product()
        self.warehouse = create_warehouse()

    def test_assign_product_warehouse_creates_new_stock(self):
        """Test creating a new ProductStock when none exists yet."""
        service = AssignProductWarehouseService(
            self.product, self.warehouse, 10
        )
        product_stock = service.assign_product_warehouse()

        self.assertEqual(
            ProductStock.objects.filter(
                product=self.product, warehouse=self.warehouse,
            ).count(), 1
        )
        self.assertEqual(product_stock.stock, Decimal('10'))
        self.assertEqual(product_stock.available_stock, Decimal('10'))

    def test_assign_product_warehouse_increases_existing_stock(self):
        """Test increasing stock of an existing ProductStock."""
        ProductStock.objects.create(
            product=self.product,
            warehouse=self.warehouse,
            stock=20,
            available_stock=15,
        )

        service = AssignProductWarehouseService(
            self.product, self.warehouse, 5
        )
        product_stock = service.assign_product_warehouse()

        self.assertEqual(
            ProductStock.objects.filter(
                product=self.product, warehouse=self.warehouse,
            ).count(), 1
        )
        self.assertEqual(product_stock.stock, Decimal('25'))
        self.assertEqual(product_stock.available_stock, Decimal('20'))

    def test_assign_product_warehouse_accepts_decimal_string_quantity(self):
        """Test quantity passed as a string is converted to Decimal."""
        service = AssignProductWarehouseService(
            self.product, self.warehouse, '7.5'
        )
        product_stock = service.assign_product_warehouse()

        self.assertEqual(product_stock.stock, Decimal('7.5'))
        self.assertEqual(product_stock.available_stock, Decimal('7.5'))
