from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Permission
from .models import User

@receiver(post_save, sender=User)
def assign_permission_to_all_users(sender, instance, created, **kwargs):
    if not created:
        return

    try:
        permission = Permission.objects.get(codename="can_view_reports")
        instance.user_permissions.add(permission)
    except Permission.DoesNotExist:
        pass
