/* pages/dashboard.js */
const DashboardPage = {
  getHTML: () => `
    <div class="nav">
      <span class="nav-logo" onclick="goTo('dashboard')">🌿 MedAssist</span>
      <div class="nav-actions">
        <button class="nav-lang" onclick="goTo('language')">🌐 Tamil</button>
        <div class="nav-avatar" onclick="goTo('profile')">PD</div>
      </div>
    </div>

    <div class="dash-hero">
      <div class="dash-hero-inner">
        <div class="dash-greeting">Good Morning, Priya 👋</div>
        <h1>Welcome back!</h1>
        <div class="dash-stats">
          <div class="dash-stat"><div class="dash-stat-n">24</div><div class="dash-stat-l">Patients</div></div>
          <div class="dash-stat"><div class="dash-stat-n">3</div><div class="dash-stat-l">Follow-ups</div></div>
          <div class="dash-stat"><div class="dash-stat-n">1</div><div class="dash-stat-l">Alerts</div></div>
        </div>
      </div>
    </div>

    <div class="container" style="padding-top:0">
      <div class="feature-grid">
        ${[
          { n:'01', icon:'🩺', label:'Quick Symptom Triage',    page:'triage',    c:'#00a86b', bg:'#e6f9f2' },
          { n:'02', icon:'📋', label:'Patient Register',         page:'patients',  c:'#0ea5e9', bg:'#e0f5ff' },
          { n:'03', icon:'📅', label:'Follow-up Reminder',       page:'followup',  c:'#ff8c00', bg:'#fff3e0' },
          { n:'04', icon:'🌐', label:'Language Support',         page:'language',  c:'#7c3aed', bg:'#f0ebff' },
          { n:'05', icon:'🚨', label:'Emergency Alert',          page:'emergency', c:'#f43f5e', bg:'#ffeef1' },
          { n:'06', icon:'🏥', label:'Referral Helper',          page:'referral',  c:'#2979ff', bg:'#e8f0ff' },
          { n:'07', icon:'📢', label:'Awareness Materials',      page:'awareness', c:'#5a7a1a', bg:'#edf5e0' },
          { n:'08', icon:'🧠', label:'Mental Health Screen',     page:'mental',    c:'#7c3aed', bg:'#f0ebff' },
          { n:'09', icon:'🔐', label:'Login & Register',         page:'login',     c:'#475569', bg:'#f0f4f8' },
          { n:'10', icon:'👤', label:'Health Worker Profile',    page:'profile',   c:'#e11d84', bg:'#fce8f4' },
        ].map(f => `
          <div class="feat-card" style="--c:${f.c};--c-bg:${f.bg}" onclick="goTo('${f.page}')">
            <div class="feat-icon">${f.icon}</div>
            <div class="feat-num">${f.n}</div>
            <h3>${f.label}</h3>
          </div>`).join('')}
      </div>
    </div>`
};
