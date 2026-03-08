/* pages/language.js */
const LanguagePage = {
  getHTML: () => `
    <div class="nav">
      <button class="nav-back" onclick="goTo('dashboard')">← Back</button>
      <span style="font-weight:700;font-size:15px">Language Settings</span>
      <div style="width:60px"></div>
    </div>

    <div class="hero-band" style="background:linear-gradient(135deg,#7c3aed,#e11d84)">
      <div class="chip">Feature 04</div>
      <h1>Regional Language Support</h1>
      <p>Use ArogyaSetu in your native language for maximum comfort.</p>
    </div>

    <div class="container">
      <div class="section-title">Select Interface Language</div>
      <div class="lang-grid" style="margin-bottom:24px">
        ${[
          { script:'த',  en:'Tamil',    native:'தமிழ்',     active:true  },
          { script:'हि', en:'Hindi',    native:'हिंदी',     active:false },
          { script:'తె', en:'Telugu',   native:'తెలుగు',    active:false },
          { script:'ಕ',  en:'Kannada',  native:'ಕನ್ನಡ',     active:false },
          { script:'മ',  en:'Malayalam',native:'മലയാളം',    active:false },
          { script:'En', en:'English',  native:'English',   active:false },
        ].map(l => `
          <div class="lang-card ${l.active ? 'active' : ''}"
               onclick="LanguagePage.selectLang(this)">
            <div class="lang-script">${l.script}</div>
            <h4>${l.en}</h4>
            <p>${l.native}</p>
          </div>`).join('')}
      </div>

      <div class="card" style="border-color:var(--purple)">
        <div style="font-weight:700;font-size:15px;margin-bottom:14px">🔊 Voice Input Settings</div>
        <div class="setting-row" style="border-bottom:1.5px solid var(--border);padding-bottom:14px;margin-bottom:14px">
          <div class="setting-icon" style="background:var(--purple-bg)">🎙️</div>
          <div class="setting-label">Voice Commands</div>
          <div class="toggle on" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="setting-row" style="border:none">
          <div class="setting-icon" style="background:var(--purple-bg)">🔊</div>
          <div class="setting-label">Read-aloud Mode</div>
          <div class="toggle" onclick="this.classList.toggle('on')"></div>
        </div>
      </div>
    </div>`,

  selectLang(el) {
    document.querySelectorAll('.lang-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    const languageMap = {
      'Tamil':     'Tamil',
      'Hindi':     'Hindi',
      'Telugu':    'Telugu',
      'Kannada':   'Kannada',
      'Malayalam': 'Malayalam',
      'English':   'English'
    };
    const langName = el.querySelector('h4').textContent.trim();
    setLanguage(languageMap[langName] || 'English');
  }
};
