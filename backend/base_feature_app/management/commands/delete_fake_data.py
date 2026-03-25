from django.core.management.base import BaseCommand
from base_feature_app.models import (
    Animal, Shelter, AdoptionApplication, Campaign, Donation,
    Sponsorship, Payment, UpdatePost, AdopterIntent, ShelterInvite,
    Subscription, Favorite, NotificationPreference, NotificationLog,
    PasswordCode, User, BlogPost, FAQItem, FAQTopic,
    DonationAmountOption, SponsorshipAmountOption,
    VolunteerPosition, StrategicAlly,
)


class Command(BaseCommand):
    help = 'Delete all fake data for Mi Huella'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Required flag to confirm deletion of all fake data.',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(self.style.ERROR(
                'This command will delete ALL data. Pass --confirm to proceed.'
            ))
            return

        self.stdout.write(self.style.WARNING('Deleting all Mi Huella data...'))

        models_to_delete = [
            NotificationLog, NotificationPreference, ShelterInvite,
            AdopterIntent, Subscription, Payment, Sponsorship,
            Donation, AdoptionApplication, Favorite, UpdatePost,
            FAQItem, FAQTopic, BlogPost, Campaign, Animal, Shelter, PasswordCode,
            DonationAmountOption, SponsorshipAmountOption,
            VolunteerPosition, StrategicAlly,
        ]

        for model in models_to_delete:
            count, _ = model.objects.all().delete()
            self.stdout.write(f'  Deleted {count} {model.__name__} records')

        # Delete non-superuser users
        count, _ = User.objects.filter(is_superuser=False).delete()
        self.stdout.write(f'  Deleted {count} User records (non-superuser)')

        self.stdout.write(self.style.SUCCESS('All fake data deleted!'))
