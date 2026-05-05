import tempfile
import urllib.request
from pathlib import Path

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db.models import Q

from base_feature_app.models import Shelter

SAMPLE_VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4'
SAMPLE_VIDEO_CACHE = Path(tempfile.gettempdir()) / 'tuhuella_sample_shelter_video.mp4'


class Command(BaseCommand):
    help = 'Assign a sample MP4 to every Shelter without a video (idempotent).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force', action='store_true',
            help='Reattach the sample video even on shelters that already have one.',
        )

    def handle(self, *args, **options):
        if SAMPLE_VIDEO_CACHE.exists() and SAMPLE_VIDEO_CACHE.stat().st_size > 0:
            data = SAMPLE_VIDEO_CACHE.read_bytes()
        else:
            try:
                with urllib.request.urlopen(SAMPLE_VIDEO_URL, timeout=30) as response:
                    data = response.read()
            except OSError as exc:
                self.stdout.write(self.style.ERROR(f'Could not download sample video: {exc}'))
                return
            SAMPLE_VIDEO_CACHE.write_bytes(data)

        if options['force']:
            qs = Shelter.objects.all()
        else:
            qs = Shelter.objects.filter(Q(video='') | Q(video__isnull=True))

        attached = 0
        for shelter in qs:
            shelter.video.save(f'shelter_{shelter.id}_sample.mp4', ContentFile(data), save=True)
            self.stdout.write(f'  ✓ Shelter {shelter.id} ({shelter.name})')
            attached += 1
        self.stdout.write(self.style.SUCCESS(f'Attached video to {attached} shelter(s).'))
