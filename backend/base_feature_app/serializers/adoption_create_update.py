from rest_framework import serializers
from base_feature_app.models import AdoptionApplication


class AdoptionCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdoptionApplication
        fields = ['id', 'animal', 'form_answers', 'notes']

    def validate(self, attrs):
        # The model's unique_together (animal, user) cannot be enforced by
        # DRF's automatic validator: `user` is not a serializer field (the
        # view sets it at save time), so get_unique_together_validators()
        # skips the constraint and a resubmit surfaced as an unhandled
        # IntegrityError — a raw 500 for a user retrying the wizard.
        request = self.context.get('request')
        animal = attrs.get('animal')
        if request is not None and animal is not None and self.instance is None:
            if AdoptionApplication.objects.filter(
                animal=animal, user=request.user
            ).exists():
                raise serializers.ValidationError(
                    {'animal': 'You have already submitted an application for this animal.'}
                )
        return attrs
