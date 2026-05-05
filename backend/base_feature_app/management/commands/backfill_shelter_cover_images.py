import urllib.request

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from base_feature_app.models import Shelter
from django_attachments.models import Library, Attachment


COVER_WIDTH = 1200
COVER_HEIGHT = 600


def _build_cover_url(shelter_id):
    return f'https://picsum.photos/seed/shelter-{shelter_id}/{COVER_WIDTH}/{COVER_HEIGHT}'


class Command(BaseCommand):
    help = 'Download a placeholder cover image for every Shelter without one (idempotent).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force', action='store_true',
            help='Replace the cover image even on shelters that already have one.',
        )

    def handle(self, *args, **options):
        if options['force']:
            qs = Shelter.objects.all()
        else:
            qs = Shelter.objects.filter(cover_image__isnull=True)

        attached = 0
        for shelter in qs:
            url = _build_cover_url(shelter.id)
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Tuhuella Backfill'})
                with urllib.request.urlopen(req, timeout=20) as response:
                    image_data = response.read()
            except OSError as exc:
                self.stdout.write(self.style.WARNING(
                    f'  ! Shelter {shelter.id} ({shelter.name}): download failed ({exc})'
                ))
                continue

            library = Library.objects.create(title=f'Cover: {shelter.name}')
            attachment = Attachment(
                library=library,
                rank=0,
                original_name='cover.jpg',
                filesize=len(image_data),
                image_width=COVER_WIDTH,
                image_height=COVER_HEIGHT,
            )
            attachment.file.save(
                f'shelter_{shelter.id}_cover.jpg', ContentFile(image_data), save=False,
            )
            attachment.save()
            library.primary_attachment = attachment
            library.save(update_fields=['primary_attachment'])

            shelter.cover_image = library
            shelter.save(update_fields=['cover_image'])

            self.stdout.write(f'  ✓ Shelter {shelter.id} ({shelter.name})')
            attached += 1
        self.stdout.write(self.style.SUCCESS(f'Attached cover image to {attached} shelter(s).'))
