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
    help = 'Delete all fake Tuhuella data (--confirm required). Superusers are always preserved.'

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

        preserved_superusers = list(
            User.objects.filter(is_superuser=True).values_list('email', flat=True)
        )
        self.stdout.write(self.style.WARNING('Deleting all Tuhuella fake data...'))
        if preserved_superusers:
            self.stdout.write(
                f'  Superusers preserved ({len(preserved_superusers)}): '
                + ', '.join(preserved_superusers)
            )

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

        # Double safety: exclude both is_superuser AND the 'admin' role
        count, _ = User.objects.filter(is_superuser=False).exclude(role=User.Role.ADMIN).delete()
        self.stdout.write(f'  Deleted {count} User records (non-superuser, non-admin)')

        remaining_superusers = User.objects.filter(is_superuser=True).count()
        self.stdout.write(self.style.SUCCESS(
            f'All fake data deleted. {remaining_superusers} superuser(s) preserved.'
        ))
