"""
Database models for the application.
"""
from email.policy import default
import os
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

class UserManager(BaseUserManager):
    """Manager for users."""
    def create_user(self, email, password=None, **extra_fields):
        """Create and return a user with an email and password."""
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password, **extra_fields):
        """Create and return a superuser with an email and password."""
        user = self.create_user(email, password, **extra_fields)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)

        return user

    
class Agency(models.Model):
    CITY_CHOICES = (
        ('La Paz', 'LP'),
        ('Cochabamba', 'CBBA'),
        ('Santa Cruz', 'SCZ'),
        ('Tarija', 'TJA'),
        ('Oruro', 'OR'),
        ('Potosi', 'PT'),
        ('Chuquisaca', 'CH'),
        ('Beni', 'BE'),
        ('Pando', 'PD'),
    )
    name = models.CharField(
        max_length=255, 
        unique=True, 
        null=False, 
        blank=False, 
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9\s_-]+$',
                message="El nombre solo puede contener letras, números, espacios, guiones y guiones bajos."
            )
        ]
    )
    location = models.CharField(
        max_length=255,
        null=False, 
        blank=False, 
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9\s_-]+$',
                message="La ubicación solo puede contener letras, números, espacios, guiones y guiones bajos."
            )
        ]
    )
    city = models.CharField(max_length=15, choices=CITY_CHOICES, default='Potosi')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name}"


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model that supports using email instead of username."""
    CHOICES = (
		(1, 'cajero'),
		(2, 'almacenero'),
		(3, 'vendedor'),
		(4, 'administrador')
	)
    agency = models.ForeignKey(
        Agency,
        on_delete=models.PROTECT,
        related_name='users', 
        blank=True,
        null=True
    )
    user_type = models.IntegerField(choices=CHOICES, default=4)
    first_name = models.CharField(
        max_length=255, 
        null=False, 
        blank=False, 
        validators=[
            RegexValidator(
                regex=r'^[a-zA-ZÀ-ÿ\s]+$',
                message="El nombre solo puede contener letras y espacios."
            )
        ]
    )
    last_name = models.CharField(
        max_length=255, 
        null=False, 
        blank=False, 
        validators=[
            RegexValidator(
                regex=r'^[a-zA-ZÀ-ÿ\s]+$',
                message="El apellido solo puede contener letras y espacios."
            )
        ]
    )
    ci = models.CharField(
        max_length=50, 
        unique=True, 
        null=False, 
        blank=False,
        validators=[
            RegexValidator(
                regex=r'^\d{7,11}(-[A-Z]{2})?$',
                message=(
                    "El CI/NIT debe tener 7-11 dígitos seguidos opcionalmente de un guión "
                    "y 2 letras mayúsculas (e.g., 1234567-AB o 12345678)."
                )
            )
        ]
    )
    phone = models.CharField(
        max_length=255, 
        null=False, 
        blank=False, 
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{8}$',
                message="El número de teléfono debe tener 8 dígitos."
            )
        ]
    )
    email = models.EmailField(max_length=20, unique=True, null=False, blank=False)
    address = models.CharField(max_length=150, null=False, blank=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'ci', 'phone', 'address']
    
    def can_create_sale(self):
        """Check if the user can create a sale."""
        return self.user_type in [3, 4] and self.is_active

    def __str__(self):
        return self.first_name + ' ' + self.last_name


class Seller(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    commission = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    
class Setting(models.Model):
    name = models.CharField(max_length=150, null=False, blank=False, unique=True)
    value = models.CharField(max_length=150, null=False, blank=False, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class Client(models.Model):
    CLIENT_TYPE_CHOICES = (
        ('distribucion', 'Distribución'),
        ('showroom', 'Showroom'),
        ('proyecto', 'Proyectos'),
    )
    name = models.CharField(
        max_length=100, 
        null=False, 
        blank=False, 
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9\s]+$',
                message="El nombre solo puede contener letras, números y espacios."
            )
        ]
    )
    phone = models.CharField(
        max_length=10, 
        null=False, 
        blank=True, 
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{8}$',
                message="El número de teléfono debe tener 8 dígitos."
            )
        ]
    )
    nit = models.CharField(
        max_length=50,
        unique=True,
        null=False,
        blank=False,
        validators=[
            RegexValidator(
                regex=r'^\d{7,11}(-[A-Z]{2})?$',
                message=(
                    "El CI/NIT debe tener 7-11 dígitos seguidos opcionalmente de un guión "
                    "y 2 letras mayúsculas (e.g., 1234567-AB o 12345678)."
                )
            )
        ]
    )
    email = models.EmailField(max_length=50, unique=True, null=False, blank=True)
    address = models.CharField(max_length=150, null=False, blank=True)
    client_type = models.CharField(max_length=20, choices=CLIENT_TYPE_CHOICES, default='showroom')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Warehouse(models.Model):
    agency = models.ForeignKey(Agency, on_delete=models.PROTECT, related_name='agencies')
    name = models.CharField(
        max_length=255, 
        unique=True, 
        null=False, 
        blank=False, 
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9\s_-]+$',
                message="El nombre solo puede contener letras, números, espacios, guiones y guiones bajos."
            )
        ]
    )
    location = models.CharField(
        max_length=255,
        null=False, 
        blank=False, 
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9\s_-]+$',
                message="La ubicación solo puede contener letras, números, espacios, guiones y guiones bajos."
            )
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Category(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT)
    name = models.CharField(
        max_length=255, 
        unique=True, 
        null=False, 
        blank=False, 
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9\s_-]+$',
                message="El nombre solo puede contener letras, números, espacios, guiones y guiones bajos."
            )
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Batch(models.Model):
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    name = models.CharField(
        max_length=255, 
        unique=True, 
        null=False, 
        blank=False, 
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9\s_-]+$',
                message="El nombre solo puede contener letras, números, espacios, guiones y guiones bajos."
            )
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.PROTECT)
    name = models.CharField(
        max_length=150,
        unique=True,
        null=False,
        blank=False,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9\s_-]+$',
                message="El nombre solo puede contener letras, números, espacios, guiones y guiones bajos."
            )
        ]
    )
    stock = models.PositiveIntegerField(default=0)
    reserved_stock = models.PositiveIntegerField(default=0)
    available_stock = models.PositiveIntegerField(default=0)
    code = models.CharField(
        max_length=50,
        unique=True,
        null=False,
        blank=False,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9\s_-]+$',
                message="El código solo puede contener letras, números, espacios, guiones y guiones bajos."
            )
        ]
    )
    unit_of_measurement = models.CharField(
        max_length=10,
        null=False,
        blank=False,
    )
    description = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    minimum_stock = models.PositiveIntegerField(default=0)
    maximum_stock = models.PositiveIntegerField(default=0)
    minimum_sale_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    maximum_sale_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.code}"
    
    def delete_image(self):
        """Delete the image file from storage."""
        if self.image:
            if os.path.exists(self.image.path):
                os.remove(self.image.path)
            self.image = None
            self.save(update_fields=['image'])
    
    def save(self, *args, **kwargs):
        if self.minimum_stock > self.maximum_stock:
            raise ValidationError("El stock mínimo no puede ser mayor al stock máximo.")
        if self.minimum_sale_price > self.maximum_sale_price:
            raise ValidationError("El precio de venta mínimo no puede ser mayor al precio de venta máximo.")
        super().save(*args, **kwargs)

        max_width = 800
        max_height = 800

        if self.image:
            image = Image.open(self.image)
            if image.width > max_width or image.height > max_height:
                image.thumbnail((max_width, max_height))
                buffer = BytesIO()
                image.save(buffer, format='JPEG', quality=75)
                filename = self.image.name
                self.image.save(filename, ContentFile(buffer.getvalue()), save=False)
                super().save(*args, **kwargs)
                
                
class Supplier(models.Model):
    product = models.ManyToManyField(Product, related_name='suppliers')
    name = models.CharField(
        max_length=150, 
        null=False, 
        blank=False, 
        validators=[
            RegexValidator(
                regex=r'^[a-zA-ZÀ-ÿ\s]+$',
                message="El nombre solo puede contener letras y espacios."
            )
        ]
    )
    phone = models.CharField(
        max_length=10, 
        null=False, 
        blank=False, 
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{8}$',
                message="El número de teléfono debe tener 8 dígitos."
            )
        ]
    )
    nit = models.CharField(
        max_length=50,
        unique=True,
        null=False,
        blank=False,
        validators=[
            RegexValidator(
                regex=r'^\d{7,11}(-[A-Z]{2})?$',
                message=(
                    "El NIT debe tener 7-11 dígitos seguidos opcionalmente de un guión "
                    "y 2 letras mayúsculas (e.g., 1234567-AB o 12345678)."
                )
            )
        ]
    )
    email = models.EmailField(max_length=50, unique=True, null=False, blank=True)
    address = models.CharField(max_length=150, null=False, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

                
class SellingChannel(models.Model):
    product = models.ManyToManyField(Product, related_name='selling_channels', through='ProductChannelPrice')
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    

class ProductChannelPrice(models.Model):
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    selling_channel = models.ForeignKey(SellingChannel, on_delete=models.PROTECT, related_name='product_channel_price')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)


class Purchase(models.Model):
    STATUS_CHOICES = (
        ('realizado', 'Realizada'),
        ('terminado', 'Terminada'),
    )
    PURCHASE_TYPE_CHOICES = (
        ('contado', 'Pago al contado'),
        ('credito', 'Pago a crédito')
    )
    agency = models.ForeignKey(Agency, on_delete=models.PROTECT, related_name='purchases')
    buyer = models.ForeignKey(User, on_delete=models.PROTECT)
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT)
    purchase_type = models.CharField(max_length=25, choices=PURCHASE_TYPE_CHOICES, default='contado')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='realizado')
    purchase_date = models.DateField(null=False, blank=False)
    purchase_end_date=models.DateField(null=True, blank=True)
    invoice_number = models.CharField(
        max_length=50,
        unique=True,
        null=False,
        blank=False,
        validators=[
            RegexValidator(
                regex=r'^\d+$',
                message="El número de factura solo puede contener números."
            )
        ]
    )
    total = models.DecimalField(max_digits=10, decimal_places=2)
    balance_due = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    
class PurchaseItem(models.Model):
    purchase = models.ForeignKey(Purchase, on_delete=models.PROTECT, related_name='purchase_items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)


class Entry(models.Model):
    warehouse_keeper = models.ForeignKey(User, on_delete=models.PROTECT)
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT)
    purchase = models.OneToOneField(
        Purchase,
        on_delete=models.PROTECT,
        blank=True,
        null=True
    )
    entry_date = models.DateField(null=False, blank=False)
    invoice_number = models.CharField(
        max_length=50, 
        null=False, 
        blank=False,
        validators=[
            RegexValidator(
                regex=r'^\d+$',
                message="El número de factura solo puede contener números."
            )
        ]
    )
    note = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.supplier.name} - {self.entry_date}"


class EntryItem(models.Model):
    entry = models.ForeignKey(Entry, on_delete=models.PROTECT, related_name='entry_items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.product.name} - {self.quantity}"
    
    
class Output(models.Model):
    warehouse_keeper = models.ForeignKey(User, on_delete=models.PROTECT)
    client = models.ForeignKey(Client, on_delete=models.PROTECT)
    sale = models.OneToOneField(
        'Sale',
        on_delete=models.PROTECT,
        blank=True,
        null=True
    )
    output_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.client.name} - {self.output_date}"
    
    
class OutputItem(models.Model):
    output = models.ForeignKey(Output, on_delete=models.PROTECT, related_name='output_items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField()

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"


class Sale(models.Model):
    STATUS_CHOICES = (
        ('proforma', 'Proforma'),
        ('realizado', 'Realizada'),
        ('terminado', 'Terminada'),
        ('rechazado', 'Rechazada')
    )
    SALE_TYPE_CHOICES = (
        ('proforma', 'Proforma'),
        ('contado', 'Pago al contado'),
        ('credito', 'Pago a crédito')
    )
    agency = models.ForeignKey(Agency, on_delete=models.PROTECT, related_name='sales')
    client = models.ForeignKey(Client, on_delete=models.PROTECT)
    selling_channel = models.ForeignKey(SellingChannel, on_delete=models.PROTECT)
    seller = models.ForeignKey(User, on_delete=models.PROTECT)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    balance_due = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='proforma')
    sale_type = models.CharField(max_length=25, choices=SALE_TYPE_CHOICES, default='contado')
    sale_date = models.DateField(null=False, blank=False)
    sale_perform_date = models.DateField(null=True, blank=True)
    sale_done_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.seller.first_name} {self.seller.last_name} - ${self.total}"
    

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.PROTECT, related_name='sale_items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    sub_total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    discount = models.FloatField(default=0.0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"
    
class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ('efectivo', 'Efectivo'),
        ('tarjeta', 'Tarjeta'),
        ('qr', 'QR')
    )
    TRANSACTION_TYPE_CHOICES = (
        ('compra', 'Compra'),
        ('venta', 'Venta'),
    )
    transaction_id = models.PositiveIntegerField(null=False, blank=False)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='efectivo')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES, default='compra')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['transaction_id', 'transaction_type'],
                name='unique_transaction'
            )
        ]
        
    def __str__(self):
        return f"{self.payment_method}"
