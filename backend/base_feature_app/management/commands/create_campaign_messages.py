import random

from django.core.management.base import BaseCommand

from base_feature_app.models import Campaign, CampaignMessage, User

SHELTER_INQUIRY = [
    'Hemos enviado nuestra campaña para revisión. ¿Hay algo adicional que necesiten de nuestra parte?',
    'Queremos saber si hay algún ajuste que debamos hacer a la descripción o meta de recaudación.',
    'Estamos listos para activar la campaña en cuanto recibamos la aprobación. ¿Cuánto tiempo toma el proceso?',
]

REJECTION_REASONS = [
    'La meta de recaudación supera el límite permitido para campañas de esta categoría. Por favor ajuste el monto.',
    'La descripción no incluye suficiente detalle sobre el uso de los fondos. Agregue un desglose de gastos.',
    'Las imágenes adjuntas no cumplen con los requisitos mínimos de calidad. Por favor suba fotos de mayor resolución.',
]

SHELTER_FOLLOWUP = [
    'Entendemos las observaciones. Realizaremos los ajustes necesarios y enviaremos una nueva solicitud.',
    'Gracias por la retroalimentación. Ajustaremos la campaña y la reenviaremos pronto.',
]

APPROVAL_MSG = [
    'Campaña revisada y aprobada. Ya puede activarla desde su panel de administración.',
    'Todo en orden. Su campaña ha sido aprobada. Puede proceder con la activación.',
]


class Command(BaseCommand):
    help = 'Create CampaignMessage records for campaigns in review'

    def handle(self, *args, **options):
        web_manager = User.objects.filter(role=User.Role.WEB_MANAGER).first()
        messages = []

        for campaign in Campaign.objects.select_related('shelter__owner').all():
            shelter_admin = campaign.shelter.owner if campaign.shelter else None

            if campaign.approval_status == Campaign.ApprovalStatus.PENDING:
                for body in random.sample(SHELTER_INQUIRY, random.randint(1, 2)):
                    messages.append(CampaignMessage(
                        campaign=campaign, author=shelter_admin, body=body,
                    ))

            elif campaign.approval_status == Campaign.ApprovalStatus.REJECTED:
                messages.append(CampaignMessage(
                    campaign=campaign, author=shelter_admin, body=random.choice(SHELTER_INQUIRY),
                ))
                messages.append(CampaignMessage(
                    campaign=campaign, author=web_manager, body=random.choice(REJECTION_REASONS),
                ))
                messages.append(CampaignMessage(
                    campaign=campaign, author=shelter_admin, body=random.choice(SHELTER_FOLLOWUP),
                ))

            elif (
                campaign.approval_status == Campaign.ApprovalStatus.APPROVED
                and campaign.status == Campaign.Status.ACTIVE
            ):
                messages.append(CampaignMessage(
                    campaign=campaign, author=web_manager, body=random.choice(APPROVAL_MSG),
                ))

        created = CampaignMessage.objects.bulk_create(messages, batch_size=500)
        self.stdout.write(self.style.SUCCESS(f'Created {len(created)} campaign messages'))
