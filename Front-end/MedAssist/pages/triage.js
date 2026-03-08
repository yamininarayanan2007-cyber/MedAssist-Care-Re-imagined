/* pages/triage.js — Chat UI for Triage */
const TriagePage = {
  getHTML: () => `
    <div class="nav">
      <button class="nav-back" onclick="goTo('dashboard')">← Back</button>
      <span style="font-weight:700;font-size:15px">Symptom Triage</span>
      <div style="width:60px"></div>
    </div>

    <!-- Chat Container -->
    <div id="triage-chat-wrapper" style="
      display:flex; flex-direction:column; height:calc(100vh - 60px);
      background:#f8fafc;
    ">

      <!-- Hero Strip -->
      <div style="background:linear-gradient(135deg,#00a86b,#007a4d);
                  padding:14px 20px; display:flex; align-items:center; gap:10px">
        <div style="width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,0.2);
                    display:flex;align-items:center;justify-content:center;font-size:18px">🩺</div>
        <div>
          <div style="color:#fff;font-weight:700;font-size:14px">AI Symptom Triage</div>
          <div style="color:rgba(255,255,255,0.75);font-size:11px">Powered by Gemini • Responds in your language</div>
        </div>
        <div id="triage-lang-badge" style="margin-left:auto;background:rgba(255,255,255,0.2);
             color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px">
          🌐 English
        </div>
      </div>

      <!-- Messages Area -->
      <div id="triage-messages" style="
        flex:1; overflow-y:auto; padding:20px 16px;
        display:flex; flex-direction:column; gap:12px;
      ">
        <!-- Welcome bubble -->
        <div class="chat-bubble ai-bubble">
          👋 Hello! I'm your AI health assistant.<br/><br/>
          Please describe the patient's symptoms and I'll help assess the condition.
          You can type naturally — for example:<br/><br/>
          <em>"Patient has fever, headache and body ache since 2 days"</em>
        </div>
      </div>

      <!-- Typing indicator -->
      <div id="triage-typing" style="display:none;padding:0 16px 8px">
        <div class="chat-bubble ai-bubble" style="width:60px">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>

      <!-- Input Area -->
      <div style="background:#fff;border-top:2px solid #e2e8f0;padding:12px 16px;
                  padding-bottom:calc(12px + env(safe-area-inset-bottom))">
        <div style="display:flex;gap:10px;align-items:flex-end">
          <textarea
            id="triage-input"
            rows="1"
            placeholder="Describe symptoms here…"
            style="flex:1;border:1.5px solid #e2e8f0;border-radius:14px;
                   padding:12px 14px;font-size:14px;font-family:inherit;
                   resize:none;outline:none;max-height:120px;line-height:1.5;
                   transition:border .2s;"
            onfocus="this.style.borderColor='var(--green)'"
            onfocusout="this.style.borderColor='#e2e8f0'"
            onkeydown="TriageChat.handleKey(event)"
            oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"
          ></textarea>
          <button onclick="TriageChat.send()"
            style="width:46px;height:46px;border-radius:14px;border:none;
                   background:var(--green);color:#fff;font-size:20px;
                   display:flex;align-items:center;justify-content:center;
                   cursor:pointer;flex-shrink:0;transition:background .2s"
            onmouseover="this.style.background='var(--green-d)'"
            onmouseout="this.style.background='var(--green)'">
            ➤
          </button>
        </div>
        <div style="text-align:center;font-size:11px;color:#94a3b8;margin-top:8px">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>

    <!-- Triage Result Card (shown when triage_completed) -->
    <div id="triage-result-card" style="
      display:none;position:fixed;inset:0;z-index:500;
      background:rgba(15,25,35,0.6);backdrop-filter:blur(4px);
      align-items:flex-end;justify-content:center;
    " onclick="if(event.target===this)this.style.display='none'">
      <div style="background:#fff;border-radius:24px 24px 0 0;padding:28px 24px 40px;
                  width:100%;max-width:540px;animation:slideUp .3s ease">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-family:'Fraunces',serif;font-size:18px;font-weight:800">Triage Result</div>
          <button onclick="document.getElementById('triage-result-card').style.display='none'"
            style="width:32px;height:32px;border-radius:50%;border:none;
                   background:#f1f5f9;font-size:16px;cursor:pointer">✕</button>
        </div>
        <div id="triage-result-content"></div>
        <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
          <button class="btn btn-primary" style="flex:1" onclick="goTo('referral')">🏥 Refer Patient</button>
          <button class="btn btn-secondary" style="flex:1" onclick="goTo('emergency')">🚨 Emergency</button>
        </div>
      </div>
    </div>

    <style>
      .chat-bubble {
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.6;
        animation: fadeUp .25s ease;
      }
      .ai-bubble {
        background: #fff;
        border: 1.5px solid #e2e8f0;
        border-bottom-left-radius: 4px;
        align-self: flex-start;
        color: #0f1923;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      }
      .user-bubble {
        background: linear-gradient(135deg, #00a86b, #007a4d);
        color: #fff;
        border-bottom-right-radius: 4px;
        align-self: flex-end;
      }
      .typing-dot {
        display: inline-block;
        width: 7px; height: 7px;
        border-radius: 50%;
        background: #94a3b8;
        margin: 0 2px;
        animation: typingBounce 1.2s infinite;
      }
      .typing-dot:nth-child(2) { animation-delay: .2s; }
      .typing-dot:nth-child(3) { animation-delay: .4s; }
      @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); }
        30%            { transform: translateY(-6px); }
      }
      @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
    </style>`,

  init() {
    setTimeout(() => TriageChat.init(), 0);
  }
};
