from django.core.management.base import BaseCommand
from base_feature_app.models import (
    Animal, Shelter, AdoptionApplication, Campaign, Donation,
    Sponsorship, Payment, UpdatePost, AdopterIntent, ShelterInvite,
    Subscription, Favorite, NotificationPreference, NotificationLog,
    PasswordCode, User,
)


class Command(BaseCommand):
    help = 'Delete all fake data for Mi Huella'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Deleting all Mi Huella data...'))

        models_to_delete = [
            NotificationLog, NotificationPreference, ShelterInvite,
            AdopterIntent, Subscription, Payment, Sponsorship,
            Donation, AdoptionApplication, Favorite, UpdatePost,
            Campaign, Animal, Shelter, PasswordCode,
        ]

        for model in models_to_delete:
            count, _ = model.objects.all().delete()
            self.stdout.write(f'  Deleted {count} {model.__name__} records')

        # Delete non-superuser users
        count, _ = User.objects.filter(is_superuser=False).delete()
        self.stdout.write(f'  Deleted {count} User records (non-superuser)')

        self.stdout.write(self.style.SUCCESS('All fake data deleted!'))
