from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base_feature_app', '0004_add_amount_options'),
    ]

    operations = [
        # Animal
        migrations.RenameField(
            model_name='Animal',
            old_name='description',
            new_name='description_es',
        ),
        migrations.AddField(
            model_name='Animal',
            name='description_en',
            field=models.TextField(blank=True, default=''),
            preserve_default=False,
        ),
        migrations.RenameField(
            model_name='Animal',
            old_name='special_needs',
            new_name='special_needs_es',
        ),
        migrations.AddField(
            model_name='Animal',
            name='special_needs_en',
            field=models.TextField(blank=True, default=''),
            preserve_default=False,
        ),
        # Shelter
        migrations.RenameField(
            model_name='Shelter',
            old_name='description',
            new_name='description_es',
        ),
        migrations.AddField(
            model_name='Shelter',
            name='description_en',
            field=models.TextField(blank=True, default=''),
            preserve_default=False,
        ),
        # Campaign
        migrations.RenameField(
            model_name='Campaign',
            old_name='title',
            new_name='title_es',
        ),
        migrations.AddField(
            model_name='Campaign',
            name='title_en',
            field=models.CharField(max_length=300, default=''),
        ),
        migrations.RenameField(
            model_name='Campaign',
            old_name='description',
            new_name='description_es',
        ),
        migrations.AddField(
            model_name='Campaign',
            name='description_en',
            field=models.TextField(blank=True, default=''),
            preserve_default=False,
        ),
        # UpdatePost
        migrations.RenameField(
            model_name='UpdatePost',
            old_name='title',
            new_name='title_es',
        ),
        migrations.AddField(
            model_name='UpdatePost',
            name='title_en',
            field=models.CharField(max_length=300, default=''),
        ),
        migrations.RenameField(
            model_name='UpdatePost',
            old_name='content',
            new_name='content_es',
        ),
        migrations.AddField(
            model_name='UpdatePost',
            name='content_en',
            field=models.TextField(default=''),
        ),
    ]
