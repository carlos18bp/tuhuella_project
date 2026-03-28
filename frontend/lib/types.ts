export type UserRole = 'adopter' | 'shelter_admin' | 'admin';

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  role: UserRole;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
};

export type ProfileStats = {
  applications: {
    total: number;
    by_status: Record<string, number>;
  };
  sponsorships: {
    active_count: number;
    total_count: number;
  };
  donations: {
    total_amount: string;
    count: number;
  };
  favorites: {
    count: number;
    preview: { id: number; name: string; species: string; thumbnail_url: string | null }[];
  };
  adopter_intent: { status: string; visibility: string } | null;
  shelter_invites: {
    pending_count: number;
  };
};

export type ActivityEvent = {
  type: 'application' | 'donation' | 'sponsorship' | 'favorite';
  animal_name?: string;
  shelter_name?: string;
  status?: string;
  amount?: string;
  date: string;
};

export type Shelter = {
  id: number;
  name: string;
  legal_name?: string;
  description?: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verified_at?: string | null;
  is_verified: boolean;
  logo_url?: string;
  cover_image_url?: string;
  gallery_urls?: string[];
  owner_email: string;
  created_at: string;
  updated_at?: string;
};

export type AnimalSpecies = 'dog' | 'cat' | 'other';
export type AnimalAgeRange = 'puppy' | 'young' | 'adult' | 'senior';
export type AnimalGender = 'male' | 'female' | 'unknown';
export type AnimalSize = 'small' | 'medium' | 'large';
export type AnimalStatus = 'draft' | 'published' | 'in_process' | 'adopted' | 'archived';
export type AnimalCompatibility = 'yes' | 'no' | 'unknown';
export type AnimalEnergyLevel = 'low' | 'medium' | 'high';

export type Animal = {
  id: number;
  name: string;
  species: AnimalSpecies;
  breed: string;
  age_range: AnimalAgeRange;
  gender: AnimalGender;
  size: AnimalSize;
  description?: string;
  special_needs?: string;
  status: AnimalStatus;
  is_vaccinated: boolean;
  is_sterilized: boolean;
  weight?: number;
  is_house_trained: boolean;
  good_with_kids: AnimalCompatibility;
  good_with_dogs: AnimalCompatibility;
  good_with_cats: AnimalCompatibility;
  energy_level: AnimalEnergyLevel;
  coat_color?: string;
  intake_date?: string;
  microchip_id?: string;
  shelter: number;
  shelter_name: string;
  shelter_city?: string;
  gallery_urls?: string[];
  created_at: string;
  updated_at?: string;
};

export type AdoptionApplicationStatus =
  | 'submitted' | 'reviewing' | 'interview' | 'approved' | 'rejected';

export type AdoptionApplication = {
  id: number;
  animal: number;
  animal_name: string;
  animal_species?: AnimalSpecies;
  shelter_name?: string;
  shelter_city?: string;
  thumbnail_url?: string | null;
  user: number;
  user_email: string;
  status: AdoptionApplicationStatus;
  form_answers: Record<string, unknown>;
  notes?: string;
  reviewed_at?: string | null;
  created_at: string;
  updated_at?: string;
};

export type CampaignStatus = 'draft' | 'active' | 'completed' | 'paused' | 'archived';

export type Campaign = {
  id: number;
  title: string;
  description?: string;
  shelter: number;
  shelter_name: string;
  status: CampaignStatus;
  goal_amount: string;
  raised_amount: string;
  progress_percentage: number;
  cover_image_url?: string | null;
  evidence_gallery_urls?: string[];
  starts_at?: string | null;
  ends_at?: string | null;
  created_at: string;
  updated_at?: string;
};

export type PaginatedResponse<T> = {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: T[];
};

export type VolunteerPosition = {
  id: number;
  title: string;
  description: string;
  requirements: string;
  category: string;
  icon: string;
  order: number;
};

export type VolunteerApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

export type VolunteerApplication = {
  id: number;
  position: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  motivation: string;
  status: VolunteerApplicationStatus;
  created_at: string;
};

export type StrategicAlly = {
  id: number;
  name: string;
  description: string;
  logo_url: string;
  website: string;
  ally_type: string;
  order: number;
};

export type DonationStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type Donation = {
  id: number;
  user: number;
  user_email: string;
  shelter?: number | null;
  shelter_name?: string | null;
  shelter_city?: string | null;
  campaign?: number | null;
  campaign_title?: string | null;
  amount: string;
  status: DonationStatus;
  message?: string;
  paid_at?: string | null;
  created_at: string;
  updated_at?: string;
};

export type SponsorshipFrequency = 'monthly' | 'one_time';
export type SponsorshipStatus = 'pending' | 'active' | 'paused' | 'canceled';

export type Sponsorship = {
  id: number;
  user: number;
  user_email?: string;
  animal: number;
  animal_name: string;
  animal_species?: AnimalSpecies;
  shelter_name?: string;
  shelter_city?: string;
  thumbnail_url?: string | null;
  amount: string;
  frequency: SponsorshipFrequency;
  status: SponsorshipStatus;
  started_at?: string | null;
  created_at: string;
  updated_at?: string;
};

export type PaymentStatus = 'pending' | 'approved' | 'declined' | 'voided' | 'error';

export type Payment = {
  id: number;
  donation?: number | null;
  sponsorship?: number | null;
  provider: string;
  provider_reference: string;
  amount: string;
  status: PaymentStatus;
  paid_at?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
};

export type PaymentIntent = {
  payment_id: number;
  provider: string;
  status: string;
  amount: string;
  redirect_url: string | null;
  message: string;
};

export type UpdatePost = {
  id: number;
  title: string;
  content?: string;
  shelter: number;
  shelter_name: string;
  campaign?: number | null;
  animal?: number | null;
  created_at: string;
  updated_at?: string;
};

export type AdopterIntentStatus = 'active' | 'paused' | 'matched';
export type AdopterIntentVisibility = 'public' | 'private';

export type AdopterIntent = {
  id: number;
  user: number;
  user_email?: string;
  user_name?: string;
  preferences: Record<string, unknown>;
  description?: string;
  status: AdopterIntentStatus;
  visibility: AdopterIntentVisibility;
  created_at: string;
  updated_at?: string;
};

export type ShelterInviteStatus = 'pending' | 'accepted' | 'rejected';

export type ShelterInvite = {
  id: number;
  shelter: number;
  shelter_name: string;
  adopter_intent: number;
  adopter_email: string;
  message?: string;
  status: ShelterInviteStatus;
  created_at: string;
};

export type Favorite = {
  id: number;
  animal: number;
  animal_name: string;
  animal_species: AnimalSpecies;
  breed: string;
  age_range: AnimalAgeRange;
  size: AnimalSize;
  gender: AnimalGender;
  is_vaccinated: boolean;
  is_sterilized: boolean;
  status: AnimalStatus;
  shelter_name: string;
  shelter_city: string;
  thumbnail_url: string | null;
  note: string;
  created_at: string;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  cover_image: string;
  excerpt: string;
  category: string;
  read_time_minutes: number;
  is_featured: boolean;
  author: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

export type BlogPostDetail = BlogPost & {
  cover_image_credit: string;
  cover_image_credit_url: string;
  content: string;
  content_json: Record<string, unknown>;
  sources: Array<{ name: string; url: string }>;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  updated_at: string;
};

export type BlogPostAdmin = {
  id: number;
  title_es: string;
  title_en: string;
  slug: string;
  cover_image: string;
  cover_image_url: string;
  cover_image_display: string;
  cover_image_credit: string;
  cover_image_credit_url: string;
  excerpt_es: string;
  excerpt_en: string;
  content_es: string;
  content_en: string;
  content_json_es: Record<string, unknown>;
  content_json_en: Record<string, unknown>;
  sources: Array<{ name: string; url: string }>;
  category: string;
  read_time_minutes: number;
  is_featured: boolean;
  author: string;
  meta_title_es: string;
  meta_title_en: string;
  meta_description_es: string;
  meta_description_en: string;
  meta_keywords_es: string;
  meta_keywords_en: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};
