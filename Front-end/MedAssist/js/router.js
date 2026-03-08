/* ═══════════════════════════════════════
   js/router.js — SPA Page Router
═══════════════════════════════════════ */

const PAGES = [
  'login', 'dashboard', 'triage', 'patients',
  'followup', 'language', 'emergency', 'referral',
  'awareness', 'mental', 'profile'
];

const NO_NAV_PAGES = ['login'];

const BOTTOM_NAV_MAP = {
  dashboard: 0,
  patients:  1,
  triage:    2,
  emergency: 3,
  profile:   4
};

/**
 * Navigate to a page by id.
 * @param {string} id - page key (e.g. 'dashboard', 'triage')
 */
function goTo(id) {
  // Hide all pages
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.remove('active');
  });

  // Show target page
  const target = document.getElementById('page-' + id);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Show / hide bottom nav
  const bn = document.getElementById('bottom-nav');
  if (bn) {
    bn.style.display = NO_NAV_PAGES.includes(id) ? 'none' : 'block';
  }

  // Update bottom nav active state
  document.querySelectorAll('.bnav-item').forEach(btn => btn.classList.remove('active'));
  const navIdx = BOTTOM_NAV_MAP[id];
  if (navIdx !== undefined) {
    const navBtns = document.querySelectorAll('.bnav-item');
    if (navBtns[navIdx]) navBtns[navIdx].classList.add('active');
  }

  // Update browser history (optional — makes back button work)
  if (history.pushState) {
    history.pushState({ page: id }, '', '#' + id);
  }
}

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
  const page = e.state?.page || 'login';
  goTo(page);
});

// On first load, check URL hash
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash && PAGES.includes(hash)) {
    goTo(hash);
  }
});
