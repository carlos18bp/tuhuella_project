/**
 * Contract Schema Definitions
 *
 * Defines the expected shape of backend API responses based on Django serializer fields.
 * Used by contract-validate.ts to detect mock/backend schema drift in E2E tests.
 *
 * Source of truth: backend/base_feature_app/serializers/*.py
 * Last synced: 2026-03-28
 */

type FieldType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';

interface FieldSpec {
  type: FieldType | FieldType[];
  nullable?: boolean;
  optional?: boolean;
}

export interface SchemaDefinition {
  name: string;
  source: string;
  fields: Record<string, FieldSpec>;
}

// ── Volunteer Position (GET /volunteer-positions/) ──
export const volunteerPositionSchema: SchemaDefinition = {
  name: 'VolunteerPosition',
  source: 'serializers/volunteer_position.py',
  fields: {
    id: { type: 'number' },
    title: { type: 'string' },
    description: { type: 'string' },
    requirements: { type: 'string' },
    category: { type: 'string' },
    icon: { type: 'string' },
    order: { type: 'number' },
  },
};

// ── Favorite (GET /favorites/) ──
export const favoriteSchema: SchemaDefinition = {
  name: 'Favorite',
  source: 'serializers/favorite.py',
  fields: {
    id: { type: 'number' },
    animal: { type: 'number' },
    animal_name: { type: 'string' },
    animal_species: { type: 'string' },
    breed: { type: 'string' },
    age_range: { type: 'string' },
    size: { type: 'string' },
    gender: { type: 'string' },
    is_vaccinated: { type: 'boolean' },
    is_sterilized: { type: 'boolean' },
    status: { type: 'string' },
    shelter_name: { type: 'string' },
    shelter_city: { type: 'string' },
    thumbnail_url: { type: 'string', nullable: true },
    note: { type: 'string' },
    created_at: { type: 'string' },
  },
};

// ── User Detail (GET /user/profile/, GET /auth/validate_token/) ──
export const userDetailSchema: SchemaDefinition = {
  name: 'UserDetail',
  source: 'serializers/user_detail.py',
  fields: {
    id: { type: 'number' },
    email: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    phone: { type: 'string' },
    role: { type: 'string' },
    is_active: { type: 'boolean' },
    is_staff: { type: 'boolean' },
    date_joined: { type: 'string', optional: true },
  },
};

// ── Shelter List (GET /shelters/) ──
export const shelterListSchema: SchemaDefinition = {
  name: 'ShelterList',
  source: 'serializers/shelter_list.py',
  fields: {
    id: { type: 'number' },
    name: { type: 'string' },
    description: { type: 'string' },
    city: { type: 'string' },
    verification_status: { type: 'string' },
    is_verified: { type: 'boolean' },
    logo_url: { type: 'string' },
    cover_image_url: { type: 'string' },
    owner_email: { type: 'string' },
    created_at: { type: 'string' },
  },
};

// ── Campaign List (GET /campaigns/) ──
export const campaignListSchema: SchemaDefinition = {
  name: 'CampaignList',
  source: 'serializers/campaign_list.py',
  fields: {
    id: { type: 'number' },
    title: { type: 'string' },
    description: { type: 'string' },
    shelter: { type: 'number' },
    shelter_name: { type: 'string' },
    status: { type: 'string' },
    goal_amount: { type: 'string' },
    raised_amount: { type: 'string' },
    progress_percentage: { type: 'number' },
    cover_image_url: { type: 'string' },
    starts_at: { type: 'string' },
    ends_at: { type: 'string' },
    created_at: { type: 'string' },
  },
};

// ── Donation List (GET /donations/) ──
export const donationListSchema: SchemaDefinition = {
  name: 'DonationList',
  source: 'serializers/donation_list.py',
  fields: {
    id: { type: 'number' },
    user: { type: 'number' },
    user_email: { type: 'string' },
    shelter: { type: 'number', nullable: true },
    shelter_name: { type: 'string', nullable: true },
    shelter_city: { type: 'string', nullable: true },
    campaign: { type: 'number', nullable: true },
    campaign_title: { type: 'string', nullable: true },
    amount: { type: 'string' },
    message: { type: 'string', nullable: true },
    status: { type: 'string' },
    paid_at: { type: 'string', nullable: true },
    created_at: { type: 'string' },
  },
};

// ── Payment List (GET /payments/) ──
export const paymentListSchema: SchemaDefinition = {
  name: 'PaymentList',
  source: 'serializers/payment_list.py',
  fields: {
    id: { type: 'number' },
    provider: { type: 'string' },
    provider_reference: { type: 'string' },
    amount: { type: 'string' },
    status: { type: 'string' },
    paid_at: { type: 'string', nullable: true },
    created_at: { type: 'string' },
  },
};

// ── Pending Shelter (GET /admin/shelters/pending/) ──
export const pendingShelterSchema: SchemaDefinition = {
  name: 'PendingShelter',
  source: 'views/admin_views.py (pending_shelters)',
  fields: {
    id: { type: 'number' },
    name: { type: 'string' },
    legal_name: { type: 'string' },
    city: { type: 'string' },
    owner_email: { type: 'string' },
    created_at: { type: 'string' },
  },
};

// ── Admin Metrics (GET /admin/metrics/) ──
export const adminMetricsSchema: SchemaDefinition = {
  name: 'AdminMetrics',
  source: 'views/admin_views.py (admin_metrics)',
  fields: {
    donations: { type: 'object' },
    sponsorships: { type: 'object' },
    adoption_rate: { type: 'object' },
    avg_applications_per_animal: { type: 'number' },
    avg_adoption_time_days: { type: 'number', nullable: true },
    user_retention_30d: { type: 'number' },
  },
};

export const allSchemas: SchemaDefinition[] = [
  volunteerPositionSchema,
  favoriteSchema,
  userDetailSchema,
  shelterListSchema,
  campaignListSchema,
  donationListSchema,
  paymentListSchema,
  pendingShelterSchema,
  adminMetricsSchema,
];
