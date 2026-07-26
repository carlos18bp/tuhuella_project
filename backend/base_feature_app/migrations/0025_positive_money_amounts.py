from decimal import Decimal

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base_feature_app', '0024_adoption_followup_and_event'),
    ]

    operations = [
        migrations.AlterField(
            model_name='donation',
            name='amount',
            field=models.DecimalField(
                decimal_places=2,
                max_digits=12,
                validators=[django.core.validators.MinValueValidator(Decimal('0.01'))],
            ),
        ),
        migrations.AlterField(
            model_name='payment',
            name='amount',
            field=models.DecimalField(
                decimal_places=2,
                max_digits=12,
                validators=[django.core.validators.MinValueValidator(Decimal('0.01'))],
            ),
        ),
        migrations.AlterField(
            model_name='sponsorship',
            name='amount',
            field=models.DecimalField(
                decimal_places=2,
                max_digits=12,
                validators=[django.core.validators.MinValueValidator(Decimal('0.01'))],
            ),
        ),
    ]
