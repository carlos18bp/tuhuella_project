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
export const AUTH_SIGN_IN_FORM = ['@flow:auth-sign-in-form', '@module:auth', '@priority:P1'];
export const AUTH_LOGIN_INVALID = ['@flow:auth-login-invalid', '@module:auth', '@priority:P1'];
export const AUTH_SIGN_UP_FORM = ['@flow:auth-sign-up-form', '@module:auth', '@priority:P1'];
export const AUTH_FORGOT_PASSWORD_FORM = ['@flow:auth-forgot-password-form', '@module:auth', '@priority:P2'];
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

// ── Public ──
export const PUBLIC_FAQ = ['@flow:public-faq', '@module:public', '@priority:P4'];

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

// ── Volunteer ──
export const VOLUNTEER_APPLY = ['@flow:volunteer-apply', '@module:volunteer', '@priority:P2'];

// ── Adopter (profile edit) ──
export const PROFILE_EDIT = ['@flow:profile-edit', '@module:adopter', '@priority:P2'];

// ── Favorite (compare) ──
export const FAVORITES_COMPARE = ['@flow:favorites-compare', '@module:favorite', '@priority:P3'];
