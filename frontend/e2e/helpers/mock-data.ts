/**
 * Shared mock data for E2E tests.
 *
 * Single source of truth — imported by feature specs AND contract tests.
 * Field names and types MUST match backend serializer definitions
 * documented in contract-schemas.ts.
 */

// ── Volunteer Positions (VolunteerPositionSerializer) ──

export const mockVolunteerPositions = [
  {
    id: 1,
    title: 'Fotógrafo de animales',
    description: 'Ayuda a documentar la vida de nuestros animales con fotografías.',
    requirements: 'Cámara propia y experiencia básica en fotografía.',
    category: 'photographer',
    icon: '',
    order: 0,
  },
  {
    id: 2,
    title: 'Paseador de perros',
    description: 'Acompaña a nuestros perros en paseos recreativos.',
    requirements: 'Disponibilidad los fines de semana.',
    category: 'dog_walker',
    icon: '',
    order: 1,
  },
];

// ── Favorites (FavoriteSerializer) ──

export const mockFavorites = [
  {
    id: 1, animal: 10, animal_name: 'Luna', animal_species: 'dog', breed: 'Labrador',
    age_range: 'young', size: 'large', gender: 'female',
    is_vaccinated: true, is_sterilized: false, status: 'published',
    shelter_name: 'Refugio Amor', shelter_city: 'Bogotá', thumbnail_url: null,
    note: '', created_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 2, animal: 20, animal_name: 'Milo', animal_species: 'cat', breed: 'Siamés',
    age_range: 'adult', size: 'small', gender: 'male',
    is_vaccinated: true, is_sterilized: true, status: 'published',
    shelter_name: 'Patitas Felices', shelter_city: 'Medellín', thumbnail_url: null,
    note: '', created_at: '2026-03-19T08:00:00Z',
  },
  {
    id: 3, animal: 30, animal_name: 'Rocky', animal_species: 'dog', breed: 'Bulldog',
    age_range: 'senior', size: 'medium', gender: 'male',
    is_vaccinated: false, is_sterilized: true, status: 'published',
    shelter_name: 'Huellas de Amor', shelter_city: 'Cali', thumbnail_url: null,
    note: 'Me gusta mucho', created_at: '2026-03-15T12:00:00Z',
  },
];

export const mockFavoritesBella = {
  id: 4, animal: 40, animal_name: 'Bella', animal_species: 'cat', breed: 'Persa',
  age_range: 'young', size: 'small', gender: 'female',
  is_vaccinated: true, is_sterilized: true, status: 'published',
  shelter_name: 'Amigos Peludos', shelter_city: 'Barranquilla', thumbnail_url: null,
  note: '', created_at: '2026-03-10T09:00:00Z',
};

// ── Pending Shelters (admin_views.py pending_shelters) ──

export const mockPendingShelters = [
  { id: 10, name: 'Refugio Nuevo', legal_name: 'Refugio Nuevo SAS', city: 'Cali', owner_email: 'owner@refugio.com', created_at: '2026-03-25T10:00:00Z' },
  { id: 11, name: 'Patitas Felices', legal_name: '', city: 'Medellín', owner_email: 'patitas@example.com', created_at: '2026-03-24T08:30:00Z' },
];

// ── Admin Metrics (admin_views.py admin_metrics) ──

export const mockMetrics = {
  donations: { total_amount: '2500000.00', total_count: 45, avg_amount: '55555.56' },
  sponsorships: { total_amount: '1200000.00', total_count: 30, avg_amount: '40000.00' },
  adoption_rate: { total_published: 120, total_adopted: 48 },
  avg_applications_per_animal: 2.3,
  avg_adoption_time_days: 15.0,
  user_retention_30d: 72.0,
};

// ── Payments (PaymentListSerializer) ──

export const mockPayments = [
  { id: 1, donation: 1, sponsorship: null, modality: 'donation', provider: 'wompi', provider_reference: 'ref-abc-123', amount: '50000.00', status: 'approved', paid_at: '2026-03-20T10:05:00Z', created_at: '2026-03-20T10:00:00Z' },
  { id: 2, donation: null, sponsorship: 2, modality: 'sponsorship', provider: 'wompi', provider_reference: 'ref-def-456', amount: '30000.00', status: 'pending', paid_at: null, created_at: '2026-03-19T14:30:00Z' },
  { id: 3, donation: 3, sponsorship: null, modality: 'donation', provider: 'wompi', provider_reference: 'ref-ghi-789', amount: '100000.00', status: 'declined', paid_at: null, created_at: '2026-03-18T08:15:00Z' },
];

// ── Profile Stats ──

export const mockProfileStats = {
  applications: { total: 3, by_status: { pending: 1, approved: 1, rejected: 1 } },
  sponsorships: { active_count: 1, total_count: 2 },
  donations: { total_amount: '150000', count: 3 },
  favorites: {
    count: 2,
    preview: [
      { id: 1, name: 'Luna', species: 'dog', thumbnail_url: null },
      { id: 2, name: 'Milo', species: 'cat', thumbnail_url: null },
    ],
  },
  adopter_intent: { status: 'active', visibility: 'public' },
  shelter_invites: { pending_count: 0 },
};

export const mockActivity = [
  { type: 'application', animal_name: 'Luna', shelter_name: 'Refugio Amor', status: 'pending', date: '2026-03-20T10:00:00Z' },
  { type: 'donation', shelter_name: 'Refugio Amor', amount: '50000', date: '2026-03-18T14:30:00Z' },
];

// ── Shelter Panel Mocks ──

export const mockShelterAnimals = [
  { id: 1, name: 'Luna', species: 'dog', breed: 'Labrador', size: 'large', status: 'published', is_vaccinated: true, is_sterilized: false },
  { id: 2, name: 'Milo', species: 'cat', breed: 'Siamés', size: 'small', status: 'draft', is_vaccinated: true, is_sterilized: true },
  { id: 3, name: 'Rocky', species: 'dog', breed: 'Bulldog', size: 'medium', status: 'adopted', is_vaccinated: false, is_sterilized: true },
];

export const mockShelterCampaigns = [
  { id: 1, title: 'Campaña de vacunación', description: 'Vacunas para todos', shelter: 1, shelter_name: 'Refugio E2E', goal_amount: '500000.00', raised_amount: '250000.00', progress_percentage: 50, status: 'active', cover_image_url: '', starts_at: '2026-03-01T00:00:00Z', ends_at: '2026-04-30T00:00:00Z', created_at: '2026-02-28T10:00:00Z' },
  { id: 2, title: 'Alimento para refugio', description: 'Comida mensual', shelter: 1, shelter_name: 'Refugio E2E', goal_amount: '300000.00', raised_amount: '300000.00', progress_percentage: 100, status: 'completed', cover_image_url: '', starts_at: '2026-01-01T00:00:00Z', ends_at: '2026-02-28T00:00:00Z', created_at: '2025-12-20T10:00:00Z' },
];

export const mockShelterDonations = [
  {
    id: 1,
    user: 2,
    user_email: 'donor1@example.com',
    destination: 'campaign',
    shelter: 1,
    shelter_name: 'Refugio E2E',
    shelter_city: 'Bogotá',
    campaign: 1,
    campaign_title: 'Campaña de vacunación',
    amount: '50000.00',
    message: 'Mucha fuerza',
    status: 'paid',
    paid_at: '2026-03-20T10:05:00Z',
    created_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 2,
    user: 3,
    user_email: 'donor2@example.com',
    destination: 'shelter',
    shelter: 1,
    shelter_name: 'Refugio E2E',
    shelter_city: 'Bogotá',
    campaign: null,
    campaign_title: null,
    amount: '30000.00',
    message: null,
    status: 'paid',
    paid_at: '2026-03-18T14:35:00Z',
    created_at: '2026-03-18T14:30:00Z',
  },
];

export const mockShelterData = [
  { id: 1, name: 'Refugio E2E', legal_name: 'Refugio E2E SAS', description: 'Test shelter', city: 'Bogotá', address: 'Calle 123', phone: '+57 300 000 0000', email: 'shelter@test.com', website: '', verification_status: 'verified', owner: 1 },
];

// ── Moderation Mocks ──

export const mockModerationAnimals = [
  { id: 1, name: 'Luna', species: 'dog', status: 'published', shelter: { id: 1, name: 'Refugio Amor' } },
  { id: 2, name: 'Milo', species: 'cat', status: 'published', shelter: { id: 2, name: 'Patitas Felices' } },
];

export const mockModerationShelters = [
  { id: 1, name: 'Refugio Amor', city: 'Bogotá', owner_email: 'amor@example.com', verification_status: 'verified' },
  { id: 2, name: 'Patitas Felices', city: 'Medellín', owner_email: 'patitas@example.com', verification_status: 'pending' },
];
