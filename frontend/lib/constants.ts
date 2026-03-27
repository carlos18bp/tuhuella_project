export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  FORGOT_PASSWORD: '/forgot-password',
  FAQ: '/faq',

  ANIMALS: '/animals',
  ANIMAL_DETAIL: (id: number | string) => `/animals/${id}`,
  SHELTERS: '/shelters',
  SHELTER_DETAIL: (id: number | string) => `/shelters/${id}`,
  CAMPAIGNS: '/campaigns',
  CAMPAIGN_DETAIL: (id: number | string) => `/campaigns/${id}`,
  LOOKING_TO_ADOPT: '/looking-to-adopt',
  BLOG: '/blog',
  BLOG_DETAIL: (slug: string) => `/blog/${slug}`,
  ADMIN_BLOG: '/admin/blog',
  ADMIN_BLOG_CREATE: '/admin/blog/crear',
  ADMIN_BLOG_EDIT: (id: number | string) => `/admin/blog/${id}/editar`,
  ADMIN_BLOG_CALENDAR: '/admin/blog/calendario',

  ABOUT: '/about',
  WORK_WITH_US: '/work-with-us',
  VOLUNTEER_APPLY: (positionId: number | string) => `/work-with-us/apply/${positionId}`,
  STRATEGIC_ALLIES: '/strategic-allies',
  TERMS: '/terms',
  ADOPT: (id: number | string) => `/adopt/${id}`,

  MY_PROFILE: '/my-profile',
  FAVORITES: '/favorites',
  MY_INTENT: '/my-intent',
  MY_APPLICATIONS: '/my-applications',
  MY_DONATIONS: '/my-donations',
  MY_SPONSORSHIPS: '/my-sponsorships',

  SHELTER_ONBOARDING: '/shelter/onboarding',
  SHELTER_DASHBOARD: '/shelter/dashboard',
  SHELTER_ANIMALS: '/shelter/animals',
  SHELTER_APPLICATIONS: '/shelter/applications',
  SHELTER_CAMPAIGNS: '/shelter/campaigns',
  SHELTER_DONATIONS: '/shelter/donations',
  SHELTER_UPDATES: '/shelter/updates',
  SHELTER_UPDATES_CREATE: '/shelter/updates/create',
  SHELTER_SETTINGS: '/shelter/settings',

  MY_NOTIFICATIONS: '/my-profile/notifications',

  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_APPROVE_SHELTERS: '/admin/shelters/approve',
  ADMIN_MODERATION: '/admin/moderation',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_METRICS: '/admin/metrics',

  CHECKOUT_DONATION: '/checkout/donation',
  CHECKOUT_SPONSORSHIP: '/checkout/sponsorship',
  CHECKOUT_CONFIRMATION: '/checkout/confirmation',
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
  UPDATE_UPDATE: (id: number) => `/updates/${id}/update/`,
  UPDATE_DELETE: (id: number) => `/updates/${id}/delete/`,

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
  SHELTER_METRICS: '/admin/shelter/metrics/',

  FAVORITES: '/favorites/',
  FAVORITE_TOGGLE: '/favorites/toggle/',

  BLOG_LIST: '/blog/',
  BLOG_DETAIL: (slug: string) => `/blog/${slug}/`,
  BLOG_ADMIN_LIST: '/blog/admin/',
  BLOG_ADMIN_CREATE: '/blog/admin/create/',
  BLOG_ADMIN_CREATE_FROM_JSON: '/blog/admin/create-from-json/',
  BLOG_ADMIN_JSON_TEMPLATE: '/blog/admin/json-template/',
  BLOG_ADMIN_DETAIL: (id: number) => `/blog/admin/${id}/detail/`,
  BLOG_ADMIN_UPDATE: (id: number) => `/blog/admin/${id}/update/`,
  BLOG_ADMIN_DELETE: (id: number) => `/blog/admin/${id}/delete/`,
  BLOG_ADMIN_DUPLICATE: (id: number) => `/blog/admin/${id}/duplicate/`,
  BLOG_ADMIN_UPLOAD_COVER: (id: number) => `/blog/admin/${id}/upload-cover/`,
  BLOG_ADMIN_CALENDAR: '/blog/admin/calendar/',

  NOTIFICATION_PREFERENCES: '/notifications/preferences/',
  NOTIFICATION_PREFERENCES_INIT: '/notifications/preferences/init/',
  NOTIFICATION_PREFERENCES_UPDATE: '/notifications/preferences/update/',
  NOTIFICATION_LOGS: '/notifications/logs/',
  NOTIFICATION_LOG_READ: (id: number) => `/notifications/logs/${id}/read/`,
  NOTIFICATION_MARK_ALL_READ: '/notifications/logs/mark-all-read/',
  NOTIFICATION_UNREAD_COUNT: '/notifications/unread-count/',

  FAQS_ALL: '/faqs/',
  FAQS_BY_TOPIC: (slug: string) => `/faqs/${slug}/`,

  DONATION_AMOUNTS: '/donation-amounts/',
  SPONSORSHIP_AMOUNTS: '/sponsorship-amounts/',

  VOLUNTEER_POSITIONS: '/volunteer-positions/',
  VOLUNTEER_APPLICATIONS: '/volunteer-applications/',
  STRATEGIC_ALLIES: '/strategic-allies/',
} as const;

export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
} as const;
