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
