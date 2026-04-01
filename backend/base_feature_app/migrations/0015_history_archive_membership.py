# Generated manually for Mi Huella domain changes

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
from django.db.models import Q


def forwards_donation_destination(apps, schema_editor):
    Donation = apps.get_model('base_feature_app', 'Donation')
    Campaign = apps.get_model('base_feature_app', 'Campaign')
    for d in Donation.objects.all().iterator():
        changed = ['destination']
        if d.campaign_id:
            d.destination = 'campaign'
            camp = Campaign.objects.get(pk=d.campaign_id)
            if not d.shelter_id:
                d.shelter_id = camp.shelter_id
                changed.append('shelter')
        elif d.shelter_id:
            d.destination = 'shelter'
        else:
            d.destination = 'platform'
        d.save(update_fields=changed)


def forwards_shelter_memberships(apps, schema_editor):
    Shelter = apps.get_model('base_feature_app', 'Shelter')
    ShelterMembership = apps.get_model('base_feature_app', 'ShelterMembership')
    for s in Shelter.objects.all().iterator():
        ShelterMembership.objects.get_or_create(
            shelter=s,
            user_id=s.owner_id,
            defaults={'role': 'owner'},
        )


def forwards_remove_invalid_payments(apps, schema_editor):
    """Rows with no parent cannot satisfy XOR constraint."""
    Payment = apps.get_model('base_feature_app', 'Payment')
    Payment.objects.filter(donation__isnull=True, sponsorship__isnull=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('base_feature_app', '0014_add_terms_version'),
    ]

    operations = [
        migrations.CreateModel(
            name='ShelterMembership',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('owner', 'Owner'), ('admin', 'Admin'), ('staff', 'Staff')], default='staff', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('shelter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='team_memberships', to='base_feature_app.shelter')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='shelter_team_memberships', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'shelter memberships',
                'ordering': ['shelter_id', 'role', 'user_id'],
                'unique_together': {('shelter', 'user')},
            },
        ),
        migrations.CreateModel(
            name='AnimalStatusHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('previous_status', models.CharField(blank=True, default='', max_length=20)),
                ('new_status', models.CharField(max_length=20)),
                ('reason', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('animal', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='status_history', to='base_feature_app.animal')),
                ('changed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='animal_status_changes', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'animal status histories',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='PaymentHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('previous_status', models.CharField(blank=True, default='', max_length=20)),
                ('new_status', models.CharField(max_length=20)),
                ('source', models.CharField(choices=[('system', 'System'), ('webhook', 'Webhook'), ('admin', 'Admin'), ('api', 'API')], default='system', max_length=20)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('changed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payment_status_changes', to=settings.AUTH_USER_MODEL)),
                ('payment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='status_history', to='base_feature_app.payment')),
            ],
            options={
                'verbose_name_plural': 'payment histories',
                'ordering': ['created_at'],
            },
        ),
        migrations.AddField(
            model_name='user',
            name='archived_at',
            field=models.DateTimeField(blank=True, db_index=True, help_text='Soft-archive: inactive account without deleting related rows.', null=True),
        ),
        migrations.AddField(
            model_name='shelter',
            name='archived_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='animal',
            name='archived_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='animal',
            name='adopted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='animal',
            name='adopted_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='animals_adopted', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='animal',
            name='adoption_application',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='won_adoptions', to='base_feature_app.adoptionapplication'),
        ),
        migrations.AddField(
            model_name='campaign',
            name='archived_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='donation',
            name='archived_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='donation',
            name='destination',
            field=models.CharField(choices=[('platform', 'Platform'), ('shelter', 'Shelter'), ('campaign', 'Campaign')], default='shelter', max_length=20),
        ),
        migrations.AddField(
            model_name='payment',
            name='archived_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='sponsorship',
            name='archived_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='adoptionapplication',
            name='archived_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='updatepost',
            name='archived_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='favorite',
            name='archived_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='volunteerapplication',
            name='archived_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='blogpost',
            name='archived_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='subscription',
            name='archived_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.RemoveField(
            model_name='volunteerapplication',
            name='city',
        ),
        migrations.RemoveField(
            model_name='volunteerapplication',
            name='country',
        ),
        migrations.RemoveField(
            model_name='volunteerapplication',
            name='email',
        ),
        migrations.RemoveField(
            model_name='volunteerapplication',
            name='first_name',
        ),
        migrations.RemoveField(
            model_name='volunteerapplication',
            name='last_name',
        ),
        migrations.RemoveField(
            model_name='volunteerapplication',
            name='phone',
        ),
        migrations.RunPython(forwards_donation_destination, migrations.RunPython.noop),
        migrations.RunPython(forwards_remove_invalid_payments, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name='payment',
            constraint=models.CheckConstraint(
                condition=(
                    Q(donation__isnull=False, sponsorship__isnull=True)
                    | Q(donation__isnull=True, sponsorship__isnull=False)
                ),
                name='payment_exactly_one_parent',
            ),
        ),
        migrations.RunPython(forwards_shelter_memberships, migrations.RunPython.noop),
        migrations.AddIndex(
            model_name='animal',
            index=models.Index(fields=['archived_at'], name='animal_archived_at_idx'),
        ),
    ]
