/* pages/profile.js */
const ProfilePage = {
  getHTML: () => `
    <div class="nav">
      <button class="nav-back" onclick="goTo('dashboard')">← Back</button>
      <span style="font-weight:700;font-size:15px">My Profile</span>
      <button class="btn btn-secondary" style="padding:7px 14px;font-size:12px">Edit</button>
    </div>

    <div class="hero-band profile-hero">
      <div class="chip">Feature 10</div>
      <h1>Health Worker Profile</h1>
    </div>

    <div class="container" style="padding-top:0">
      <div class="profile-av-wrap">
        <div class="profile-av">👩</div>
      </div>
      <h2 class="profile-name">Priya Devi</h2>
      <p class="profile-role">ASHA Worker • Mettupalayam Block, Coimbatore</p>
      <div style="text-align:center;margin-bottom:24px">
        <span class="badge badge-green">✓ Certified 2024</span>
      </div>

      <div class="profile-stats">
        <div class="prof-stat"><div class="prof-stat-n">24</div><div class="prof-stat-l">Patients</div></div>
        <div class="prof-stat"><div class="prof-stat-n">142</div><div class="prof-stat-l">Visits</div></div>
        <div class="prof-stat"><div class="prof-stat-n">98%</div><div class="prof-stat-l">Attendance</div></div>
      </div>

      <!-- Worker Info -->
      <div class="card" style="margin-bottom:14px">
        <div class="section-title" style="margin-bottom:12px">Worker Information</div>
        ${[
          ['ASHA ID',    'ASHA-TN-2024-0847'],
          ['Phone',      '+91 98765 43210'],
          ['District',   'Coimbatore'],
          ['Block',      'Mettupalayam'],
          ['Supervisor', 'Dr. Meena Rani'],
        ].map(([k,v]) => `
          <div style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-bottom:1px solid var(--border)">
            <span style="color:var(--sub);font-weight:600">${k}</span>
            <span style="font-weight:700">${v}</span>
          </div>`).join('')}
      </div>

      <!-- Settings -->
      <div class="card">
        <div class="section-title" style="margin-bottom:12px">Settings</div>
        <div class="setting-row" onclick="goTo('language')">
          <div class="setting-icon" style="background:var(--purple-bg)">🌐</div>
          <div class="setting-label">Language</div>
          <div class="setting-arrow">›</div>
        </div>
        <div class="setting-row">
          <div class="setting-icon" style="background:var(--green-bg)">🔔</div>
          <div class="setting-label">Notifications</div>
          <div class="toggle on" onclick="event.stopPropagation();this.classList.toggle('on')"></div>
        </div>
        <div class="setting-row">
          <div class="setting-icon" style="background:var(--sky-bg)">📶</div>
          <div class="setting-label">Offline Mode</div>
          <div class="toggle on" onclick="event.stopPropagation();this.classList.toggle('on')"></div>
        </div>
        <div class="setting-row">
          <div class="setting-icon" style="background:var(--amber-bg)">🔒</div>
          <div class="setting-label">Change PIN</div>
          <div class="setting-arrow">›</div>
        </div>
        <div class="setting-row" onclick="goTo('login')">
          <div class="setting-icon" style="background:var(--red-bg)">🚪</div>
          <div class="setting-label" style="color:var(--red)">Logout</div>
          <div class="setting-arrow" style="color:var(--red)">›</div>
        </div>
      </div>
    </div>`
};
