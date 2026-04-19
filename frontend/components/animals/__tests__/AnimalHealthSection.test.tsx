import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import AnimalHealthSection from '../AnimalHealthSection';
import type { Animal } from '@/lib/types';

const baseAnimal: Pick<
  Animal,
  | 'species'
  | 'is_vaccinated'
  | 'is_sterilized'
  | 'is_dewormed'
  | 'vaccinated_at'
  | 'sterilized_at'
  | 'last_vet_checkup'
  | 'medical_notes_es'
  | 'medical_notes_en'
  | 'disease_screenings'
> = {
  species: 'dog',
  is_vaccinated: false,
  is_sterilized: false,
  is_dewormed: false,
  vaccinated_at: null,
  sterilized_at: null,
  last_vet_checkup: null,
  medical_notes_es: '',
  medical_notes_en: '',
  disease_screenings: [],
};

describe('AnimalHealthSection', () => {
  it('renders empty-state copy when there are no disease screenings', () => {
    render(<AnimalHealthSection animal={baseAnimal} />);
    expect(screen.getByText('Sin pruebas registradas')).toBeInTheDocument();
  });

  it('assigns the negative-result data attribute for a negative screening', () => {
    render(
      <AnimalHealthSection
        animal={{
          ...baseAnimal,
          disease_screenings: [
            { id: 1, disease_key: 'distemper', result: 'negative', tested_on: '2026-04-01' },
          ],
        }}
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveAttribute('data-result', 'negative');
  });

  it('renders positive and not_tested screenings with their respective data attributes', () => {
    render(
      <AnimalHealthSection
        animal={{
          ...baseAnimal,
          disease_screenings: [
            { id: 1, disease_key: 'parvovirus', result: 'positive' },
            { id: 2, disease_key: 'ehrlichia', result: 'not_tested' },
          ],
        }}
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute('data-result', 'positive');
    expect(items[1]).toHaveAttribute('data-result', 'not_tested');
  });

  it('renders Spanish medical notes when locale is es', () => {
    render(
      <AnimalHealthSection
        animal={{
          ...baseAnimal,
          medical_notes_es: 'Sin alergias conocidas',
          medical_notes_en: 'No known allergies',
        }}
      />,
    );
    expect(screen.getByText('Sin alergias conocidas')).toBeInTheDocument();
    expect(screen.queryByText('No known allergies')).toBeNull();
  });
});
