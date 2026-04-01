from rest_framework import serializers


class ContactFormSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, trim_whitespace=True)
    email = serializers.EmailField(max_length=254)
    subject = serializers.CharField(max_length=200, trim_whitespace=True)
    message = serializers.CharField(max_length=5000, trim_whitespace=True)

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('This field may not be blank.')
        return value.strip()

    def validate_subject(self, value):
        if not value.strip():
            raise serializers.ValidationError('This field may not be blank.')
        return value.strip()

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError('This field may not be blank.')
        return value.strip()
