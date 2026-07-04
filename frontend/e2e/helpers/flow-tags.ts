/**
 * Flow tag constants for consistent E2E test tagging.
 *
 * Each constant bundles @flow:, @module:, and @priority: tags.
 * Use spread syntax to compose tags in tests:
 *
 *   import { AUTH_LOGIN_INVALID } from '../helpers/flow-tags';
 *   test('...', { tag: [...AUTH_LOGIN_INVALID] }, async ({ page }) => { ... });
 */

// ── Home ──
export const HOME_LOADS = ['@flow:home-loads', '@module:home', '@priority:P1'];
export const HOME_TO_ANIMALS = ['@flow:home-to-animals', '@module:home', '@priority:P2'];
export const HOME_TO_SHELTERS = ['@flow:home-to-shelters', '@module:home', '@priority:P2'];
export const HOME_TO_CAMPAIGNS = ['@flow:home-to-campaigns', '@module:home', '@priority:P3'];

// ── Auth ──
export const AUTH_ADMIN_TOKEN_HANDOFF = ['@flow:auth-admin-token-handoff', '@module:auth', '@priority:P3'];
export const AUTH_SIGN_IN_FORM = ['@flow:auth-sign-in-form', '@module:auth', '@priority:P1'];
export const AUTH_LOGIN_INVALID = ['@flow:auth-login-invalid', '@module:auth', '@priority:P1'];
export const AUTH_SIGN_UP_FORM = ['@flow:auth-sign-up-form', '@module:auth', '@priority:P1'];
export const AUTH_FORGOT_PASSWORD_FORM = ['@flow:auth-forgot-password-form', '@module:auth', '@priority:P2'];
export const AUTH_FORGOT_PASSWORD_RESET = ['@flow:auth-forgot-password-reset', '@module:auth', '@priority:P2'];
export const AUTH_LOGIN_REDIRECT = ['@flow:auth-login-redirect', '@module:auth', '@priority:P2'];
export const AUTH_SIGN_UP_SUCCESS = ['@flow:auth-sign-up-success', '@module:auth', '@priority:P2'];
export const AUTH_PROTECTED_REDIRECT = ['@flow:auth-protected-redirect', '@module:auth', '@priority:P1'];
export const AUTH_ROLE_REDIRECT = ['@flow:auth-role-redirect', '@module:auth', '@priority:P2'];
export const AUTH_SIGN_OUT = ['@flow:auth-sign-out', '@module:auth', '@priority:P2'];
export const AUTH_SESSION_PERSISTENCE = ['@flow:auth-session-persistence', '@module:auth', '@priority:P2'];
export const AUTH_GOOGLE_LOGIN = ['@flow:auth-google-login', '@module:auth', '@priority:P2'];

// ── Animal ──
export const ANIMAL_BROWSE = ['@flow:animal-browse', '@module:animal', '@priority:P1'];
export const ANIMAL_FILTER = ['@flow:animal-filter', '@module:animal', '@priority:P2'];
export const ANIMAL_DETAIL = ['@flow:animal-detail', '@module:animal', '@priority:P1'];
export const ANIMAL_GALLERY = ['@flow:animal-gallery', '@module:animal', '@priority:P3'];

// ── Shelter (public) ──
export const SHELTER_BROWSE = ['@flow:shelter-browse', '@module:shelter', '@priority:P2'];
export const SHELTER_DETAIL = ['@flow:shelter-detail', '@module:shelter', '@priority:P2'];
export const SHELTER_ONBOARDING = ['@flow:shelter-onboarding', '@module:shelter', '@priority:P1'];
export const SHELTER_APPLICATION_SUBMIT = ['@flow:shelter-application-submit', '@module:shelter-application', '@priority:P1'];
export const SHELTER_APPLICATION_STATUS = ['@flow:shelter-application-status', '@module:shelter-application', '@priority:P2'];
export const SHELTER_APPLICATION_REVIEW = ['@flow:shelter-application-review', '@module:shelter-application', '@priority:P1'];

// ── Adoption ──
export const ADOPTION_SUBMIT = ['@flow:adoption-submit', '@module:adoption', '@priority:P1'];
export const ADOPTION_TRACK = ['@flow:adoption-track', '@module:adoption', '@priority:P2'];
export const ADOPTION_MANAGE = ['@flow:adoption-manage', '@module:adoption', '@priority:P1'];

// ── Campaign ──
export const CAMPAIGN_BROWSE = ['@flow:campaign-browse', '@module:campaign', '@priority:P2'];
export const CAMPAIGN_DETAIL = ['@flow:campaign-detail', '@module:campaign', '@priority:P2'];

// ── Donation ──
export const DONATION_CHECKOUT = ['@flow:donation-checkout', '@module:donation', '@priority:P1'];
export const DONATION_HISTORY = ['@flow:donation-history', '@module:donation', '@priority:P2'];
export const PAYMENT_CONFIRMATION = ['@flow:payment-confirmation', '@module:donation', '@priority:P2'];

// ── Sponsorship ──
export const SPONSORSHIP_CHECKOUT = ['@flow:sponsorship-checkout', '@module:sponsorship', '@priority:P1'];
export const SPONSORSHIP_HISTORY = ['@flow:sponsorship-history', '@module:sponsorship', '@priority:P2'];

// ── Favorite ──
export const FAVORITE_TOGGLE = ['@flow:favorite-toggle', '@module:favorite', '@priority:P2'];
export const FAVORITE_LIST = ['@flow:favorite-list', '@module:favorite', '@priority:P2'];

// ── Adopter Intent ──
export const ADOPTER_INTENT_CREATE = ['@flow:adopter-intent-create', '@module:adopter-intent', '@priority:P3'];
export const ADOPTER_INTENT_BROWSE = ['@flow:adopter-intent-browse', '@module:adopter-intent', '@priority:P3'];

// ── Adopter Profile ──
export const ADOPTER_PROFILE = ['@flow:adopter-profile', '@module:adopter', '@priority:P2'];
export const SHELTER_ADMIN_PROFILE = ['@flow:shelter-admin-profile', '@module:shelter-panel', '@priority:P2'];
export const ADMIN_PROFILE = ['@flow:admin-profile', '@module:admin', '@priority:P2'];

// ── Public ──
export const PUBLIC_FAQ = ['@flow:public-faq', '@module:public', '@priority:P4'];
export const PUBLIC_CONTACT = ['@flow:public-contact', '@module:public', '@priority:P4'];

// ── Shelter Panel ──
export const SHELTER_PANEL_DASHBOARD = ['@flow:shelter-panel-dashboard', '@module:shelter-panel', '@priority:P1'];
export const SHELTER_PANEL_ANIMALS = ['@flow:shelter-panel-animals', '@module:shelter-panel', '@priority:P1'];
export const SHELTER_PANEL_CAMPAIGNS = ['@flow:shelter-panel-campaigns', '@module:shelter-panel', '@priority:P2'];
export const SHELTER_PANEL_DONATIONS = ['@flow:shelter-panel-donations', '@module:shelter-panel', '@priority:P2'];
export const SHELTER_PANEL_SETTINGS = ['@flow:shelter-panel-settings', '@module:shelter-panel', '@priority:P2'];

// ── Admin ──
export const ADMIN_DASHBOARD = ['@flow:admin-dashboard', '@module:admin', '@priority:P1'];
export const ADMIN_APPROVE_SHELTERS = ['@flow:admin-approve-shelters', '@module:admin', '@priority:P1'];
export const ADMIN_MODERATION = ['@flow:admin-moderation', '@module:admin', '@priority:P2'];
export const ADMIN_METRICS = ['@flow:admin-metrics', '@module:admin', '@priority:P2'];
export const ADMIN_PAYMENTS = ['@flow:admin-payments', '@module:admin', '@priority:P2'];

// ── Blog ──
export const BLOG_BROWSE = ['@flow:blog-browse', '@module:blog', '@priority:P2'];
export const BLOG_DETAIL = ['@flow:blog-detail', '@module:blog', '@priority:P2'];
export const BLOG_ADMIN_LIST = ['@flow:blog-admin-list', '@module:blog-admin', '@priority:P2'];
export const BLOG_ADMIN_CREATE = ['@flow:blog-admin-create', '@module:blog-admin', '@priority:P2'];
export const BLOG_ADMIN_EDIT = ['@flow:blog-admin-edit', '@module:blog-admin', '@priority:P2'];
export const BLOG_ADMIN_CALENDAR = ['@flow:blog-admin-calendar', '@module:blog-admin', '@priority:P3'];

// ── Navigation ──
export const NAVIGATION_HEADER = ['@flow:navigation-header', '@module:navigation', '@priority:P2'];
export const NAVIGATION_FOOTER = ['@flow:navigation-footer', '@module:navigation', '@priority:P4'];
export const NAVIGATION_BETWEEN_PAGES = ['@flow:navigation-between-pages', '@module:navigation', '@priority:P2'];
export const NOTIFICATION_BELL = ['@flow:notification-bell', '@module:navigation', '@priority:P2'];
export const LOCALE_SWITCH = ['@flow:locale-switch', '@module:navigation', '@priority:P2'];

// ── Shelter Panel (additional) ──
export const SHELTER_PANEL_APPLICATIONS = ['@flow:shelter-panel-applications', '@module:shelter-panel', '@priority:P1'];
export const SHELTER_PANEL_UPDATES = ['@flow:shelter-panel-updates', '@module:shelter-panel', '@priority:P2'];
export const SHELTER_PANEL_UPDATE_CREATE = ['@flow:shelter-panel-update-create', '@module:shelter-panel', '@priority:P2'];

// ── Adoption (additional) ──
export const ADOPTION_FORM_WIZARD = ['@flow:adoption-form-wizard', '@module:adoption', '@priority:P1'];
export const MY_APPLICATIONS_LIST = ['@flow:my-applications-list', '@module:adoption', '@priority:P2'];

// ── Donation (additional) ──
export const DONATION_CHECKOUT_SUBMIT = ['@flow:donation-checkout-submit', '@module:donation', '@priority:P1'];

// ── Sponsorship (additional) ──
export const SPONSORSHIP_CHECKOUT_SUBMIT = ['@flow:sponsorship-checkout-submit', '@module:sponsorship', '@priority:P1'];

// ── Adopter (additional) ──
export const NOTIFICATION_PREFERENCES = ['@flow:notification-preferences', '@module:adopter', '@priority:P2'];

// ── Shelter (additional) ──
export const SHELTER_DETAIL_VIEW_ANIMALS = ['@flow:shelter-detail-view-animals', '@module:shelter', '@priority:P2'];
export const SHELTER_DETAIL_GALLERY = ['@flow:shelter-detail-gallery', '@module:shelter', '@priority:P3'];
export const SHELTER_DETAIL_VIDEO = ['@flow:shelter-detail-video', '@module:shelter', '@priority:P3'];

// ── Campaign (additional) ──
export const CAMPAIGN_TAB_TOGGLE = ['@flow:campaign-tab-toggle', '@module:campaign', '@priority:P3'];
export const CAMPAIGN_DONATE_CTA = ['@flow:campaign-donate-cta', '@module:campaign', '@priority:P2'];

// ── Home (additional) ──
export const HOME_FEATURED_ANIMALS_CAROUSEL = ['@flow:home-featured-animals-carousel', '@module:home', '@priority:P3'];
export const HOME_ACTIVE_CAMPAIGNS_CAROUSEL = ['@flow:home-active-campaigns-carousel', '@module:home', '@priority:P3'];

// ── Public (additional) ──
export const PUBLIC_ABOUT = ['@flow:public-about', '@module:public', '@priority:P4'];
export const PUBLIC_TERMS = ['@flow:public-terms', '@module:public', '@priority:P4'];
export const PUBLIC_WORK_WITH_US = ['@flow:public-work-with-us', '@module:public', '@priority:P4'];
export const PUBLIC_STRATEGIC_ALLIES = ['@flow:public-strategic-allies', '@module:public', '@priority:P4'];

// ── Veterinarian ──
export const VET_FOLLOW_UPS_LIST = ['@flow:vet-follow-ups-list', '@module:veterinarian', '@priority:P2'];
export const VET_FOLLOW_UP_DETAIL = ['@flow:vet-follow-up-detail', '@module:veterinarian', '@priority:P2'];

// ── Web Manager ──
export const WEB_MANAGER_SHELTERS = ['@flow:web-manager-shelters', '@module:web-manager', '@priority:P2'];
export const WEB_MANAGER_SHELTER_DETAIL = ['@flow:web-manager-shelter-detail', '@module:web-manager', '@priority:P2'];
export const WEB_MANAGER_APPLICATIONS = ['@flow:web-manager-applications', '@module:web-manager', '@priority:P2'];

// ── Adoption (application history) ──
export const ADOPTION_APPLICATION_HISTORY = ['@flow:adoption-application-history', '@module:adoption', '@priority:P3'];

// ── Adoption (interview follow-up: WhatsApp + event timeline + cron reminder) ──
export const ADOPTION_DETAIL_ADOPTER = ['@flow:adoption-detail-adopter', '@module:adoption', '@priority:P2'];
export const ADOPTION_WHATSAPP_SHELTER = ['@flow:adoption-whatsapp-shelter', '@module:adoption', '@priority:P2'];
export const ADOPTION_WHATSAPP_APPLICANT = ['@flow:adoption-whatsapp-applicant', '@module:adoption', '@priority:P2'];
export const ADOPTION_EVENT_CREATE_SHELTER = ['@flow:adoption-event-create-shelter', '@module:adoption', '@priority:P1'];
export const ADOPTION_EVENT_CREATE_WEB_MANAGER = ['@flow:adoption-event-create-web-manager', '@module:adoption', '@priority:P1'];
export const ADOPTION_DETAIL_WEB_MANAGER = ['@flow:adoption-detail-web-manager', '@module:adoption', '@priority:P2'];
export const ADOPTION_FOLLOWUP_REMINDER = ['@flow:adoption-followup-reminder', '@module:adoption', '@priority:P3'];

// ── Volunteer ──
export const VOLUNTEER_APPLY = ['@flow:volunteer-apply', '@module:volunteer', '@priority:P2'];

// ── Adopter (profile edit) ──
export const PROFILE_EDIT = ['@flow:profile-edit', '@module:adopter', '@priority:P2'];

// ── Favorite (compare) ──
export const FAVORITES_COMPARE = ['@flow:favorites-compare', '@module:favorite', '@priority:P3'];

// ── Favorite (note edit) ──
export const FAVORITE_NOTE_EDIT = ['@flow:favorite-note-edit', '@module:favorite', '@priority:P3'];

// ── Blog Admin (delete & duplicate) ──
export const BLOG_ADMIN_DELETE = ['@flow:blog-admin-delete', '@module:blog-admin', '@priority:P2'];
export const BLOG_ADMIN_DUPLICATE = ['@flow:blog-admin-duplicate', '@module:blog-admin', '@priority:P3'];

// ── Shelter Panel (campaign flows) ──
export const SHELTER_PANEL_CAMPAIGN_DETAIL = ['@flow:shelter-panel-campaign-detail', '@module:shelter-panel', '@priority:P2'];
export const SHELTER_PANEL_CAMPAIGN_CREATE = ['@flow:shelter-panel-campaign-create', '@module:shelter-panel', '@priority:P2'];

// ── Web Manager (campaign flows) ──
export const WEB_MANAGER_CAMPAIGNS = ['@flow:web-manager-campaigns', '@module:web-manager', '@priority:P2'];
export const WEB_MANAGER_CAMPAIGN_DETAIL = ['@flow:web-manager-campaign-detail', '@module:web-manager', '@priority:P2'];
export const WEB_MANAGER_CAMPAIGN_CREATE = ['@flow:web-manager-campaign-create', '@module:web-manager', '@priority:P2'];

// ── Manual ──
export const MANUAL_BROWSE = ['@flow:manual-browse', '@module:manual', '@priority:P2'];
export const MANUAL_SEARCH = ['@flow:manual-search', '@module:manual', '@priority:P2'];
export const MANUAL_ROLE_FILTER = ['@flow:manual-role-filter', '@module:manual', '@priority:P3'];

// ── Profile (additional roles) ──
export const WEB_MANAGER_PROFILE = ['@flow:web-manager-profile', '@module:web-manager', '@priority:P3'];
export const VETERINARIAN_PROFILE = ['@flow:veterinarian-profile', '@module:veterinarian', '@priority:P3'];

// ── Platform Support ──
export const PLATFORM_SUPPORT_INFO = ['@flow:platform-support-info', '@module:donation', '@priority:P2'];
export const DONATION_PLATFORM_CHECKOUT = ['@flow:donation-platform-checkout', '@module:donation', '@priority:P1'];

// ── Shelter Panel (animal CRUD) ──
export const SHELTER_PANEL_ANIMAL_CREATE = ['@flow:shelter-panel-animal-create', '@module:shelter-panel', '@priority:P1'];
export const SHELTER_PANEL_ANIMAL_EDIT = ['@flow:shelter-panel-animal-edit', '@module:shelter-panel', '@priority:P3'];
export const SHELTER_PANEL_ANIMAL_ARCHIVE = ['@flow:shelter-panel-animal-archive', '@module:shelter-panel', '@priority:P3'];

// ── Auth (password change) ──
export const AUTH_PASSWORD_CHANGE = ['@flow:auth-password-change', '@module:auth', '@priority:P2'];

// ── Adopter Intent (shelter invites) ──
export const SHELTER_INVITE_SEND = ['@flow:shelter-invite-send', '@module:adopter-intent', '@priority:P3'];
export const SHELTER_INVITE_RESPOND = ['@flow:shelter-invite-respond', '@module:adopter-intent', '@priority:P3'];

// ── Campaign approval messaging (shelter + web-manager) ──
export const SHELTER_PANEL_CAMPAIGN_MESSAGES = ['@flow:shelter-panel-campaign-messages', '@module:shelter-panel', '@priority:P2'];
export const WEB_MANAGER_CAMPAIGN_MESSAGES = ['@flow:web-manager-campaign-messages', '@module:web-manager', '@priority:P2'];

// ── Notification (mark all read) ──
export const NOTIFICATION_MARK_ALL_READ = ['@flow:notification-mark-all-read', '@module:navigation', '@priority:P3'];

// ── Campaign (completed updates feed) ──
export const CAMPAIGN_UPDATES_FEED = ['@flow:campaign-updates-feed', '@module:campaign', '@priority:P3'];

// ── Profile (recent activity timeline) ──
export const PROFILE_ACTIVITY_FEED = ['@flow:profile-activity-feed', '@module:adopter', '@priority:P3'];
