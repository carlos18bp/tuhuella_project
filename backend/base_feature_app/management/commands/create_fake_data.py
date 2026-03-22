from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Create all fake data for Mi Huella in the correct order'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Creating fake data for Mi Huella...'))

        call_command('create_users', '--count', '10')
        call_command('create_shelters', '--count', '5')
        call_command('create_animals', '--count', '20')
        call_command('create_campaigns', '--count', '6')
        call_command('create_donations', '--count', '15')
        call_command('create_sponsorships', '--count', '10')
        call_command('create_adoptions', '--count', '8')
        call_command('create_update_posts', '--count', '10')
        call_command('create_adopter_intents', '--count', '5')
        call_command('create_shelter_invites', '--count', '5')
        call_command('create_favorites', '--count', '15')
        call_command('create_payments', '--count', '10')
        call_command('create_subscriptions', '--count', '5')
        call_command('create_notifications', '--count', '10')

        self.stdout.write(self.style.SUCCESS('All fake data created successfully!'))
