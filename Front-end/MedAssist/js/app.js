/* ═══════════════════════════════════════
   js/app.js — App Initialisation
═══════════════════════════════════════ */

/**
 * Render all page templates into #app and boot the router.
 * Each page module exposes a getHTML() function and (optionally) init().
 */
// Global language store
let selectedLanguage = 'English';
function setLanguage(lang) { selectedLanguage = lang; }
function getLanguage() { return selectedLanguage; }

const PAGE_MODULES = [
  { id: 'login',     module: LoginPage },
  { id: 'dashboard', module: DashboardPage },
  { id: 'triage',    module: TriagePage },
  { id: 'patients',  module: PatientsPage },
  { id: 'followup',  module: FollowupPage },
  { id: 'language',  module: LanguagePage },
  { id: 'emergency', module: EmergencyPage },
  { id: 'referral',  module: ReferralPage },
  { id: 'awareness', module: AwarenessPage },
  { id: 'mental',    module: MentalPage },
  { id: 'profile',   module: ProfilePage },
];

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  // Inject all page HTML
  PAGE_MODULES.forEach(({ id, module }) => {
    const wrapper = document.createElement('div');
    wrapper.id = 'page-' + id;
    wrapper.className = 'page';
    wrapper.innerHTML = module.getHTML();
    app.appendChild(wrapper);
  });

  // Run per-page inits (if defined)
  PAGE_MODULES.forEach(({ module }) => {
    if (typeof module.init === 'function') module.init();
  });

  // Boot to login
  goTo('login');
});
