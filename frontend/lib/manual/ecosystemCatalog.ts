import type { EcosystemIcon, EcosystemNode, EcosystemRelation, EcosystemView } from './ecosystemTypes';

const view = (id: string, entry: EcosystemView, processIds: string[]): EcosystemNode => ({
  id, kind: 'view', icon: 'book', children: [], relations: [], view: entry, processIds,
});
const branch = (id: string, kind: 'root' | 'space' | 'module', icon: EcosystemIcon, children: EcosystemNode[], relations: EcosystemRelation[]): EcosystemNode => ({
  id, kind, icon, children, relations,
});

/** Screen inventory, intentionally independent from role-filtered manual instructions.
 * Copy lives in manual.ecosystem.nodes in both message dictionaries.
 * Add every new page here; ecosystemCatalog.test.ts checks the actual route tree.
 */
export const ECOSYSTEM: EcosystemNode = branch("tuhuella", 'root', 'network', [
  branch("discover", 'space', 'globe', [
    branch("discover-welcome", 'module', 'home', [
      view("home", {"route":"/","destination":"/","access":"public"}, ["public-home"]),
      view("about", {"route":"/about","destination":"/about","access":"public"}, ["public-about"])
    ], []),
    branch("discover-animals", 'module', 'paw', [
      view("animals", {"route":"/animals","destination":"/animals","access":"public"}, ["public-browse-animals"]),
      view("animal-detail", {"route":"/animals/[animalId]","destination":"/animals","access":"public","notice":"selection"}, ["public-animal-detail"])
    ], []),
    branch("discover-shelters", 'module', 'home', [
      view("shelters", {"route":"/shelters","destination":"/shelters","access":"public"}, ["public-browse-shelters"]),
      view("shelter-detail", {"route":"/shelters/[shelterId]","destination":"/shelters","access":"public","notice":"selection"}, [])
    ], []),
    branch("discover-campaigns", 'module', 'heart', [
      view("campaigns", {"route":"/campaigns","destination":"/campaigns","access":"public"}, ["public-campaigns"]),
      view("campaign-detail", {"route":"/campaigns/[campaignId]","destination":"/campaigns","access":"public","notice":"selection"}, [])
    ], []),
    branch("discover-stories", 'module', 'book', [
      view("blog", {"route":"/blog","destination":"/blog","access":"public"}, ["public-blog"]),
      view("blog-detail", {"route":"/blog/[slug]","destination":"/blog","access":"public","notice":"selection"}, [])
    ], []),
    branch("discover-community", 'module', 'people', [
      view("volunteer", {"route":"/work-with-us","destination":"/work-with-us","access":"public"}, ["public-work-with-us"]),
      view("volunteer-apply", {"route":"/work-with-us/apply/[positionId]","destination":"/work-with-us","access":"authenticated","notice":"selection"}, ["public-volunteer-apply"]),
      view("allies", {"route":"/strategic-allies","destination":"/strategic-allies","access":"public"}, ["public-strategic-allies"]),
      view("contact", {"route":"/contactanos","destination":"/contactanos","access":"public"}, ["public-contact"])
    ], []),
    branch("discover-information", 'module', 'book', [
      view("faq", {"route":"/faq","destination":"/faq","access":"public"}, ["public-faq"]),
      view("terms", {"route":"/terms","destination":"/terms","access":"public"}, ["public-terms"]),
      view("looking", {"route":"/looking-to-adopt","destination":"/looking-to-adopt","access":"public"}, ["public-looking-to-adopt"])
    ], [])
  ], [{"from":"discover-shelters","to":"discover-animals","label":"care"},{"from":"discover-animals","to":"discover-information","label":"prepare"},{"from":"discover-campaigns","to":"discover-community","label":"participate"}]),
  branch("account", 'space', 'user', [
    branch("account-access", 'module', 'user', [
      view("sign-up", {"route":"/sign-up","destination":"/sign-up","access":"public"}, ["auth-sign-up"]),
      view("sign-in", {"route":"/sign-in","destination":"/sign-in","access":"public"}, ["auth-sign-in"]),
      view("forgot-password", {"route":"/forgot-password","destination":"/forgot-password","access":"public"}, ["auth-forgot-password"])
    ], []),
    branch("account-profile", 'module', 'user', [
      view("profile", {"route":"/my-profile","destination":"/my-profile","access":"authenticated"}, []),
      view("profile-edit", {"route":"/my-profile/edit","destination":"/my-profile/edit","access":"authenticated"}, ["adopter-edit-profile"])
    ], []),
    branch("account-adoption", 'module', 'paw', [
      view("adopt", {"route":"/adopt/[animalId]","destination":"/animals","access":"authenticated","notice":"selection"}, ["adopter-apply"]),
      view("applications", {"route":"/my-applications","destination":"/my-applications","access":"authenticated"}, ["adopter-track-applications"]),
      view("application-detail", {"route":"/my-applications/[id]","destination":"/my-applications","access":"authenticated","notice":"selection"}, []),
      view("application-history", {"route":"/my-applications/[id]/history","destination":"/my-applications","access":"authenticated","notice":"selection"}, [])
    ], []),
    branch("account-favorites", 'module', 'heart', [
      view("favorites", {"route":"/favorites","destination":"/favorites","access":"authenticated"}, ["adopter-favorites"])
    ], []),
    branch("account-intent", 'module', 'paw', [
      view("intent", {"route":"/my-intent","destination":"/my-intent","access":"authenticated"}, ["adopter-intent"])
    ], []),
    branch("account-shelter", 'module', 'home', [
      view("shelter-application", {"route":"/shelter-application","destination":"/shelter-application","access":"shelter_applicant"}, ["shelter-application"]),
      view("shelter-onboarding", {"route":"/shelter/onboarding","destination":"/shelter-application","access":"shelter_applicant","notice":"alias"}, [])
    ], [])
  ], [{"from":"account-profile","to":"account-adoption","label":"prepare"},{"from":"account-favorites","to":"account-adoption","label":"choose"},{"from":"account-intent","to":"account-adoption","label":"match"}]),
  branch("support", 'space', 'heart', [
    branch("support-donations", 'module', 'heart', [
      view("donate", {"route":"/checkout/donation","destination":"/checkout/donation","access":"authenticated","notice":"demo"}, ["adopter-donate"]),
      view("donation-history", {"route":"/my-donations","destination":"/my-donations","access":"authenticated"}, ["adopter-my-donations"])
    ], []),
    branch("support-sponsorship", 'module', 'paw', [
      view("sponsor", {"route":"/checkout/sponsorship","destination":"/animals","access":"authenticated","notice":"demo"}, ["adopter-sponsor"]),
      view("sponsorship-history", {"route":"/my-sponsorships","destination":"/my-sponsorships","access":"authenticated"}, ["adopter-my-sponsorships"])
    ], []),
    branch("support-platform", 'module', 'globe', [
      view("platform-support", {"route":"/apoya-la-plataforma","destination":"/apoya-la-plataforma","access":"public"}, []),
      view("platform-checkout", {"route":"/checkout/platform","destination":"/apoya-la-plataforma","access":"authenticated","notice":"demo"}, [])
    ], []),
    branch("support-confirmation", 'module', 'book', [
      view("payment-confirmation", {"route":"/checkout/confirmation","destination":"/checkout/donation","access":"authenticated","notice":"demo"}, [])
    ], [])
  ], [{"from":"support-donations","to":"support-confirmation","label":"result"},{"from":"support-sponsorship","to":"support-confirmation","label":"result"},{"from":"support-platform","to":"support-confirmation","label":"result"}]),
  branch("shelter", 'space', 'home', [
    branch("shelter-overview", 'module', 'chart', [
      view("shelter-dashboard", {"route":"/shelter/dashboard","destination":"/shelter/dashboard","access":"shelter_admin"}, ["shelter-dashboard"])
    ], []),
    branch("shelter-care", 'module', 'paw', [
      view("shelter-animals", {"route":"/shelter/animals","destination":"/shelter/animals","access":"shelter_admin"}, ["shelter-manage-animals"]),
      view("shelter-applications", {"route":"/shelter/applications","destination":"/shelter/applications","access":"shelter_admin"}, ["shelter-manage-applications"])
    ], []),
    branch("shelter-fundraising", 'module', 'heart', [
      view("shelter-campaigns", {"route":"/shelter/campaigns","destination":"/shelter/campaigns","access":"shelter_admin"}, []),
      view("shelter-campaign-new", {"route":"/shelter/campaigns/nueva","destination":"/shelter/campaigns/nueva","access":"shelter_admin"}, ["shelter-create-campaign"]),
      view("shelter-campaign-detail", {"route":"/shelter/campaigns/[id]","destination":"/shelter/campaigns","access":"shelter_admin","notice":"selection"}, ["shelter-edit-campaign"]),
      view("shelter-donations", {"route":"/shelter/donations","destination":"/shelter/donations","access":"shelter_admin"}, ["shelter-donations-dashboard"])
    ], []),
    branch("shelter-communication", 'module', 'mail', [
      view("shelter-updates", {"route":"/shelter/updates","destination":"/shelter/updates","access":"shelter_admin"}, ["shelter-updates"]),
      view("shelter-update-new", {"route":"/shelter/updates/create","destination":"/shelter/updates/create","access":"shelter_admin"}, [])
    ], []),
    branch("shelter-configuration", 'module', 'home', [
      view("shelter-settings", {"route":"/shelter/settings","destination":"/shelter/settings","access":"shelter_admin"}, ["shelter-settings"])
    ], [])
  ], [{"from":"shelter-care","to":"shelter-overview","label":"inform"},{"from":"shelter-fundraising","to":"shelter-care","label":"sustain"},{"from":"shelter-fundraising","to":"shelter-communication","label":"share"}]),
  branch("veterinary", 'space', 'medical', [
    branch("veterinary-followups", 'module', 'medical', [
      view("vet-followups", {"route":"/veterinarian/follow-ups","destination":"/veterinarian/follow-ups","access":"veterinarian"}, ["vet-followups"])
    ], []),
    branch("veterinary-history", 'module', 'book', [
      view("vet-detail", {"route":"/veterinarian/follow-ups/[id]","destination":"/veterinarian/follow-ups","access":"veterinarian","notice":"selection"}, ["vet-clinical-entry","vet-mark-complete"])
    ], [])
  ], [{"from":"veterinary-followups","to":"veterinary-history","label":"care"}]),
  branch("coordination", 'space', 'people', [
    branch("coordination-applications", 'module', 'paw', [
      view("manager-applications", {"route":"/web-manager/applications","destination":"/web-manager/applications","access":"web_manager"}, ["wm-applications-board"]),
      view("manager-application", {"route":"/web-manager/applications/[id]","destination":"/web-manager/applications","access":"web_manager","notice":"selection"}, [])
    ], []),
    branch("coordination-shelters", 'module', 'home', [
      view("manager-shelters", {"route":"/web-manager/shelters","destination":"/web-manager/shelters","access":"web_manager"}, ["wm-shelters-list"]),
      view("manager-shelter", {"route":"/web-manager/shelters/[id]","destination":"/web-manager/shelters","access":"web_manager","notice":"selection"}, ["wm-shelter-detail"])
    ], []),
    branch("coordination-campaigns", 'module', 'heart', [
      view("manager-campaigns", {"route":"/web-manager/campaigns","destination":"/web-manager/campaigns","access":"web_manager"}, ["wm-campaigns"]),
      view("manager-campaign", {"route":"/web-manager/campaigns/[id]","destination":"/web-manager/campaigns","access":"web_manager","notice":"selection"}, ["wm-campaign-detail"]),
      view("manager-campaign-new", {"route":"/web-manager/campaigns/new","destination":"/web-manager/campaigns/new","access":"web_manager"}, [])
    ], [])
  ], [{"from":"coordination-shelters","to":"coordination-applications","label":"coordinate"},{"from":"coordination-shelters","to":"coordination-campaigns","label":"coordinate"}]),
  branch("administration", 'space', 'shield', [
    branch("administration-overview", 'module', 'chart', [
      view("admin-dashboard", {"route":"/admin/dashboard","destination":"/admin/dashboard","access":"admin"}, ["admin-dashboard"]),
      view("admin-metrics", {"route":"/admin/metrics","destination":"/admin/metrics","access":"admin"}, ["admin-metrics"])
    ], []),
    branch("administration-review", 'module', 'shield', [
      view("admin-shelters", {"route":"/admin/shelters/approve","destination":"/admin/shelters/approve","access":"admin"}, ["admin-approve-shelters"]),
      view("admin-moderation", {"route":"/admin/moderation","destination":"/admin/moderation","access":"admin"}, ["admin-moderation"])
    ], []),
    branch("administration-payments", 'module', 'heart', [
      view("admin-payments", {"route":"/admin/payments","destination":"/admin/payments","access":"admin","notice":"demo"}, ["admin-payments-audit"])
    ], []),
    branch("administration-blog", 'module', 'book', [
      view("admin-blog", {"route":"/admin/blog","destination":"/admin/blog","access":"admin"}, ["admin-blog-crud"]),
      view("admin-blog-new", {"route":"/admin/blog/crear","destination":"/admin/blog/crear","access":"admin"}, []),
      view("admin-blog-edit", {"route":"/admin/blog/[id]/editar","destination":"/admin/blog","access":"admin","notice":"selection"}, []),
      view("admin-blog-calendar", {"route":"/admin/blog/calendario","destination":"/admin/blog/calendario","access":"admin"}, [])
    ], []),
    branch("administration-access", 'module', 'shield', [
      view("admin-login", {"route":"/admin-login","destination":null,"access":"admin","notice":"handoff"}, ["admin-login"])
    ], []),
    branch("help", 'module', 'bell', [
      view("notifications", {"route":"/my-profile/notifications","destination":"/my-profile/notifications","access":"authenticated"}, ["adopter-notifications-inbox","adopter-notification-preferences"]),
      view("manual", {"route":"/manual","destination":"/manual","access":"authenticated"}, []),
      view("ecosystem", {"route":"/manual/ecosystem","destination":"/manual/ecosystem","access":"authenticated"}, [])
    ], [])
  ], [{"from":"administration-review","to":"administration-overview","label":"inform"},{"from":"administration-payments","to":"administration-overview","label":"inform"},{"from":"administration-blog","to":"help","label":"share"}])
], [{"from":"discover","to":"account","label":"choose"},{"from":"account","to":"shelter","label":"apply"},{"from":"shelter","to":"veterinary","label":"followup"},{"from":"support","to":"shelter","label":"sustain"},{"from":"coordination","to":"shelter","label":"coordinate"},{"from":"administration","to":"coordination","label":"support"}]);
