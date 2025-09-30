"""
URL mapping for the warehouse API.
"""
from django.urls import path, include

from rest_framework.routers import DefaultRouter

from sale import views

router = DefaultRouter()
router.register('agencies', views.AgencyViewSet)
router.register('warehouses', views.WarehouseViewSet)
router.register('categories', views.CategoryViewSet)
router.register('batches', views.BatchViewSet)
router.register('products', views.ProductViewSet)
router.register('suppliers', views.SupplierViewSet)
router.register('entries', views.EntryViewSet)
router.register('outputs', views.OutputViewSet)
router.register('clients', views.ClientViewSet)
router.register('product-channel-prices', views.ProductChannelPriceViewSet)
router.register('selling-channels', views.SellingChannelViewSet)
router.register('purchases', views.PurchaseViewSet)
router.register('sales', views.SaleViewSet)
router.register('payment', views.PaymentViewSet)

app_name = 'sale'

urlpatterns = [
    path('', include(router.urls)),
    path("catalog/", views.CatalogView.as_view(), name="catalog"),
]
