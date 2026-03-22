import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AdoptionForm from '../AdoptionForm';

describe('AdoptionForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the animal name in the heading', () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
    expect(screen.getByText(/Solicitud de adopción para Luna/)).toBeInTheDocument();
  });

  it('renders step indicator with three steps', () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('list', { name: 'Pasos del formulario' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('renders all questionnaire fields on the first step', () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText('¿Qué tipo de vivienda tienes?')).toBeInTheDocument();
    expect(screen.getByLabelText('¿Tienes patio o jardín?')).toBeInTheDocument();
    expect(screen.getByLabelText('¿Tienes otras mascotas actualmente?')).toBeInTheDocument();
    expect(screen.getByLabelText('¿Tienes experiencia previa con mascotas?')).toBeInTheDocument();
    expect(screen.getByLabelText('¿Cuántas horas al día puedes dedicar a la mascota?')).toBeInTheDocument();
    expect(screen.getByLabelText('¿Por qué deseas adoptar a este animal?')).toBeInTheDocument();
  });

  it('disables continue button when questionnaire is incomplete', () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  it('enables continue button when all fields are filled', async () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);

    await userEvent.selectOptions(screen.getByLabelText('¿Qué tipo de vivienda tienes?'), 'Casa');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes patio o jardín?'), 'Sí');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes otras mascotas actualmente?'), 'No');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes experiencia previa con mascotas?'), 'Mucha');
    await userEvent.selectOptions(screen.getByLabelText('¿Cuántas horas al día puedes dedicar a la mascota?'), '4-6 horas');
    await userEvent.type(screen.getByLabelText('¿Por qué deseas adoptar a este animal?'), 'Me encantan los animales');

    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
  });

  it('advances to review step after completing questionnaire', async () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);

    await userEvent.selectOptions(screen.getByLabelText('¿Qué tipo de vivienda tienes?'), 'Casa');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes patio o jardín?'), 'Sí');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes otras mascotas actualmente?'), 'No');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes experiencia previa con mascotas?'), 'Mucha');
    await userEvent.selectOptions(screen.getByLabelText('¿Cuántas horas al día puedes dedicar a la mascota?'), '4-6 horas');
    await userEvent.type(screen.getByLabelText('¿Por qué deseas adoptar a este animal?'), 'Me encantan los animales');

    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByText('Revisa tus respuestas antes de continuar:')).toBeInTheDocument();
    expect(screen.getByText('Casa')).toBeInTheDocument();
    expect(screen.getByText('Me encantan los animales')).toBeInTheDocument();
  });

  it('shows back button on review step', async () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);

    await userEvent.selectOptions(screen.getByLabelText('¿Qué tipo de vivienda tienes?'), 'Apartamento');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes patio o jardín?'), 'No');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes otras mascotas actualmente?'), 'No');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes experiencia previa con mascotas?'), 'Poca');
    await userEvent.selectOptions(screen.getByLabelText('¿Cuántas horas al día puedes dedicar a la mascota?'), '2-4 horas');
    await userEvent.type(screen.getByLabelText('¿Por qué deseas adoptar a este animal?'), 'Quiero compañía');

    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByRole('button', { name: 'Atrás' })).toBeInTheDocument();
  });

  it('navigates back to questionnaire from review step', async () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);

    await userEvent.selectOptions(screen.getByLabelText('¿Qué tipo de vivienda tienes?'), 'Casa');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes patio o jardín?'), 'Sí');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes otras mascotas actualmente?'), 'No');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes experiencia previa con mascotas?'), 'Moderada');
    await userEvent.selectOptions(screen.getByLabelText('¿Cuántas horas al día puedes dedicar a la mascota?'), '4-6 horas');
    await userEvent.type(screen.getByLabelText('¿Por qué deseas adoptar a este animal?'), 'Razón');

    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Atrás' }));

    expect(screen.getByLabelText('¿Qué tipo de vivienda tienes?')).toBeInTheDocument();
  });

  it('advances to submit step and shows notes field', async () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);

    await userEvent.selectOptions(screen.getByLabelText('¿Qué tipo de vivienda tienes?'), 'Casa');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes patio o jardín?'), 'Sí');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes otras mascotas actualmente?'), 'No');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes experiencia previa con mascotas?'), 'Mucha');
    await userEvent.selectOptions(screen.getByLabelText('¿Cuántas horas al día puedes dedicar a la mascota?'), 'Más de 6 horas');
    await userEvent.type(screen.getByLabelText('¿Por qué deseas adoptar a este animal?'), 'Amor');

    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByPlaceholderText('Notas adicionales (opcional)...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar solicitud' })).toBeInTheDocument();
  });

  it('calls onSubmit with form data and notes on final submission', async () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} />);

    await userEvent.selectOptions(screen.getByLabelText('¿Qué tipo de vivienda tienes?'), 'Finca');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes patio o jardín?'), 'Sí');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes otras mascotas actualmente?'), 'Sí, perro(s)');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes experiencia previa con mascotas?'), 'Mucha');
    await userEvent.selectOptions(screen.getByLabelText('¿Cuántas horas al día puedes dedicar a la mascota?'), 'Más de 6 horas');
    await userEvent.type(screen.getByLabelText('¿Por qué deseas adoptar a este animal?'), 'Gran espacio');

    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    await userEvent.type(screen.getByPlaceholderText('Notas adicionales (opcional)...'), 'Por favor contactarme pronto');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      form_answers: {
        housing_type: 'Finca',
        has_yard: 'Sí',
        other_pets: 'Sí, perro(s)',
        experience: 'Mucha',
        daily_hours: 'Más de 6 horas',
        motivation: 'Gran espacio',
      },
      notes: 'Por favor contactarme pronto',
    });
  });

  it('shows submitting state when submitting prop is true', async () => {
    render(<AdoptionForm animalName="Luna" onSubmit={mockOnSubmit} submitting={true} />);

    await userEvent.selectOptions(screen.getByLabelText('¿Qué tipo de vivienda tienes?'), 'Casa');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes patio o jardín?'), 'Sí');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes otras mascotas actualmente?'), 'No');
    await userEvent.selectOptions(screen.getByLabelText('¿Tienes experiencia previa con mascotas?'), 'Mucha');
    await userEvent.selectOptions(screen.getByLabelText('¿Cuántas horas al día puedes dedicar a la mascota?'), '4-6 horas');
    await userEvent.type(screen.getByLabelText('¿Por qué deseas adoptar a este animal?'), 'Amor');

    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled();
  });
});
