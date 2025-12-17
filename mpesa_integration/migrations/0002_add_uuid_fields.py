# mpesa_integration/migrations/0002_add_uuid_fields.py
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mpesa_integration', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='mpesabulkpayment',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
        migrations.AddField(
            model_name='mpesatransaction',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
        migrations.AddField(
            model_name='paymentreconciliation',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
        migrations.AddIndex(
            model_name='mpesatransaction',
            index=models.Index(fields=['uuid'], name='mpesa_integ_uuid_idx'),
        ),
    ]
