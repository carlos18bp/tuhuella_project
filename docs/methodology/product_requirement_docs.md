# Tuhuella — Product Requirements Document (PRD)

## Product Vision

Tuhuella is an animal adoption, sponsorship, and donation platform that connects verified shelters with adopters and donors. The platform enables transparent, safe processes for animal welfare.

## Problem Statement

Animal shelters in Colombia and Latin America lack centralized digital tools to:
- Publish animals available for adoption with rich profiles
- Manage adoption applications with structured workflows
- Receive donations and sponsorships with payment tracking
- Communicate updates to adopters and sponsors

## Target Users

| Role | Description |
|------|-------------|
| **Adopter** | End user who browses animals, applies for adoption, sponsors, donates, and manages favorites |
| **Shelter Admin** | Organization manager who registers a shelter, publishes animals, manages applications, runs campaigns |
| **Platform Admin** | System administrator who approves shelters, moderates content, views metrics and payments |
| **Web Manager** | Cross-shelter operator who sees all shelters, all applications, assigns veterinarians to follow-ups, receives stalled-application alerts |
| **Veterinarian** | Clinical staff assigned per follow-up; sees assigned follow-ups, adds clinical history entries, marks follow-ups complete |

## Core Features

### 1. Animal Discovery & Adoption
- Browse animals with filters (species, size, age, gender)
- View animal detail with gallery, medical info, special needs; health section with vaccination/sterilization/deworming status, disease screenings catalog (negative=emerald, positive=red, not_tested=stone), medical notes (bilingual), last vet checkup date
- Submit adoption application with structured form wizard; pets-at-home section: yes/no toggle → per-type checkboxes (cats/dogs/others) each with numeric count
- Track application status (pending → reviewing → approved/rejected)
- Enriched favorites: personal notes, species/size filters, sort, grid/list toggle, compare mode (2–3 animals side-by-side)

### 2. Sponsorship & Donations
- Monthly or one-time sponsorship for specific animals
- Donations to shelters or campaigns
- Campaign progress tracking with goal/raised amounts
- Payment integration (Wompi — placeholder)
- Payment confirmation flow

### 3. Shelter Management
- Shelter onboarding and verification flow
- Animal CRUD (create, update, archive)
- Adoption application review workflow
- Campaign management
- Donation tracking dashboard
- Update posts (linked to campaigns/animals)
- Shelter settings management

### 4. Adopter Intent ("Busco Adoptar")
- Adopters publish their preferences (species, size, age)
- Shelters can discover matching intents and send invites
- Privacy controls (public/private visibility)

### 5. Platform Administration
- Shelter verification approval
- Content moderation
- Payment oversight and audit
- Platform metrics dashboard (summary + detailed)

### 6. Blog System
- Bilingual blog posts (Spanish/English) with JSON structured content
- 10 animal-welfare categories, 2 authors
- Public listing/detail pages with reading progress bar
- Admin CRUD, duplicate, cover upload, calendar view, JSON template
- SEO metadata support

### 7. Content & Notifications
- Shelter update posts (linked to campaigns/animals)
- Notification preferences per user
- Notification bell + log history

### 8. User Profile Dashboard
- Profile card with avatar, bio, housing info, experience level
- Profile completeness indicator with progress bar
- Inline profile editing via modal (personal info, housing, experience, avatar)
- Activity dashboard with stats counters (applications, donations, sponsorships, favorites, intent)
- Favorites preview with circular animal thumbnails
- Shelter invite notification banner
- Activity timeline showing recent actions across all user activities
- "Member since" date display

### 9. Post-Adoption Follow-Up & Clinical History
- `PostAdoptionFollowUp` auto-created when adoption approved (scheduled +30 days)
- Veterinarian workspace: list of assigned follow-ups, detail with clinical history timeline + entry form, mark-complete action
- Clinical history per animal: checkup/vaccination/treatment/observation/incident entries with bilingual body, occurred_at, optional attachment_urls
- Adopter read-only timeline at `/my-applications/[id]/history`
- Web manager: assigns veterinarians from shelter detail page, tab "Seguimientos"
- Notification events: `follow_up_assigned_to_vet`, `follow_up_due_soon`, `follow_up_overdue`, `clinical_entry_added`

### 10. Global Operations (Web Manager)
- Cross-shelter applications board with status, shelter, and date filters
- Paginated shelter list with verification_status filter chips
- Shelter detail with Info + Applications tabs; follow-up tab for vet assignment
- Notification: `adoption_requires_attention` alert to all web_managers on new application submission

### 11. Animal Disease Tracking
- Structured catalog per species: dogs (distemper, parvovirus, ehrlichia, leptospirosis, heartworm); cats (FIV, FeLV, panleukopenia, FIP, calicivirus)
- Tri-state result per screening: positive / negative / not_tested
- Managed via Django admin `AnimalDiseaseScreeningInline` on AnimalAdmin

### 12. Supporting Features
- FAQ page with accordion
- Strategic allies page
- Volunteer positions
- About, Terms, Work With Us pages

## Non-Functional Requirements

- **i18n**: Spanish (default) and English via next-intl
- **Auth**: JWT + Google OAuth
- **Design**: Stone palette with teal/amber/emerald accents
- **Performance**: GSAP scroll animations, Swiper galleries, Framer Motion transitions
- **Mobile**: Fully responsive with mobile menu
- **Security**: CSRF, input validation, no hardcoded secrets
- **Dark mode**: Theme toggle support

## Success Metrics

- Number of verified shelters onboarded
- Number of adoption applications submitted
- Total donations/sponsorships processed
- User retention (returning adopters/donors)

## Out of Scope (Current Phase)

- Wompi payment SDK integration (placeholder only)
- Real-time chat between adopter and shelter
- Mobile native app
- SMS notifications
