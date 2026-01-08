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
router.register('product-stocks', views.ProductStockViewSet)
router.register('suppliers', views.SupplierViewSet)
router.register('entries', views.EntryViewSet)
router.register('outputs', views.OutputViewSet)
router.register('clients', views.ClientViewSet)
router.register('product-channel-prices', views.ProductChannelPriceViewSet)
router.register('selling-channels', views.SellingChannelViewSet)
router.register('purchases', views.PurchaseViewSet)
router.register('sales', views.SaleViewSet)
router.register('payments', views.PaymentViewSet)

app_name = 'sale'

urlpatterns = [
    path('', include(router.urls)),
    path("catalog/", views.CatalogView.as_view(), name="catalog"),
    path('proforma-pdf/<int:id>/', views.InvoicePdfView.as_view(), name='proforma-pdf'),
    path('output-pdf/<int:id>/', views.OutputInvoicePdfView.as_view(), name='output-pdf'),
    path('buy-report-pdf/', views.BuyReportPdfView.as_view(), name='buy-report-pdf'),
    path('sell-report-pdf/', views.SellReportPdfView.as_view(), name='sell-report-pdf'),
    path('entry-report-pdf/', views.EntryReportPdfView.as_view(), name='entry-report-pdf'),
    path('output-report-pdf/', views.OutputReportPdfView.as_view(), name='output-report-pdf'),
    path('buy-report-excel/', views.BuyReportExcelView.as_view(), name='buy-report-excel'),
    path('sale-report-excel/', views.SaleReportExcelView.as_view(), name='sale-report-excel'),
    path('entry-report-excel/', views.EntryReportExcelView.as_view(), name='entry-report-excel'),
    path('output-report-excel/', views.OutputReportExcelView.as_view(), name='output-report-excel'),
]
