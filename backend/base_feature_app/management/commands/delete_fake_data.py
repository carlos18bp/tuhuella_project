from django.core.management.base import BaseCommand

from base_feature_app.models import (
    AdopterIntent,
    Animal,
    AnimalStatusHistory,
    AdoptionApplication,
    BlogPost,
    Campaign,
    Donation,
    DonationAmountOption,
    FAQItem,
    FAQTopic,
    Favorite,
    NotificationLog,
    NotificationPreference,
    PasswordCode,
    Payment,
    PaymentHistory,
    Shelter,
    ShelterInvite,
    ShelterMembership,
    Sponsorship,
    SponsorshipAmountOption,
    StrategicAlly,
    Subscription,
    UpdatePost,
    User,
    VolunteerApplication,
    VolunteerPosition,
)


class Command(BaseCommand):
    help = 'Delete all fake Mi Huella data (--confirm required). Superusers are preserved.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Required flag to confirm deletion of all fake data.',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(self.style.ERROR(
                'This command will delete ALL fake data. Pass --confirm to proceed.',
            ))
            return

        self.stdout.write(self.style.WARNING('Deleting all Mi Huella data...'))

        models_to_delete = [
            NotificationLog, NotificationPreference, ShelterInvite,
            AdopterIntent, PaymentHistory, Subscription, Payment, Sponsorship,
            Donation, AdoptionApplication, Favorite, UpdatePost,
            FAQItem, FAQTopic, BlogPost, Campaign, AnimalStatusHistory,
            ShelterMembership, Animal, Shelter, PasswordCode,
            DonationAmountOption, SponsorshipAmountOption,
            VolunteerApplication, VolunteerPosition, StrategicAlly,
        ]

        for model in models_to_delete:
            count, _ = model.objects.all().delete()
            self.stdout.write(f'  Deleted {count} {model.__name__} records')

        count, _ = User.objects.filter(is_superuser=False).delete()
        self.stdout.write(f'  Deleted {count} User records (non-superuser)')

        self.stdout.write(self.style.SUCCESS('All fake data deleted!'))
