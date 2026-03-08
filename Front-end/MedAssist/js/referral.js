/* ═══════════════════════════════════════
   js/referral.js — Referral Decision Logic
═══════════════════════════════════════ */

const ReferralLogic = (() => {
  const ADVICE = {
    htn:  { color: 'var(--red)',    label: 'Uncontrolled Hypertension (>160/100)', rec: 'Refer to CHC/GH if 2 drugs fail. Check renal function before referral.' },
    anc:  { color: 'var(--rose)',   label: 'High-risk Pregnancy',                  rec: 'Immediate referral to FRU/District Hospital with JSSK records.' },
    tb:   { color: 'var(--amber)',  label: 'Suspected Tuberculosis',               rec: 'Refer to DMHP for sputum testing. Initiate contact tracing for household members.' },
    dm:   { color: 'var(--blue)',   label: 'Diabetic Complications',               rec: 'Refer to specialist if HbA1c >9% or foot ulcers are present.' },
    peds: { color: 'var(--purple)', label: 'Severe Acute Malnutrition',            rec: 'Refer to NRC immediately. MUAC <11.5cm is a medical emergency.' },
  };

  function updateAdvice(value) {
    const box     = document.getElementById('referral-advice');
    const content = document.getElementById('advice-content');
    if (!box || !content) return;

    if (value && ADVICE[value]) {
      const a = ADVICE[value];
      box.style.display      = 'block';
      box.style.borderColor  = a.color;
      content.innerHTML      = `
        <div style="font-weight:700;color:${a.color};margin-bottom:6px">⚠️ ${a.label}</div>
        <p style="font-size:13px;color:var(--sub);line-height:1.6">${a.rec}</p>`;
    } else {
      box.style.display = 'none';
    }
  }

  return { updateAdvice };
})();
