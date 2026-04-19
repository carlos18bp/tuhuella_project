"""Migrate BlogPost.cover_image from ImageField to django_attachments.SingleImageField."""
import mimetypes
import os

import django.db.models.deletion
import django_attachments.fields
from django.conf import settings
from django.db import migrations, models
from django.utils import timezone
from PIL import Image, UnidentifiedImageError


def migrate_covers_to_attachments(apps, schema_editor):
    BlogPost = apps.get_model('base_feature_app', 'BlogPost')
    Library = apps.get_model('django_attachments', 'Library')
    Attachment = apps.get_model('django_attachments', 'Attachment')

    posts = BlogPost.objects.exclude(cover_image_legacy='').exclude(
        cover_image_legacy__isnull=True,
    )
    for post in posts:
        filepath = post.cover_image_legacy.name
        absolute = os.path.join(settings.MEDIA_ROOT, filepath)
        if not os.path.exists(absolute):
            continue

        image_width = image_height = None
        try:
            with Image.open(absolute) as im:
                image_width, image_height = im.size
        except (OSError, UnidentifiedImageError):
            pass

        now = timezone.now()
        original_name = os.path.basename(filepath) or 'cover'
        mimetype = mimetypes.guess_type(original_name)[0] or ''

        # Historical models skip custom save(), so we compute filesize/dimensions ourselves.
        library = Library.objects.create(
            title=(post.slug or post.title_es or 'Blog cover')[:255],
            created=now,
            updated=now,
        )
        attachment = Attachment.objects.create(
            library=library,
            rank=0,
            original_name=original_name[:255],
            file=filepath,
            filesize=os.path.getsize(absolute),
            mimetype=mimetype[:200],
            image_width=image_width,
            image_height=image_height,
            created=now,
            updated=now,
        )
        library.primary_attachment = attachment
        library.save(update_fields=['primary_attachment', 'updated'])

        post.cover_image_id = library.pk
        post.save(update_fields=['cover_image'])


class Migration(migrations.Migration):

    dependencies = [
        ('base_feature_app', '0015_history_archive_membership'),
        ('django_attachments', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='blogpost',
            old_name='cover_image',
            new_name='cover_image_legacy',
        ),
        migrations.AddField(
            model_name='blogpost',
            name='cover_image',
            field=django_attachments.fields.SingleImageField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='blog_cover',
                to='django_attachments.library',
            ),
        ),
        migrations.RunPython(migrate_covers_to_attachments, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='blogpost',
            name='cover_image_legacy',
        ),
    ]
