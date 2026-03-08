/* pages/awareness.js */
const AwarenessPage = {
  MATERIALS: [
    { icon:'🤰', bg:'#e6f9f2', title:'Safe Motherhood',     desc:'Antenatal care tips for mothers' },
    { icon:'💉', bg:'#fff3e0', title:'Childhood Vaccines',  desc:'Immunisation schedule chart' },
    { icon:'🩺', bg:'#ffeef1', title:'TB Awareness',        desc:'Symptoms, treatment, DOTS' },
    { icon:'🥦', bg:'#e0f5ff', title:'Nutrition Guide',     desc:'Balanced diet for families' },
    { icon:'🧠', bg:'#f0ebff', title:'Mental Wellness',     desc:'Reducing stigma, seeking help' },
    { icon:'🚿', bg:'#e0f8fa', title:'Sanitation & Hygiene',desc:'Handwashing, safe water tips' },
    { icon:'🦟', bg:'#fff3e0', title:'Dengue Prevention',   desc:'Mosquito control and symptoms' },
    { icon:'🩸', bg:'#ffeef1', title:'Anaemia Awareness',   desc:'Iron deficiency and diet tips' },
  ],

  getHTML() {
    return `
      <div class="nav">
        <button class="nav-back" onclick="goTo('dashboard')">← Back</button>
        <span style="font-weight:700;font-size:15px">Awareness Materials</span>
        <div style="width:60px"></div>
      </div>

      <div class="hero-band" style="background:linear-gradient(135deg,#5a7a1a,#00a86b)">
        <div class="chip">Feature 07</div>
        <h1>Health Awareness Materials</h1>
        <p>Share IEC content with patients in their language.</p>
      </div>

      <div class="container">
        <div class="search-bar">
          <span>🔍</span>
          <input placeholder="Search materials…"/>
        </div>
        <div class="chip-row">
          <button class="chip-filter active">All</button>
          <button class="chip-filter">Posters</button>
          <button class="chip-filter">Videos</button>
          <button class="chip-filter">Audio</button>
        </div>
        <div class="grid-2">
          ${this.MATERIALS.map(m => `
            <div class="material-card">
              <div class="material-thumb" style="background:${m.bg}">${m.icon}</div>
              <div class="material-body">
                <h4>${m.title}</h4>
                <p>${m.desc}</p>
                <div class="material-actions">
                  <button class="mat-btn">👁 View</button>
                  <button class="mat-btn">📤 Share</button>
                </div>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  },

  init() {
    // Chip filter interaction
    setTimeout(() => {
      document.querySelectorAll('.chip-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.chip-filter').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }, 0);
  }
};
