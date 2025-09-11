"""
Django admin customizattion
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from core.models import *


class UserAdmin(BaseUserAdmin):
    """Define the admin pages for users."""
    ordering = ['id']
    list_display = ['email', 'first_name', 'last_name', 'user_type', 'is_active']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {
            'fields': ('first_name', 'last_name', 'ci', 'phone', 'address', 'user_type')
        }),
        (
            _('Permissions'),
            {'fields': ('is_active', 'is_staff', 'is_superuser')}
        ),
        (_('Important dates'), {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    readonly_fields = ['last_login', 'created_at', 'updated_at']
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'password1',
                'password2',
                'first_name',
                'last_name',
                'ci',
                'phone',
                'address',
                'user_type',
                'is_active',
                'is_staff',
                'is_superuser',
            )
        }),
    )


admin.site.register(User, UserAdmin)
admin.site.register(Agency)
admin.site.register(Client)
admin.site.register(Warehouse)
admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Supplier)
admin.site.register(SellingChannel)
admin.site.register(Purchase)
admin.site.register(Entry)
admin.site.register(Output)
admin.site.register(Sale)
admin.site.register(Payment)
