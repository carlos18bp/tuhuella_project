import pytest

from base_feature_app.models import Animal


@pytest.mark.django_db
def test_animal_str_returns_name_and_species(animal):
    """__str__ returns 'name (species)'."""
    assert 'Luna' in str(animal)
    assert 'dog' in str(animal).lower() or 'Dog' in str(animal)


@pytest.mark.django_db
def test_animal_default_status_is_draft(shelter):
    """New animal defaults to draft status."""
    a = Animal.objects.create(
        shelter=shelter,
        name='Test',
        species=Animal.Species.CAT,
    )

    assert a.status == Animal.Status.DRAFT


@pytest.mark.django_db
def test_animal_species_choices():
    """Species contains expected values."""
    values = {c.value for c in Animal.Species}
    assert 'dog' in values
    assert 'cat' in values
    assert 'other' in values


@pytest.mark.django_db
def test_animal_size_choices():
    """Size contains expected values."""
    values = {c.value for c in Animal.Size}
    assert 'small' in values
    assert 'medium' in values
    assert 'large' in values


@pytest.mark.django_db
def test_animal_shelter_relationship(animal, shelter):
    """Animal is linked to its shelter."""
    assert animal.shelter == shelter
    assert animal in shelter.animals.all()


@pytest.mark.django_db
def test_animal_boolean_fields(animal):
    """Boolean fields are stored correctly."""
    assert animal.is_vaccinated is True
    assert animal.is_sterilized is False


@pytest.mark.django_db
def test_animal_boolean_and_compatibility_defaults(shelter):
    """Boolean and compatibility fields default correctly."""
    a = Animal.objects.create(
        shelter=shelter,
        name='Defaults',
        species=Animal.Species.DOG,
    )

    assert a.is_house_trained is False
    assert a.good_with_kids == 'unknown'
    assert a.good_with_dogs == 'unknown'
    assert a.good_with_cats == 'unknown'
    assert a.energy_level == 'medium'


@pytest.mark.django_db
def test_animal_optional_value_defaults(shelter):
    """Optional value fields default to None or empty."""
    a = Animal.objects.create(
        shelter=shelter,
        name='Defaults',
        species=Animal.Species.DOG,
    )

    assert a.weight is None
    assert a.coat_color == ''
    assert a.intake_date is None
    assert a.microchip_id == ''


@pytest.mark.django_db
def test_animal_compatibility_choices():
    """Compatibility contains expected values."""
    values = {c.value for c in Animal.Compatibility}
    assert values == {'yes', 'no', 'unknown'}


@pytest.mark.django_db
def test_animal_energy_level_choices():
    """EnergyLevel contains expected values."""
    values = {c.value for c in Animal.EnergyLevel}
    assert values == {'low', 'medium', 'high'}


@pytest.mark.django_db
def test_animal_boolean_and_compatibility_stored(shelter):
    """Boolean and compatibility fields are stored correctly."""
    a = Animal.objects.create(
        shelter=shelter,
        name='Buddy',
        species=Animal.Species.DOG,
        is_house_trained=True,
        good_with_kids='yes',
        good_with_dogs='no',
        good_with_cats='unknown',
        energy_level='high',
    )

    a.refresh_from_db()
    assert a.is_house_trained is True
    assert a.good_with_kids == 'yes'
    assert a.good_with_dogs == 'no'
    assert a.energy_level == 'high'


@pytest.mark.django_db
def test_animal_optional_value_fields_stored(shelter):
    """Optional value fields are stored and retrieved correctly."""
    from datetime import date
    from decimal import Decimal

    a = Animal.objects.create(
        shelter=shelter,
        name='Buddy',
        species=Animal.Species.DOG,
        weight=Decimal('12.50'),
        coat_color='Brown',
        intake_date=date(2025, 6, 15),
        microchip_id='MC-123',
    )

    a.refresh_from_db()
    assert a.weight == Decimal('12.50')
    assert a.coat_color == 'Brown'
    assert a.intake_date == date(2025, 6, 15)
    assert a.microchip_id == 'MC-123'
