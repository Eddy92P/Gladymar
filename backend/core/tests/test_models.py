from zoneinfo import available_timezones
from django.test import TestCase
from core.models import *
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

class ModelTest(TestCase):
    """Test models."""
    def test_create_user_with_email_succesful(self):
        """Test creating a user with an email is successful"""
        email = 'test@example.com'
        password = 'testpass123'
        agency = Agency.objects.create(
            name='Test Agency',
            location='Test Agency Location',
            city='LP',
        )
        user = get_user_model().objects.create_user(
            email=email,
            password=password,
            first_name='Test',
            last_name='User',
            ci='1234567',
            phone='12345678',
            address='Test Address',
            agency=agency,
        )
        
        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password(password))
        
    def test_new_user_email_normalized(self):
        """Test the email for a new user is normalized"""
        sample_emails = [
            ['test1@EXAMPLE.com', 'test1@example.com'],
            ['Test2@Example.com', 'Test2@example.com'],
            ['TEST3@EXAMPLE.COM', 'TEST3@example.com'],
            ['test4@example.COM', 'test4@example.com'],
        ]
        agency = Agency.objects.create(
            name='Test Agency',
            location='Test Agency Location',
            city='LP',
        )
        for i, (email, expected) in enumerate(sample_emails):
            user = get_user_model().objects.create_user(
                email, 
                'sample123',
                first_name='Test',
                last_name='User',
                ci=f'123456{i+1}',
                phone='12345678',
                address='Test Address',
                agency=agency,
            )
            self.assertEqual(user.email, expected)
    
    def test_new_user_without_email_raises_error(self):
        """Test that creating a user without an email raises a ValueError"""
        with self.assertRaises(ValueError):
            get_user_model().objects.create_user(
                '', 
                'sample123',
                first_name='Test',
                last_name='User',
                ci='1234569',
                phone='12345678',
                address='Test Address',
            )
            
    def test_create_superuser(self):
        """Test creating a superuser"""
        agency = Agency.objects.create(
            name='Test Agency',
            location='Test Agency Location',
            city='LP',
        )
        user = get_user_model().objects.create_superuser(
            'test@example.com',
            'testpass123',
            agency=agency,
        )
        self.assertTrue(user.is_superuser)
    
    def test_create_seller(self):
        """Test creating a seller"""
        agency = Agency.objects.create(
            name='Test Agency',
            location='Test Agency Location',
            city='LP',
        )
        user = get_user_model().objects.create_user(
            'test@example.com',
            'testpass123',
            first_name='Test',
            last_name='User',
            ci='1234567',
            phone='12345678',
            address='Test Address',
            agency=agency,
        )
        seller = Seller.objects.create(user=user, commission=10)
        self.assertEqual(seller.user, user)
        self.assertEqual(seller.commission, 10)
        
    def test_create_setting(self):
        """Test creating a setting"""
        setting = Setting.objects.create(
            name='Test Setting',
            value='Test Value',
        )
        self.assertEqual(setting.name, 'Test Setting')
        self.assertEqual(setting.value, 'Test Value')
        
    def test_create_supplier(self):
        """Test creating a supplier"""
        supplier = Supplier.objects.create(
            name='Test Supplier',
            phone='12345678',
            nit='1234567890',
            email='test@example.com',
            address='Test Address',
        )
        self.assertEqual(supplier.name, 'Test Supplier')
        self.assertEqual(supplier.phone, '12345678')
        self.assertEqual(supplier.nit, '1234567890')
        self.assertEqual(supplier.email, 'test@example.com')
        self.assertEqual(supplier.address, 'Test Address')

    def test_create_selling_channel(self):
        """Test creating a selling channel"""
        selling_channel = SellingChannel.objects.create(
            name='Test Selling Channel',
        )
        self.assertEqual(selling_channel.name, 'Test Selling Channel')
        self.assertIsNotNone(selling_channel.created_at)
        self.assertIsNotNone(selling_channel.updated_at)
        
    def test_create_agency(self):
        """Test creating an agency"""
        setting = Agency.objects.create(
            name='Test Setting',
            location='Test Value',
            city='La Paz',
        )
        self.assertEqual(setting.name, 'Test Setting')
        self.assertEqual(setting.location, 'Test Value')
        self.assertEqual(setting.city, 'LP')
        
    def test_create_client(self):
        """Test creating a Client."""
        client = Client.objects.create(
            name='Test Client',
            phone='12345678',
            nit='1234567890',
            email='test@example.com',
            address='Test Address',
        )
        self.assertEqual(client.name, 'Test Client')
        self.assertEqual(client.phone, '12345678')
        self.assertEqual(client.nit, '1234567890')
        self.assertEqual(client.email, 'test@example.com')
        self.assertEqual(client.address, 'Test Address')
        
    def test_create_agency(self):
        """Test creating an Agency."""
        agency = Agency.objects.create(
            name='Test Agency',
            location='Test Agency Location',
            city='La Paz',
        )
        self.assertEqual(agency.name, 'Test Agency')
        self.assertEqual(agency.location, 'Test Agency Location')
        self.assertEqual(agency.city, 'La Paz')
        
    def test_create_warehouse(self):
        """Test creating a Warehouse."""
        warehouse = Warehouse.objects.create(
            agency=Agency.objects.create(
                name='Test Setting',
                location='Test Value',
                city='LP',
            ),
            name='Test Warehouse',
            location='Test Location',
        )
        self.assertEqual(warehouse.name, 'Test Warehouse')
        self.assertEqual(warehouse.location, 'Test Location')

    def test_create_category(self):
        """Test creating a Category."""
        category = Category.objects.create(
            name='Test Category',
        )
        self.assertEqual(category.name, 'Test Category')

    def test_create_batch(self):
        """Test creating a Batch."""
        batch = Batch.objects.create(
            category=Category.objects.create(
                name='Test Category',
            ),
            name='Test Batch',
        )
        self.assertEqual(batch.name, 'Test Batch')

    def test_create_product(self):
        """Test creating a Product."""
        product = Product.objects.create(
            batch=Batch.objects.create(
                category=Category.objects.create(
                    name='Test Category',
                ),
                name='Test Batch',
            ),
            name='Test Product',
            code='1234567890',
            unit_of_measurement='Test Unit',
            description='Test Description',
            minimum_sale_price=10,
            maximum_sale_price=20,
        )
        self.assertEqual(product.name, 'Test Product')
        self.assertEqual(product.code, '1234567890')
        self.assertEqual(product.unit_of_measurement, 'Test Unit')
        self.assertEqual(product.description, 'Test Description')
        self.assertEqual(product.minimum_sale_price, 10)
        self.assertEqual(product.maximum_sale_price, 20)
        
    def test_create_product_with_invalid_stock(self):
        """Test creating a Product Stock with invalid stock."""
        with self.assertRaises(ValidationError):
            ProductStock.objects.create(
                product=Product.objects.create(
                    batch=Batch.objects.create(
                        category=Category.objects.create(
                            name='Test Category',
                        ),
                        name='Test Batch',
                    ),
                    name='Test Product',
                    code='1234567890',
                    unit_of_measurement='Test Unit',
                    description='Test Description',
                    minimum_sale_price=10,
                    maximum_sale_price=20,
                ),
                warehouse=Warehouse.objects.create(
                    agency=Agency.objects.create(
                        name='Test Agency 5',
                        location='Test Location',
                        city='LP',
                    ),
                    name='Test Warehouse',
                    location='Test Location 2',
                ),
                stock=50,
                reserved_stock=10,
                available_stock=40,
                minimum_stock=70,
                maximum_stock=60,
            ),
            
    def test_create_product_with_invalid_sale_price(self):
        """Test creating a Product with invalid sale price."""
        with self.assertRaises(ValidationError):
            Product.objects.create(
                batch=Batch.objects.create(
                    category=Category.objects.create(
                        name='Test Category',
                    ),
                    name='Test Batch',
                ),
                name='Test Product',
                code='1234567890',
                unit_of_measurement='Test Unit',
                minimum_sale_price=20,
                maximum_sale_price=10,
            )
    
    def test_create_entry(self):
        """Test creating a Entry."""
        agency = Agency.objects.create(
            name='Test Agency Entry',
            location='Test Agency Location',
            city='LP',
        )
        entry = Entry.objects.create(
            agency=agency,
            warehouse_keeper=get_user_model().objects.create_user(
                email='testuser@example.com',
                password='testpass123',
                first_name='Test',
                last_name='User',
                ci='1234567',
                phone='12345678',
                address='Test Address',
                user_type=4,
                agency=agency,
            ),
            supplier=Supplier.objects.create(
                name='Test Supplier',
                phone='12345678',
                nit='1234567890',
                email='test@example.com',
                address='Test Address',
            ),
            entry_date='2025-01-01',
            invoice_number='1234567890',
        )
        self.assertEqual(entry.entry_date, '2025-01-01')
        self.assertEqual(entry.invoice_number, '1234567890')
        
    def test_create_entry_item(self):
        """Test creating a EntryItem."""
        agency = Agency.objects.create(
            name='Test Agency Entry Item',
            location='Test Agency Location',
            city='LP',
        )
        entry_item = EntryItem.objects.create(
            entry=Entry.objects.create(
                agency=agency,
                warehouse_keeper=get_user_model().objects.create_user(
                    email='testuser@example.com',
                    password='testpass123',
                    first_name='Test',
                    last_name='User',
                    ci='1234567',
                    phone='12345678',
                    address='Test Address',
                    user_type=4,
                    agency=agency,
                ),
                supplier=Supplier.objects.create(
                    name='Test Supplier',
                    phone='12345678',
                    nit='1234567890',
                    email='test@example.com',
                    address='Test Address',
                ),
                entry_date='2025-01-01',
                invoice_number='1234567890',
            ),
            product_stock=ProductStock.objects.create(
                product=Product.objects.create(
                    batch=Batch.objects.create(
                        category=Category.objects.create(
                            name='Test Category',
                        ),
                        name='Test Batch',
                    ),
                    name='Test Product',
                    code='1234567890',
                    unit_of_measurement='Test Unit',
                    description='Test Description',
                    minimum_sale_price=10,
                    maximum_sale_price=20,
                ),
                warehouse=Warehouse.objects.create(
                    agency=Agency.objects.create(
                        name='Test Agency 5',
                        location='Test Location',
                        city='LP',
                    ),
                    name='Test Warehouse',
                    location='Test Location 2',
                ),
                stock=50,
                reserved_stock=10,
                available_stock=40,
                minimum_stock=10,
                maximum_stock=60,
            ),
            quantity=10,
        )
        self.assertEqual(entry_item.quantity, 10)
        
    def test_create_output(self):
        """Test creating a Output."""
        agency = Agency.objects.create(
            name='Test Agency Output',
            location='Test Agency Location',
            city='LP',
        )
        output = Output.objects.create(
            agency=agency,
            warehouse_keeper=get_user_model().objects.create_user(
                'test@example.com',
                'testpass123',
                first_name='Test',
                last_name='User',
                ci='1234567',
                phone='12345678',
                address='Test Address',
                agency=agency,
            ),
            client=Client.objects.create(
                name='Test Client',
                phone='12345678',
                nit='1234567890',
                email='test@example.com',
                address='Test Address',
            ),
            output_date='2025-01-01',
        )
        self.assertEqual(output.output_date, '2025-01-01')
        
    def test_create_output_item(self):
        """Test creating a OutputItem."""
        agency = Agency.objects.create(
            name='Test Agency Output Item',
            location='Test Agency Location',
            city='LP',
        )
        output_item = OutputItem.objects.create(
            output=Output.objects.create(
                agency=agency,
                warehouse_keeper=get_user_model().objects.create_user(
                    'test@example.com',
                    'testpass123',
                    first_name='Test',
                    last_name='User',
                    ci='1234567',
                    phone='12345678',
                    address='Test Address',
                    agency=agency,
                ),
                client=Client.objects.create(
                    name='Test Client',
                    phone='12345678',
                    nit='1234567890',
                    email='test@example.com',
                    address='Test Address',
                ),
                output_date='2025-01-01',
            ),
            product_stock=ProductStock.objects.create(
                product=Product.objects.create(
                    batch=Batch.objects.create(
                        category=Category.objects.create(
                            name='Test Category',
                        ),
                        name='Test Batch',
                    ),
                    name='Test Product',
                    code='1234567890',
                    unit_of_measurement='Test Unit',
                    description='Test Description',
                    minimum_sale_price=10,
                    maximum_sale_price=20,
                ),
                warehouse=Warehouse.objects.create(
                    agency=Agency.objects.create(
                        name='Test Agency 5',
                        location='Test Location',
                        city='LP',
                    ),
                    name='Test Warehouse',
                    location='Test Location 2',
                ),
                stock=50,
                reserved_stock=10,
                available_stock=40,
                minimum_stock=10,
                maximum_stock=60,
            ),
            quantity=10,
        )
        self.assertEqual(output_item.quantity, 10)
        
    def test_create_purchase(self):
        """Test creating a Purchase."""
        agency = Agency.objects.create(
            name='Test Agency Purchase',
            location='Test Agency1 Location',
            city='LP',
        )
        purchase = Purchase.objects.create(
            agency=agency,
            supplier=Supplier.objects.create(
                name='Test Supplier',
                phone='75871255',
                nit='12345677',
                email='test@example.com',
                address='Test Address',
            ),
            purchase_type= 'contado',
            buyer=User.objects.create(
                email='test13@example.com',
                password='testpass41234',
                first_name='Test231',
                last_name='User412',
                ci='1234577',
                phone='12345611',
                address='Test Address',
                agency=agency,
            ),
            total=100,
            balance_due=100,
            status='pending',
            purchase_date='2025-01-01',
            purchase_end_date='2025-01-10',
        )
        self.assertEqual(purchase.total, 100)
        self.assertEqual(purchase.status, 'pending')
        
    def test_create_purchase_item(self):
        """Test creating a Purchase Item."""
        agency = Agency.objects.create(
            name='Test Agency1 Purchase Item',
            location='Test Agency1 Location',
            city='LP',
        )
        purchase_item = PurchaseItem.objects.create(
            purchase=Purchase.objects.create(
                agency=agency,
                supplier=Supplier.objects.create(
                    name='Test Supplier 2',
                    phone='75872256',
                    nit='12347678',
                    email='test32@example.com',
                    address='Test Address',
                ),
                purchase_type= 'contado',
                buyer=User.objects.create(
                    email='test111@example.com',
                    password='testpass1123',
                    first_name='Test11',
                    last_name='UserE',
                    ci='1234561',
                    phone='12345678',
                    address='Test Address',
                    agency=agency,
                ),
                total=100,
                balance_due=100,
                status='pending',
                purchase_date='2025-01-01',
            ),
            product_stock=ProductStock.objects.create(
                product=Product.objects.create(
                    batch=Batch.objects.create(
                        category=Category.objects.create(
                            name='Test Category',
                        ),
                        name='Test Batch',
                    ),
                    name='Test Product',
                    code='1234567890',
                    unit_of_measurement='Test Unit',
                    description='Test Description',
                    minimum_sale_price=10,
                    maximum_sale_price=20,
                ),
                warehouse=Warehouse.objects.create(
                    agency=Agency.objects.create(
                        name='Test Agency 5',
                        location='Test Location',
                        city='LP',
                    ),
                    name='Test Warehouse',
                    location='Test Location 2',
                ),
                stock=50,
                reserved_stock=10,
                available_stock=40,
                minimum_stock=10,
                maximum_stock=60,
            ),
            quantity=10,
            unit_price=10,
            total_price=100,
            entered_stock=5,
        )
        self.assertEqual(purchase_item.quantity, 10)
        self.assertEqual(purchase_item.unit_price, 10)
        self.assertEqual(purchase_item.total_price, 100)
        
    def test_create_sale(self):
        """Test creating a Sale."""
        agency = Agency.objects.create(
            name='Test Agency Sale',
            location='Test Agency Location',
            city='LP',
        )
        sale = Sale.objects.create(
            agency=agency,
            client=Client.objects.create(
                name='Test Client',
                phone='75871256',
                nit='12345678',
                email='test@example.com',
                address='Test Address',
            ),
            selling_channel=SellingChannel.objects.create(
                name='Test Selling Channel',
            ),
            seller=User.objects.create(
                email='test@example.com',
                password='testpass123',
                first_name='Test',
                last_name='User',
                ci='1234567',
                phone='12345678',
                address='Test Address',
                agency=agency,
            ),
            total=100,
            status='pending',
            sale_date='2025-01-01',
        )
        self.assertEqual(sale.total, 100)
        self.assertEqual(sale.status, 'pending')
        
    def test_create_sale_item(self):
        """Test creating a SaleItem."""
        agency = Agency.objects.create(
            name='Test Agency Sale Item',
            location='Test Agency Location',
            city='LP',
        )
        sale_item = SaleItem.objects.create(
            sale=Sale.objects.create(
                agency=agency,
                client=Client.objects.create(
                    name='Test Client',
                    phone='75871256',
                    nit='12345678',
                    email='test@example.com',
                    address='Test Address',
                ),
                selling_channel=SellingChannel.objects.create(
                    name='Test Selling Channel',
                ),
                seller=User.objects.create(
                    email='test@example.com',
                    password='testpass123',
                    first_name='Test',
                    last_name='User',
                    ci='1234567',
                    phone='12345678',
                    address='Test Address',
                    agency=agency,
                ),
                total=100,
                status='pending',
                sale_date='2025-01-01',
            ),
            product_stock=ProductStock.objects.create(
                product=Product.objects.create(
                    batch=Batch.objects.create(
                        category=Category.objects.create(
                            name='Test Category',
                        ),
                        name='Test Batch',
                    ),
                    name='Test Product',
                    code='1234567890',
                    unit_of_measurement='Test Unit',
                    description='Test Description',
                    minimum_sale_price=10,
                    maximum_sale_price=20,
                ),
                warehouse=Warehouse.objects.create(
                    agency=Agency.objects.create(
                        name='Test Agency 5',
                        location='Test Location',
                        city='LP',
                    ),
                    name='Test Warehouse',
                    location='Test Location 2',
                ),
                stock=50,
                reserved_stock=10,
                available_stock=40,
                minimum_stock=10,
                maximum_stock=60,
            ),
            quantity=10,
            unit_price=10,
            total_price=100,
            dispatched_stock=5,
        )
        self.assertEqual(sale_item.quantity, 10)
        self.assertEqual(sale_item.unit_price, 10)
        self.assertEqual(sale_item.total_price, 100)
