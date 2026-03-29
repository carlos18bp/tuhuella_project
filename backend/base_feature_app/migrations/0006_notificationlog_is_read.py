from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base_feature_app', '0005_bilingual_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='notificationlog',
            name='is_read',
            field=models.BooleanField(default=False),
        ),
    ]
