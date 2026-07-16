# Generated manually

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0066_auto_20260714_2306'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='line',
        ),
    ]
