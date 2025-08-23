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
        user = get_user_model().objects.create_user(
            email=email,
            password=password,
            first_name='Test',
            last_name='User',
            ci='1234567',
            phone='12345678',
            address='Test Address',
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
        for i, (email, expected) in enumerate(sample_emails):
            user = get_user_model().objects.create_user(
                email, 
                'sample123',
                first_name='Test',
                last_name='User',
                ci=f'123456{i+1}',
                phone='12345678',
                address='Test Address',
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
        user = get_user_model().objects.create_superuser(
            'test@example.com',
            'testpass123',
        )
        self.assertTrue(user.is_superuser)
    
    def test_create_seller(self):
        """Test creating a seller"""
        user = get_user_model().objects.create_user(
            'test@example.com',
            'testpass123',
            first_name='Test',
            last_name='User',
            ci='1234567',
            phone='12345678',
            address='Test Address',
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
            warehouse=Warehouse.objects.create(
                agency=Agency.objects.create(
                    name='Test Agency',
                    location='Test Agency Location',
                    city='LP',
                ),
                name='Test Warehouse',
                location='Test Location',
            ),
            name='Test Category',
        )
        self.assertEqual(category.name, 'Test Category')

    def test_create_batch(self):
        """Test creating a Batch."""
        batch = Batch.objects.create(
            category=Category.objects.create(
                warehouse=Warehouse.objects.create(
                    agency=Agency.objects.create(
                        name='Test Agency',
                        location='Test Agency Location',
                        city='LP',
                    ),
                    name='Test Warehouse',
                    location='Test Location',
                ),
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
                    warehouse=Warehouse.objects.create(
                        agency=Agency.objects.create(
                            name='Test Agency',
                            location='Test Agency Location',
                            city='LP',
                        ),
                        name='Test Warehouse',
                        location='Test Location',
                    ),
                    name='Test Category',
                ),
                name='Test Batch',
            ),
            name='Test Product',
            stock=10,
            code='1234567890',
            unit_of_measurement='Test Unit',
            description='Test Description',
            minimum_stock=10,
            maximum_stock=20,
            minimum_sale_price=10,
            maximum_sale_price=20,
        )
        self.assertEqual(product.name, 'Test Product')
        self.assertEqual(product.stock, 10)
        self.assertEqual(product.code, '1234567890')
        self.assertEqual(product.unit_of_measurement, 'Test Unit')
        self.assertEqual(product.description, 'Test Description')
        self.assertEqual(product.minimum_stock, 10)
        self.assertEqual(product.maximum_stock, 20)
        self.assertEqual(product.minimum_sale_price, 10)
        self.assertEqual(product.maximum_sale_price, 20)
        
    def test_create_product_with_invalid_stock(self):
        """Test creating a Product with invalid stock."""
        with self.assertRaises(ValidationError):
            Product.objects.create(
                batch=Batch.objects.create(
                    category=Category.objects.create(
                        warehouse=Warehouse.objects.create(
                            agency=Agency.objects.create(
                                name='Test Agency',
                                location='Test Agency Location',
                                city='LP',
                            ),
                            name='Test Warehouse',
                            location='Test Location',
                        ),
                        name='Test Category',
                    ),
                    name='Test Batch',
                ),
                name='Test Product',
                stock=20,
                code='1234567890',
                unit_of_measurement='Test Unit',
                minimum_stock=20,
                maximum_stock=10,
                minimum_sale_price=10,
                maximum_sale_price=20,
            )
            
    def test_create_product_with_invalid_sale_price(self):
        """Test creating a Product with invalid sale price."""
        with self.assertRaises(ValidationError):
            Product.objects.create(
                batch=Batch.objects.create(
                    category=Category.objects.create(
                        warehouse=Warehouse.objects.create(
                            agency=Agency.objects.create(
                                name='Test Agency',
                                location='Test Agency Location',
                                city='LP',
                            ),
                            name='Test Warehouse',
                            location='Test Location',
                        ),
                        name='Test Category',
                    ),
                    name='Test Batch',
                ),
                name='Test Product',
                stock=10,
                code='1234567890',
                unit_of_measurement='Test Unit',
                minimum_stock=10,
                maximum_stock=20,
                minimum_sale_price=20,
                maximum_sale_price=10,
            )
    
    def test_create_entry(self):
        """Test creating a Entry."""
        entry = Entry.objects.create(
            warehouse_keeper=get_user_model().objects.create_user(
                email='testuser@example.com',
                password='testpass123',
                first_name='Test',
                last_name='User',
                ci='1234567',
                phone='12345678',
                address='Test Address',
                user_type=4,
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
        entry_item = EntryItem.objects.create(
            entry=Entry.objects.create(
                warehouse_keeper=get_user_model().objects.create_user(
                    email='testuser@example.com',
                    password='testpass123',
                    first_name='Test',
                    last_name='User',
                    ci='1234567',
                    phone='12345678',
                    address='Test Address',
                    user_type=4,
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
            product=Product.objects.create(
                batch=Batch.objects.create(
                    category=Category.objects.create(
                        warehouse=Warehouse.objects.create(
                            agency=Agency.objects.create(
                                name='Test Agency',
                                location='Test Agency Location',
                                city='LP',
                            ),
                            name='Test Warehouse',
                            location='Test Location',
                        ),
                        name='Test Category',
                    ),
                    name='Test Batch',
                ),
                name='Test Product',
                stock=10,
                code='1234567890',
                unit_of_measurement='Test Unit',
                description='Test Description',
                minimum_stock=10,
                maximum_stock=20,
                minimum_sale_price=10,
                maximum_sale_price=20,
            ),
            quantity=10,
            unit_price=10,
            total_price=100,
        )
        self.assertEqual(entry_item.quantity, 10)
        self.assertEqual(entry_item.unit_price, 10)
        self.assertEqual(entry_item.total_price, 100)
        
    def test_create_output(self):
        """Test creating a Output."""
        output = Output.objects.create(
            warehouse_keeper=get_user_model().objects.create_user(
                'test@example.com',
                'testpass123',
                first_name='Test',
                last_name='User',
                ci='1234567',
                phone='12345678',
                address='Test Address',
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
        output_item = OutputItem.objects.create(
            output=Output.objects.create(
                warehouse_keeper=get_user_model().objects.create_user(
                    'test@example.com',
                    'testpass123',
                    first_name='Test',
                    last_name='User',
                    ci='1234567',
                    phone='12345678',
                    address='Test Address',
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
            product=Product.objects.create(
                batch=Batch.objects.create(
                    category=Category.objects.create(
                        warehouse=Warehouse.objects.create(
                            agency=Agency.objects.create(
                                name='Test Agency',
                                location='Test Agency Location',
                            ),
                            name='Test Warehouse',
                            location='Test Location',
                        ),
                        name='Test Category',
                    ),
                    name='Test Batch',
                ),
                name='Test Product',
                stock=10,
                code='1234567890',
                unit_of_measurement='Test Unit',
                description='Test Description',
                minimum_stock=10,
                maximum_stock=20,
                minimum_sale_price=10,
                maximum_sale_price=20,
            ),
            quantity=10,
        )
        self.assertEqual(output_item.quantity, 10)
        
    def test_create_sale(self):
        """Test creating a Sale."""
        sale = Sale.objects.create(
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
            ),
            total=100,
            status='pending',
            sale_date='2025-01-01',
        )
        self.assertEqual(sale.total, 100)
        self.assertEqual(sale.status, 'pending')
        
    def test_create_sale_item(self):
        """Test creating a SaleItem."""
        sale_item = SaleItem.objects.create(
            sale=Sale.objects.create(
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
                ),
                total=100,
                status='pending',
                sale_date='2025-01-01',
            ),
            product=Product.objects.create(
                batch=Batch.objects.create(
                    category=Category.objects.create(
                        warehouse=Warehouse.objects.create(
                            agency=Agency.objects.create(
                                name='Test Agency',
                                location='Test Agency Location',
                                city='LP',
                            ),
                            name='Test Warehouse',
                            location='Test Location',
                        ),
                        name='Test Category',
                    ),
                    name='Test Batch',
                ),
                name='Test Product',
                stock=10,
                code='1234567890',
                unit_of_measurement='Test Unit',
                description='Test Description',
                minimum_stock=10,
                maximum_stock=20,
                minimum_sale_price=10,
                maximum_sale_price=20,
            ),
            quantity=10,
            unit_price=10,
            total_price=100,
        )
        self.assertEqual(sale_item.quantity, 10)
        self.assertEqual(sale_item.unit_price, 10)
        self.assertEqual(sale_item.total_price, 100)
