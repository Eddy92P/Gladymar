"""
Views for warehouse API.
"""
from rest_framework import viewsets, filters
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

from .serializers import *
from core.models import *


class PersonalizedPagination(LimitOffsetPagination):
    default_limit = 10
    max_limit = 100

    def get_paginated_response(self, data):
        return Response({
            'rows': data,
            'total': self.count
        })


class AgencyViewSet(viewsets.ModelViewSet):
    """View for managing agency APIs."""
    serializer_class = AgencySerializer
    queryset = Agency.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put']
    filter_backends = [filters.SearchFilter]
    search_fields = ['id', 'name', 'city']
    pagination_class = PersonalizedPagination

    def get_queryset(self):
        """Retrieve agencies ordered by id."""
        return self.queryset.order_by('-id')


class WarehouseViewSet(viewsets.ModelViewSet):
    """View for managing warehouse APIs."""
    serializer_class = WarehouseSerializer
    queryset = Warehouse.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put']
    filter_backends = [filters.SearchFilter]
    search_fields = ['id', 'name']
    pagination_class = PersonalizedPagination

    def get_queryset(self):
        """Retrieve warehouses ordered by id."""
        return self.queryset.order_by('-id')


class CategoryViewSet(viewsets.ModelViewSet):
    """View for managing category APIs."""
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put']
    filter_backends = [filters.SearchFilter]
    search_fields = ['id', 'name']
    pagination_class = PersonalizedPagination

    def get_queryset(self):
        """Retrieve categories ordered by id."""
        return self.queryset.order_by('-id')


class BatchViewSet(viewsets.ModelViewSet):
    """View for managing batch APIs."""
    serializer_class = BatchSerializer
    queryset = Batch.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put']
    filter_backends = [filters.SearchFilter]
    search_fields = ['id', 'name']
    pagination_class = PersonalizedPagination

    def get_queryset(self):
        """Retrieve batches ordered by id."""
        return self.queryset.order_by('-id')


class ProductViewSet(viewsets.ModelViewSet):
    """View for managing product APIs."""
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put']
    filter_backends = [filters.SearchFilter]
    search_fields = ['id', 'name', 'code']
    pagination_class = PersonalizedPagination

    def get_queryset(self):
        """Retrieve products ordered by id."""
        return self.queryset.order_by('-id')


class ClientViewSet(viewsets.ModelViewSet):
    """View for managing client APIs."""
    serializer_class = ClientSerializer
    queryset = Client.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put']
    filter_backends = [filters.SearchFilter]
    search_fields = ['id', 'name', 'phone', 'nit']
    pagination_class = PersonalizedPagination

    def get_queryset(self):
        """Retrieve clients ordered by id."""
        return self.queryset.order_by('-id')


class SupplierViewSet(viewsets.ModelViewSet):
    """View for managing supplier APIs."""
    serializer_class = SupplierSerializer
    queryset = Supplier.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put']
    filter_backends = [filters.SearchFilter]
    search_fields = ['id', 'name', 'phone', 'nit']
    pagination_class = PersonalizedPagination

    def get_queryset(self):
        """Retrieve suppliers ordered by id."""
        return self.queryset.order_by('-id')


class EntryViewSet(viewsets.ModelViewSet):
    """View for managing entry APIs."""
    serializer_class = EntrySerializer
    queryset = Entry.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put']
    filter_backends = [filters.SearchFilter]
    search_fields = ['id', 'invoice_number',
                     'warehouse_keeper__first_name', 'warehouse_keeper__last_name', 'supplier__name']
    pagination_class = PersonalizedPagination

    def get_queryset(self):
        """Retrieve entries ordered by id."""
        return self.queryset.order_by('-id')


class OutputViewSet(viewsets.ModelViewSet):
    """View for managing output APIs."""
    serializer_class = OutputSerializer
    queryset = Output.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put']
    filter_backends = [filters.SearchFilter]
    search_fields = ['id',
                     'warehouse_keeper__first_name', 'warehouse_keeper__last_name', 'client__name']
    pagination_class = PersonalizedPagination

    def get_queryset(self):
        """Retrieve outputs ordered by id."""
        return self.queryset.order_by('-id')


class ProductChannelPriceViewSet(viewsets.ModelViewSet):
    """View for managing product channel price APIs."""
    serializer_class = ProductChannelPriceSerializer
    queryset = ProductChannelPrice.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put']
    filter_backends = [filters.SearchFilter]
    search_fields = ['product__name', 'selling_channel__name']
    pagination_class = PersonalizedPagination

    def get_queryset(self):
        """Retrieve product channel prices ordered by id."""
        return self.queryset.order_by('-id')


class SellingChannelViewSet(viewsets.ModelViewSet):
    """View for managing selling channel APIs."""
    serializer_class = SellingChannelSerializer
    queryset = SellingChannel.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put']
    filter_backends = [filters.SearchFilter]
    search_fields = ['id', 'name']
    pagination_class = PersonalizedPagination

    def get_queryset(self):
        """Retrieve selling channels ordered by id."""
        return self.queryset.order_by('-id')


class PurchaseViewSet(viewsets.ModelViewSet):
    """View for managing purchase APIs."""
    serializer_class = PurchaseSerializer
    queryset = Purchase.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put']
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['id', 'buyer__first_name', 'buyer__last_name', 'supplier__name', 'invoice_number']
    filterset_fields = ['purchase_type', 'status', 'purchase_date']
    pagination_class = PersonalizedPagination

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)

    def get_queryset(self):
        """Retrieve purchases ordered by id and filtered by status."""
        queryset = super().get_queryset()
        status = self.request.query_params.get('status')

        if status:
            queryset = queryset.filter(status=status).order_by('-id')

        return self.queryset.order_by('-id')


class SaleViewSet(viewsets.ModelViewSet):
    """View for managin Sale APIs."""
    serializer_class = SaleSerializer
    queryset = Sale.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put']
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['id', 'client__name', 'selling_channel__name', 'seller__first_name', 'seller__last_name']
    filterset_fields = ['sale_type', 'status', 'sale_date']
    pagination_class = PersonalizedPagination

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def get_queryset(self):
        """Retrieve sales ordered by id and filtered by status."""
        queryset = super().get_queryset()
        status = self.request.query_params.get("status")

        if status:
            queryset = queryset.filter(status=status).order_by('-id')
        return self.queryset.order_by('-id')


class PaymentViewSet(viewsets.ModelViewSet):
    """View for managing Payment APIs."""
    serializer_class = PaymentSerializer
    queryset = Payment.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put']
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['id', 'payment_method']
    filterset_fields = ['transaction_type', 'payment_date']
    pagination_class = PersonalizedPagination

    def get_queryset(self):
        """Retrieve payments ordered by id."""
        return self.queryset.order_by('-id')
