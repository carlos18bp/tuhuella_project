import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AdoptionForm from '../AdoptionForm';

const fillQuestionnaire = async () => {
  const user = userEvent.setup();

  // Section 1: Basic info
  await user.type(screen.getByLabelText(/Nombre completo/), 'Juan Pérez');
  await user.type(screen.getByLabelText(/Teléfono/), '+573001234567');
  await user.type(screen.getByLabelText(/Correo electrónico/), 'juan@example.com');
  await user.type(screen.getByLabelText(/Ciudad/), 'Bogotá');

  // Section 2: Home & context
  await user.selectOptions(screen.getByLabelText(/¿Qué tipo de vivienda tienes\?/), 'house');
  await user.selectOptions(screen.getByLabelText(/¿Tienes patio o jardín\?/), 'yes');
  await user.selectOptions(screen.getByLabelText(/¿Cuántas horas al día estará solo el animal\?/), '4to6');

  // Section 3: Experience
  await user.selectOptions(screen.getByLabelText(/¿Has tenido mascotas anteriormente\?/), 'dogs');
  await user.selectOptions(screen.getByLabelText(/¿Cuál es tu nivel de experiencia con mascotas\?/), 'extensive');

  // Section 3b: Pets at home (default path: no pets)
  await user.selectOptions(screen.getByLabelText(/¿Tienes mascotas actualmente en casa\?/), 'no');

  // Section 4: Compatibility
  await user.selectOptions(screen.getByLabelText(/¿Hay niños en el hogar\?/), 'no');

  // Section 5: Commitment (checkboxes)
  await user.click(screen.getByLabelText(/Me comprometo a mantener al día las vacunas/));
  await user.click(screen.getByLabelText(/Acepto esterilizar al animal/));
  await user.click(screen.getByLabelText(/Acepto recibir seguimiento post-adopción/));

  // Section 6: Logistics
  await user.type(screen.getByLabelText(/¿Cuándo podrías recibir al animal\?/), 'Inmediatamente');
  await user.selectOptions(screen.getByLabelText(/¿Tienes transporte para recoger al animal\?/), 'yes');
  await user.selectOptions(screen.getByLabelText(/Preferencia de entrega/), 'pickup');
  await user.type(screen.getByLabelText(/¿Por qué deseas adoptar a este animal\?/), 'Me encantan los animales');

  return user;
};

describe('AdoptionForm', () => {
  jest.setTimeout(30000);

  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the animal name in the heading', () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Solicitud de adopción para Luna')).toBeInTheDocument();
  });

  it('renders step indicator with three steps', () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('list', { name: 'Pasos del formulario' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('renders all questionnaire fields on the first step', () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/¿Qué tipo de vivienda tienes\?/)).toBeInTheDocument();
    expect(screen.getByLabelText(/¿Tienes patio o jardín\?/)).toBeInTheDocument();
    expect(screen.getByLabelText(/¿Tienes mascotas actualmente en casa\?/)).toBeInTheDocument();
    expect(screen.getByLabelText(/¿Cuál es tu nivel de experiencia con mascotas\?/)).toBeInTheDocument();
    expect(screen.getByLabelText(/¿Cuántas horas al día estará solo el animal\?/)).toBeInTheDocument();
    expect(screen.getByLabelText(/¿Por qué deseas adoptar a este animal\?/)).toBeInTheDocument();
  });

  it('disables continue button when questionnaire is incomplete', () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  it('enables continue button when all fields are filled', async () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
    await fillQuestionnaire();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
  });

  it('advances to review step after completing questionnaire', async () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
    const user = await fillQuestionnaire();
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByText('Revisa tus respuestas antes de continuar:')).toBeInTheDocument();
  });

  it('shows back button on review step', async () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
    const user = await fillQuestionnaire();
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByRole('button', { name: 'Atrás' })).toBeInTheDocument();
  });

  it('navigates back to questionnaire from review step', async () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
    const user = await fillQuestionnaire();
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Atrás' }));
    expect(screen.getByLabelText(/¿Qué tipo de vivienda tienes\?/)).toBeInTheDocument();
  });

  it('advances to submit step and shows notes field', async () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
    const user = await fillQuestionnaire();
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByPlaceholderText('Notas adicionales (opcional)...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar solicitud' })).toBeInTheDocument();
  });

  it('calls onSubmit with form data and notes on final submission', async () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
    const user = await fillQuestionnaire();
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    await user.type(screen.getByPlaceholderText('Notas adicionales (opcional)...'), 'Por favor contactarme pronto');
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      form_answers: expect.objectContaining({
        housing_type: 'house',
        has_yard: 'yes',
        experience: 'extensive',
        motivation: 'Me encantan los animales',
      }),
      notes: 'Por favor contactarme pronto',
    });
  });

  it('shows submitting state when submitting prop is true', async () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} submitting={true} />);
    const user = await fillQuestionnaire();
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled();
  });

  describe('pets-at-home block', () => {
    const fillQuestionnaireUpToPets = async () => {
      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/Nombre completo/), 'Juan Pérez');
      await user.type(screen.getByLabelText(/Teléfono/), '+573001234567');
      await user.type(screen.getByLabelText(/Correo electrónico/), 'juan@example.com');
      await user.type(screen.getByLabelText(/Ciudad/), 'Bogotá');
      await user.selectOptions(screen.getByLabelText(/¿Qué tipo de vivienda tienes\?/), 'house');
      await user.selectOptions(screen.getByLabelText(/¿Tienes patio o jardín\?/), 'yes');
      await user.selectOptions(screen.getByLabelText(/¿Cuántas horas al día estará solo el animal\?/), '4to6');
      await user.selectOptions(screen.getByLabelText(/¿Has tenido mascotas anteriormente\?/), 'dogs');
      await user.selectOptions(screen.getByLabelText(/¿Cuál es tu nivel de experiencia con mascotas\?/), 'extensive');
      await user.selectOptions(screen.getByLabelText(/¿Hay niños en el hogar\?/), 'no');
      await user.click(screen.getByLabelText(/Me comprometo a mantener al día las vacunas/));
      await user.click(screen.getByLabelText(/Acepto esterilizar al animal/));
      await user.click(screen.getByLabelText(/Acepto recibir seguimiento post-adopción/));
      await user.type(screen.getByLabelText(/¿Cuándo podrías recibir al animal\?/), 'Inmediatamente');
      await user.selectOptions(screen.getByLabelText(/¿Tienes transporte para recoger al animal\?/), 'yes');
      await user.selectOptions(screen.getByLabelText(/Preferencia de entrega/), 'pickup');
      await user.type(screen.getByLabelText(/¿Por qué deseas adoptar a este animal\?/), 'Me encantan los animales');
      return user;
    };

    it('hides the pet-type checkboxes when "no" is selected', async () => {
      render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
      const user = await fillQuestionnaireUpToPets();
      await user.selectOptions(screen.getByLabelText(/¿Tienes mascotas actualmente en casa\?/), 'no');
      expect(screen.queryByLabelText('Gatos')).toBeNull();
      expect(screen.queryByLabelText('Perros')).toBeNull();
      expect(screen.queryByLabelText('Otros animales')).toBeNull();
      expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
    });

    it('reveals numeric input when a pet-type checkbox is checked and accepts a count', async () => {
      render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
      const user = await fillQuestionnaireUpToPets();
      await user.selectOptions(screen.getByLabelText(/¿Tienes mascotas actualmente en casa\?/), 'yes');
      expect(screen.queryByLabelText('Cantidad')).toBeNull();
      await user.click(screen.getByLabelText('Gatos'));
      const quantityInput = screen.getByLabelText('Cantidad');
      expect(quantityInput).toBeInTheDocument();
      await user.type(quantityInput, '2');
      expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
    });

    it('keeps continue disabled when "yes" is selected but no pet-type checkbox is checked', async () => {
      render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
      const user = await fillQuestionnaireUpToPets();
      await user.selectOptions(screen.getByLabelText(/¿Tienes mascotas actualmente en casa\?/), 'yes');
      expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    });

    it('submits with reshaped pets payload when pets are selected', async () => {
      render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
      const user = await fillQuestionnaireUpToPets();
      await user.selectOptions(screen.getByLabelText(/¿Tienes mascotas actualmente en casa\?/), 'yes');
      await user.click(screen.getByLabelText('Gatos'));
      await user.type(screen.getByLabelText('Cantidad'), '2');
      await user.click(screen.getByRole('button', { name: 'Continuar' }));
      await user.click(screen.getByRole('button', { name: 'Continuar' }));
      await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          form_answers: expect.objectContaining({
            has_pets: true,
            pets: { cats: 2, dogs: 0, others: 0 },
          }),
        })
      );
    });
  });
});
