/* ═══════════════════════════════════════
   js/emergency.js — Emergency Alert Logic
═══════════════════════════════════════ */

const EmergencyLogic = (() => {
  function toggleAlertType(el) {
    document.querySelectorAll('.alert-type').forEach(a => a.classList.remove('sel'));
    el.classList.add('sel');
  }

  function showSent() {
    const box = document.getElementById('emergency-sent');
    if (box) {
      box.className = 'result-box safe show';
      box.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return { toggleAlertType, showSent };
})();
