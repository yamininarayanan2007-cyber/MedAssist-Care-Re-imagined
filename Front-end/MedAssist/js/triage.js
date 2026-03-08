/* ═══════════════════════════════════════
   js/triage.js — Chat-based Triage Logic
═══════════════════════════════════════ */

const TriageChat = (() => {

  let conversationHistory = [];
  let isWaiting = false;

  /* ── Init ── */
  function init() {
    conversationHistory = [];
    const badge = document.getElementById('triage-lang-badge');
    if (badge) badge.textContent = '🌐 ' + getLanguage();
  }

  /* ── Handle Enter key ── */
  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  /* ── Add a bubble to chat ── */
  function addBubble(text, type) {
    const messages = document.getElementById('triage-messages');
    if (!messages) return;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${type === 'user' ? 'user-bubble' : 'ai-bubble'}`;
    bubble.innerHTML = text.replace(/\n/g, '<br/>');
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  /* ── Show / hide typing indicator ── */
  function showTyping(show) {
    const el = document.getElementById('triage-typing');
    if (el) el.style.display = show ? 'block' : 'none';
    const messages = document.getElementById('triage-messages');
    if (messages) messages.scrollTop = messages.scrollHeight;
  }

  /* ── Show triage result card ── */
  function showResultCard(responseText) {
    const card    = document.getElementById('triage-result-card');
    const content = document.getElementById('triage-result-content');
    if (!card || !content) return;

    const lower = responseText.toLowerCase();
    let color = 'var(--green)';
    let bg    = 'var(--green-bg)';
    let icon  = '🟢';

    if (lower.includes('urgent') || lower.includes('severe') || lower.includes('emergency')) {
      color = 'var(--red)'; bg = 'var(--red-bg)'; icon = '🔴';
    } else if (lower.includes('moderate') || lower.includes('monitor') || lower.includes('follow')) {
      color = 'var(--amber)'; bg = 'var(--amber-bg)'; icon = '🟡';
    }

    content.innerHTML = `
      <div style="background:${bg};border:2px solid ${color};border-radius:16px;padding:16px;margin-bottom:4px">
        <div style="font-weight:800;font-size:16px;color:${color};margin-bottom:8px">${icon} Assessment Complete</div>
        <p style="font-size:13px;color:var(--text);line-height:1.7">${responseText.replace(/\n/g, '<br/>')}</p>
      </div>`;

    card.style.display = 'flex';
  }

  /* ── Main send function ── */
  async function send() {
    if (isWaiting) return;

    const input = document.getElementById('triage-input');
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    // Clear input
    input.value = '';
    input.style.height = 'auto';

    // Show user bubble
    addBubble(message, 'user');

    // Add to history
    conversationHistory.push({ role: 'user', content: message });

    // Show typing
    isWaiting = true;
    showTyping(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/chat/triage', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:              message,
          conversation_history: conversationHistory,
          language:             getLanguage()
        })
      });

      const data = await response.json();
      showTyping(false);

      const aiText = data.response || 'Sorry, I could not process that. Please try again.';

      // Add AI response to history
      conversationHistory.push({ role: 'assistant', content: aiText });

      // Show AI bubble
      addBubble(aiText, 'ai');

      // If triage is complete — show result card
      if (data.triage_completed) {
        setTimeout(() => showResultCard(aiText), 800);
      }

    } catch (err) {
      showTyping(false);
      addBubble('⚠️ Could not connect to server. Please check if backend is running.', 'ai');
    }

    isWaiting = false;
  }

  /* ── Reset chat ── */
  function reset() {
    conversationHistory = [];
    const messages = document.getElementById('triage-messages');
    if (messages) {
      messages.innerHTML = `
        <div class="chat-bubble ai-bubble">
          👋 Hello! I'm your AI health assistant.<br/><br/>
          Please describe the patient's symptoms and I'll help assess the condition.
        </div>`;
    }
  }

  return { init, send, handleKey, reset };

})();