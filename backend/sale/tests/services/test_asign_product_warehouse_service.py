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
        'category': create_category(),
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
        self.batch = create_batch()

    def test_assign_product_warehouse_creates_new_stock(self):
        """Test creating a new ProductStock when none exists yet."""
        service = AssignProductWarehouseService(
            self.product, self.warehouse, self.batch, 10
        )
        product_stock = service.assign_product_warehouse()

        self.assertEqual(
            ProductStock.objects.filter(
                product=self.product,
                warehouse=self.warehouse,
                batch=self.batch,
            ).count(), 1
        )
        self.assertEqual(product_stock.stock, Decimal('10'))
        self.assertEqual(product_stock.available_stock, Decimal('10'))

    def test_assign_product_warehouse_increases_existing_stock(self):
        """Test increasing stock of an existing ProductStock."""
        ProductStock.objects.create(
            product=self.product,
            warehouse=self.warehouse,
            batch=self.batch,
            stock=20,
            available_stock=15,
        )

        service = AssignProductWarehouseService(
            self.product, self.warehouse, self.batch, 5
        )
        product_stock = service.assign_product_warehouse()

        self.assertEqual(
            ProductStock.objects.filter(
                product=self.product,
                warehouse=self.warehouse,
                batch=self.batch,
            ).count(), 1
        )
        self.assertEqual(product_stock.stock, Decimal('25'))
        self.assertEqual(product_stock.available_stock, Decimal('20'))

    def test_assign_product_warehouse_creates_row_for_different_batch(self):
        """Same product and warehouse with a different batch creates a new row."""
        ProductStock.objects.create(
            product=self.product,
            warehouse=self.warehouse,
            batch=self.batch,
            stock=20,
            available_stock=20,
        )
        other_batch = create_batch()

        service = AssignProductWarehouseService(
            self.product, self.warehouse, other_batch, 8
        )
        product_stock = service.assign_product_warehouse()

        self.assertEqual(
            ProductStock.objects.filter(
                product=self.product, warehouse=self.warehouse,
            ).count(), 2
        )
        self.assertEqual(product_stock.batch, other_batch)
        self.assertEqual(product_stock.stock, Decimal('8'))
        self.assertEqual(product_stock.available_stock, Decimal('8'))

    def test_assign_product_warehouse_accepts_decimal_string_quantity(self):
        """Test quantity passed as a string is converted to Decimal."""
        service = AssignProductWarehouseService(
            self.product, self.warehouse, self.batch, '7.5'
        )
        product_stock = service.assign_product_warehouse()

        self.assertEqual(product_stock.stock, Decimal('7.5'))
        self.assertEqual(product_stock.available_stock, Decimal('7.5'))
