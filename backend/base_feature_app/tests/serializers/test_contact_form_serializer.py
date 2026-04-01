from base_feature_app.serializers.contact import ContactFormSerializer


def test_contact_form_accepts_valid_payload():
    """Serializer accepts trimmed valid fields."""
    ser = ContactFormSerializer(data={
        'name': ' Ana Lopez ',
        'email': 'ana@example.com',
        'subject': ' Consulta ',
        'message': 'Hola, quisiera mas informacion.',
    })
    assert ser.is_valid() is True
    assert ser.validated_data['name'] == 'Ana Lopez'


def test_contact_form_rejects_blank_name():
    """Blank name after trim fails validation."""
    ser = ContactFormSerializer(data={
        'name': '   ',
        'email': 'ana@example.com',
        'subject': 'Hola',
        'message': 'Texto',
    })
    assert ser.is_valid() is False
    assert 'name' in ser.errors


def test_contact_form_rejects_blank_subject():
    """Blank subject after trim fails validation."""
    ser = ContactFormSerializer(data={
        'name': 'Ana',
        'email': 'ana@example.com',
        'subject': '   ',
        'message': 'Texto valido.',
    })
    assert ser.is_valid() is False
    assert 'subject' in ser.errors


def test_contact_form_rejects_blank_message():
    """Blank message after trim fails validation."""
    ser = ContactFormSerializer(data={
        'name': 'Ana',
        'email': 'ana@example.com',
        'subject': 'Hola',
        'message': '   ',
    })
    assert ser.is_valid() is False
    assert 'message' in ser.errors


def test_contact_form_rejects_message_over_max_length():
    """Message longer than 5000 characters fails."""
    ser = ContactFormSerializer(data={
        'name': 'Ana',
        'email': 'ana@example.com',
        'subject': 'Hola',
        'message': 'x' * 5001,
    })
    assert ser.is_valid() is False
    assert 'message' in ser.errors
