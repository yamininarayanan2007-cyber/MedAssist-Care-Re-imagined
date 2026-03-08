/* ═══════════════════════════════════════
   js/mental.js — PHQ-9 Screening Logic
═══════════════════════════════════════ */

const MentalLogic = (() => {

  const QUESTIONS = [
    'Over the last 2 weeks — Little interest or pleasure in doing things?',
    'Feeling down, depressed, or hopeless?',
    'Trouble falling or staying asleep, or sleeping too much?',
    'Feeling tired or having little energy?',
    'Poor appetite or overeating?',
    'Feeling bad about yourself — that you are a failure or have let people down?',
    'Trouble concentrating on things like reading or watching TV?',
    'Moving or speaking so slowly that others could notice? Or being fidgety / restless?',
    'Thoughts that you would be better off dead, or of hurting yourself in some way?'
  ];

  let currentQ   = 0;
  let totalScore = 0;

  const RESULTS = [
    { max:4,  bg:'var(--green)',  label:'Minimal Depression',  desc:'No significant depressive symptoms. Encourage healthy lifestyle and follow up in 3 months.' },
    { max:9,  bg:'var(--sky)',    label:'Mild Depression',     desc:'Mild symptoms present. Provide psychoeducation, watchful waiting, and repeat screening in 2 weeks.' },
    { max:14, bg:'var(--amber)',  label:'Moderate Depression', desc:'Moderate symptoms. Refer to DMHP for counseling support. Schedule follow-up within 1 week.' },
    { max:27, bg:'var(--red)',    label:'Severe Depression',   desc:'Severe symptoms detected. Urgent psychiatric referral required. Check for immediate safety concerns.' },
  ];

  /* ── Render current question ── */
  function render() {
    const qEl = document.getElementById('phq-question');
    const nEl = document.getElementById('phq-q-num');
    const pEl = document.getElementById('phq-prog');
    if (!qEl) return;
    qEl.textContent = QUESTIONS[currentQ];
    nEl.textContent = `Question ${currentQ + 1} of ${QUESTIONS.length}`;
    pEl.style.width = `${((currentQ + 1) / QUESTIONS.length) * 100}%`;
    document.querySelectorAll('.phq-opt').forEach(b => b.classList.remove('sel'));
  }

  /* ── Answer a question ── */
  function answer(score, btn) {
    document.querySelectorAll('.phq-opt').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    totalScore += score;
    currentQ++;
    setTimeout(() => {
      if (currentQ < QUESTIONS.length) {
        render();
      } else {
        showResult();
      }
    }, 300);
  }

  /* ── Show local PHQ-9 result ── */
  function showResult() {
    document.getElementById('phq-card').style.display = 'none';
    const result = document.getElementById('phq-result');
    result.className = 'score-result show';

    const r = RESULTS.find(x => totalScore <= x.max) || RESULTS[RESULTS.length - 1];
    document.getElementById('score-circle').style.background = r.bg;
    document.getElementById('score-circle').textContent      = totalScore;
    document.getElementById('score-label').textContent       = `${r.label} (${totalScore}/27)`;
    document.getElementById('score-desc').textContent        = r.desc;

    // Also send to backend API
    sendToAPI(`PHQ-9 Score: ${totalScore}. ${r.label}. ${r.desc}`);
  }

  /* ── Send to backend API ── */
  async function sendToAPI(message) {
    try {
      const response = await fetch('http://127.0.0.1:8000/chat/mental-health', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:              message,
          conversation_history: [],
          language:             getLanguage()
        })
      });
      const data = await response.json();
      return data.response;
    } catch (err) {
      console.log('Backend not connected:', err);
    }
  }

  /* ── Reset ── */
  function reset() {
    currentQ   = 0;
    totalScore = 0;
    document.getElementById('phq-card').style.display = 'block';
    document.getElementById('phq-result').className   = 'score-result';
    render();
  }

  return { render, answer, reset };

})();