export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  FORGOT_PASSWORD: '/forgot-password',
  FAQ: '/faq',

  ANIMALS: '/animales',
  ANIMAL_DETAIL: (id: number | string) => `/animales/${id}`,
  SHELTERS: '/refugios',
  SHELTER_DETAIL: (id: number | string) => `/refugios/${id}`,
  CAMPAIGNS: '/campanas',
  CAMPAIGN_DETAIL: (id: number | string) => `/campanas/${id}`,
  BUSCO_ADOPTAR: '/busco-adoptar',

  MY_PROFILE: '/mi-perfil',
  FAVORITES: '/favoritos',
  MY_INTENT: '/mi-intencion',
  MY_APPLICATIONS: '/mis-solicitudes',
  MY_DONATIONS: '/mis-donaciones',
  MY_SPONSORSHIPS: '/mis-apadrinamientos',

  SHELTER_ONBOARDING: '/refugio/onboarding',
  SHELTER_DASHBOARD: '/refugio/dashboard',
  SHELTER_ANIMALS: '/refugio/animales',
  SHELTER_APPLICATIONS: '/refugio/solicitudes',
  SHELTER_CAMPAIGNS: '/refugio/campanas',
  SHELTER_DONATIONS: '/refugio/donaciones',
  SHELTER_SETTINGS: '/refugio/configuracion',

  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_APPROVE_SHELTERS: '/admin/refugios/aprobar',
  ADMIN_MODERATION: '/admin/moderacion',
  ADMIN_PAYMENTS: '/admin/pagos',
  ADMIN_METRICS: '/admin/metricas',

  CHECKOUT_DONATION: '/checkout/donacion',
  CHECKOUT_SPONSORSHIP: '/checkout/apadrinamiento',
  CHECKOUT_CONFIRMATION: '/checkout/confirmacion',
} as const;

export const API_ENDPOINTS = {
  SIGN_IN: '/auth/sign_in/',
  SIGN_UP: '/auth/sign_up/',
  GOOGLE_LOGIN: '/auth/google_login/',
  SEND_PASSCODE: '/auth/send_passcode/',
  RESET_PASSWORD: '/auth/verify_passcode_and_reset_password/',
  UPDATE_PASSWORD: '/auth/update_password/',
  VALIDATE_TOKEN: '/auth/validate_token/',

  SHELTERS: '/shelters/',
  SHELTER_DETAIL: (id: number) => `/shelters/${id}/`,
  SHELTER_CREATE: '/shelters/create/',
  SHELTER_UPDATE: (id: number) => `/shelters/${id}/update/`,

  ANIMALS: '/animals/',
  ANIMAL_DETAIL: (id: number) => `/animals/${id}/`,
  ANIMAL_CREATE: '/animals/create/',
  ANIMAL_UPDATE: (id: number) => `/animals/${id}/update/`,
  ANIMAL_DELETE: (id: number) => `/animals/${id}/delete/`,

  ADOPTIONS: '/adoptions/',
  ADOPTION_DETAIL: (id: number) => `/adoptions/${id}/`,
  ADOPTION_CREATE: '/adoptions/create/',
  ADOPTION_UPDATE_STATUS: (id: number) => `/adoptions/${id}/status/`,

  CAMPAIGNS: '/campaigns/',
  CAMPAIGN_DETAIL: (id: number) => `/campaigns/${id}/`,
  CAMPAIGN_CREATE: '/campaigns/create/',
  CAMPAIGN_UPDATE: (id: number) => `/campaigns/${id}/update/`,

  DONATIONS: '/donations/',
  DONATION_CREATE: '/donations/create/',
  DONATION_DETAIL: (id: number) => `/donations/${id}/`,

  SPONSORSHIPS: '/sponsorships/',
  SPONSORSHIP_CREATE: '/sponsorships/create/',
  SPONSORSHIP_DETAIL: (id: number) => `/sponsorships/${id}/`,
  SPONSORSHIP_UPDATE_STATUS: (id: number) => `/sponsorships/${id}/status/`,

  PAYMENT_CREATE_INTENT: '/payments/create-intent/',
  PAYMENT_STATUS: (id: number) => `/payments/${id}/status/`,

  UPDATES: '/updates/',
  UPDATE_DETAIL: (id: number) => `/updates/${id}/`,
  UPDATE_CREATE: '/updates/create/',

  ADOPTER_INTENTS: '/adopter-intents/',
  ADOPTER_INTENT_ME: '/adopter-intents/me/',
  ADOPTER_INTENT_CREATE: '/adopter-intents/create/',

  SHELTER_INVITES: '/shelter-invites/',
  SHELTER_INVITE_CREATE: '/shelter-invites/create/',
  SHELTER_INVITE_RESPOND: (id: number) => `/shelter-invites/${id}/respond/`,

  ADMIN_DASHBOARD: '/admin/dashboard/',
  ADMIN_PENDING_SHELTERS: '/admin/shelters/pending/',
  ADMIN_APPROVE_SHELTER: (id: number) => `/admin/shelters/approve/${id}/`,
  ADMIN_METRICS: '/admin/metrics/',

  FAVORITES: '/favorites/',
  FAVORITE_TOGGLE: '/favorites/toggle/',
} as const;

export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
} as const;
