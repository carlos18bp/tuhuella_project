import logging
import re
from io import StringIO

from django.conf import settings
from django.core.management.base import BaseCommand
from django.core.management import call_command


# Maps: (command_name, args, display_label)
STEPS = [
    # --- Core entities ---
    ('create_users', ['--count', '30'], 'Users'),
    ('create_shelters', ['--count', '10'], 'Shelters'),
    ('create_animals', ['--count', '50'], 'Animals'),
    None,  # section separator
    # --- Financial ---
    ('create_campaigns', ['--count', '15'], 'Campaigns'),
    ('create_donations', ['--count', '40'], 'Donations'),
    ('create_sponsorships', ['--count', '25'], 'Sponsorships'),
    ('create_payments', ['--count', '30'], 'Payments'),
    ('create_subscriptions', ['--count', '10'], 'Subscriptions'),
    None,
    # --- Adoption flow ---
    ('create_adoptions', ['--count', '20'], 'Adoption applications'),
    ('create_adopter_intents', ['--count', '10'], 'Adopter intents'),
    ('create_shelter_invites', ['--count', '15'], 'Shelter invites'),
    ('create_favorites', ['--count', '50'], 'Favorites'),
    None,
    # --- Content ---
    ('create_update_posts', ['--count', '20'], 'Update posts'),
    ('create_blog_posts', [], 'Blog posts'),
    ('create_notifications', ['--count', '25'], 'Notifications'),
    None,
    # --- Reference data ---
    ('create_faqs', ['--count', '10'], 'FAQs'),
    ('create_amount_options', ['--count', '9'], 'Amount options'),
    ('create_volunteer_positions', ['--count', '12'], 'Volunteer positions'),
    ('create_strategic_allies', ['--count', '12'], 'Strategic allies'),
]

# Loggers that produce noisy output during fake data creation
NOISY_LOGGERS = [
    'huey',
    'base_feature_app.tasks',
    'base_feature_app.services.notification_service',
    'django.core.mail',
]

LINE_WIDTH = 40
ANSI_ESCAPE = re.compile(r'\x1b\[[0-9;]*m')


def _extract_summary(output_text):
    """Extract a concise count/summary from a sub-command's captured output."""
    # Strip ANSI color codes before parsing
    clean = ANSI_ESCAPE.sub('', output_text)
    lines = [l.strip() for l in clean.strip().splitlines() if l.strip()]
    if not lines:
        return 'done'

    last_line = lines[-1]

    # Extract all "number + word" pairs (e.g. "150 notification preferences and 25 logs")
    pairs = re.findall(r'(\d+)\s+(\w+)', last_line)
    if not pairs:
        return 'done'

    if len(pairs) == 1:
        # Single count — show just the number (label is already in the left column)
        return pairs[0][0]

    # Multiple counts — show "N label, N label" with short labels
    parts = []
    for num, word in pairs:
        parts.append(f'{num} {word}')
    return ', '.join(parts)


class Command(BaseCommand):
    help = 'Create all fake data for Mi Huella in the correct order'

    def handle(self, *args, **options):
        # Suppress noisy loggers
        saved_levels = {}
        for name in NOISY_LOGGERS:
            logger = logging.getLogger(name)
            saved_levels[name] = logger.level
            logger.setLevel(logging.CRITICAL)

        # Suppress console email backend output
        saved_email_backend = settings.EMAIL_BACKEND
        settings.EMAIL_BACKEND = 'django.core.mail.backends.dummy.EmailBackend'

        try:
            self._run_steps()
        finally:
            # Restore logger levels
            for name, level in saved_levels.items():
                logging.getLogger(name).setLevel(level)
            settings.EMAIL_BACKEND = saved_email_backend

    def _run_steps(self):
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('  Mi Huella — Creating fake data...'))
        self.stdout.write(self.style.SUCCESS('  ' + '─' * LINE_WIDTH))

        for step in STEPS:
            if step is None:
                self.stdout.write('')  # blank line between sections
                continue

            cmd_name, cmd_args, label = step
            buffer = StringIO()

            try:
                call_command(cmd_name, *cmd_args, stdout=buffer, stderr=StringIO())
                summary = _extract_summary(buffer.getvalue())
                dots = '.' * (LINE_WIDTH - len(label) - len(summary) - 6)
                self.stdout.write(self.style.SUCCESS(
                    f'  ✓ {label} {dots} {summary}'
                ))
            except Exception as e:
                dots = '.' * (LINE_WIDTH - len(label) - 8)
                self.stdout.write(self.style.WARNING(
                    f'  ! {label} {dots} failed'
                ))
                self.stderr.write(self.style.WARNING(f'    {e}'))

        self.stdout.write(self.style.SUCCESS('  ' + '─' * LINE_WIDTH))
        self.stdout.write(self.style.SUCCESS('  ✓ All fake data created successfully!'))
        self.stdout.write('')
