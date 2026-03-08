/* pages/patients.js */
const PatientsPage = {
  getHTML: () => `
    <div class="nav">
      <button class="nav-back" onclick="goTo('dashboard')">← Back</button>
      <span style="font-weight:700;font-size:15px">Patient Register</span>
      <button class="btn btn-primary" style="padding:7px 14px;font-size:12px"
              onclick="PatientsLogic.showAddForm()">+ Add</button>
    </div>

    <div class="hero-band" style="background:linear-gradient(135deg,#0ea5e9,#0d7a74)">
      <div class="chip">Feature 02</div>
      <h1>Patient Register</h1>
      <p>Search patients by name, village, condition, or status.</p>
    </div>

    <div class="container">

      <!-- ── SEARCH BAR ── -->
      <div style="position:relative;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:10px;background:#fff;
                    border:2px solid var(--border);border-radius:16px;padding:12px 16px;
                    transition:border .2s;box-shadow:0 2px 10px rgba(0,0,0,0.05)"
             id="search-box"
             onfocusin="document.getElementById('search-box').style.borderColor='var(--sky)'"
             onfocusout="document.getElementById('search-box').style.borderColor='var(--border)'">
          <span style="font-size:20px">🔍</span>
          <input
            id="search-input"
            style="flex:1;border:none;outline:none;font-size:15px;font-family:inherit;
                   color:var(--text);background:none;"
            placeholder="Search by name, village, condition…"
            oninput="PatientsLogic.search(this.value)"
          />
          <button id="search-clear"
            style="display:none;align-items:center;justify-content:center;
                   width:24px;height:24px;border-radius:50%;background:var(--border);
                   border:none;font-size:14px;color:var(--sub);cursor:pointer;flex-shrink:0"
            onclick="PatientsLogic.clearSearch()">✕</button>
        </div>

        <!-- Search hint tags -->
        <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
          ${['Mettupalayam','Annur','Karamadai','Pollachi','Sulur'].map(v => `
            <button onclick="document.getElementById('search-input').value='${v}';PatientsLogic.search('${v}')"
              style="font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;
                     border:1.5px solid var(--border);background:#fff;color:var(--sub);
                     cursor:pointer;transition:all .2s"
              onmouseover="this.style.borderColor='var(--sky)';this.style.color='var(--sky)'"
              onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--sub)'">
              📍 ${v}
            </button>`).join('')}
        </div>
      </div>

      <!-- ── STATUS FILTER PILLS ── -->
      <div style="display:flex;gap:8px;margin-bottom:12px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none">
        ${['All','Stable','High Risk','Follow-up','Referred'].map((s, i) => `
          <button class="status-pill ${i === 0 ? 'active' : ''}"
                  onclick="PatientsLogic.filterByStatus('${s}', this)"
                  style="white-space:nowrap;padding:7px 16px;border-radius:20px;
                         border:1.5px solid var(--border);background:#fff;
                         font-size:12px;font-weight:700;color:var(--sub);
                         cursor:pointer;transition:all .2s;flex-shrink:0">
            ${s === 'All' ? '🗂 All' : s === 'Stable' ? '🟢 ' + s : s === 'High Risk' ? '🔴 ' + s : s === 'Follow-up' ? '🟡 ' + s : '🔵 ' + s}
          </button>`).join('')}
      </div>

      <!-- ── SORT + COUNTER ROW ── -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:10px">
        <div id="search-counter"
             style="font-size:12px;font-weight:700;color:var(--sub);display:none"></div>
        <select id="sort-select" class="form-input form-select"
                style="width:auto;padding:7px 32px 7px 12px;font-size:12px;border-radius:10px;flex-shrink:0"
                onchange="PatientsLogic.sortBy(this.value)">
          <option value="recent">🕐 Most Recent</option>
          <option value="name">🔤 Name A–Z</option>
          <option value="age">👤 Age</option>
        </select>
      </div>

      <!-- ── ADD PATIENT FORM ── -->
      <div id="add-patient-form" class="card"
           style="display:none;margin-bottom:18px;border-color:var(--sky);border-width:2px">
        <div style="font-weight:700;font-size:15px;margin-bottom:16px">➕ New Patient</div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input id="new-name" class="form-input" placeholder="Full name"/>
          </div>
          <div class="form-group">
            <label class="form-label">Age</label>
            <input id="new-age" class="form-input" type="number" placeholder="Age"/>
          </div>
          <div class="form-group">
            <label class="form-label">Gender</label>
            <select id="new-gender" class="form-input form-select">
              <option>Female</option><option>Male</option><option>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Village</label>
            <input id="new-village" class="form-input" placeholder="Village name"/>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Primary Condition</label>
          <input id="new-condition" class="form-input" placeholder="e.g. Fever, Diabetes, Pregnancy…"/>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-primary"   onclick="PatientsLogic.addPatient()">Save Patient</button>
          <button class="btn btn-secondary" onclick="PatientsLogic.hideAddForm()">Cancel</button>
        </div>
      </div>

      <!-- ── PATIENT LIST ── -->
      <div id="patient-list"></div>
    </div>

    <!-- ── PATIENT DETAIL MODAL ── -->
    <div id="patient-detail-overlay"
         style="display:none;position:fixed;inset:0;z-index:500;
                background:rgba(15,25,35,0.6);backdrop-filter:blur(4px);
                align-items:flex-end;justify-content:center;padding:0"
         onclick="if(event.target===this)PatientsLogic.closeDetail()">
      <div style="background:#fff;border-radius:24px 24px 0 0;padding:28px 24px 40px;
                  width:100%;max-width:540px;animation:slideUp .3s ease;
                  max-height:85vh;overflow-y:auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div style="font-family:'Fraunces',serif;font-size:16px;font-weight:800">Patient Details</div>
          <button onclick="PatientsLogic.closeDetail()"
                  style="width:32px;height:32px;border-radius:50%;border:none;
                         background:var(--bg);font-size:16px;cursor:pointer">✕</button>
        </div>
        <div id="patient-detail-content"></div>
      </div>
    </div>

    <style>
      .status-pill.active {
        background: var(--sky) !important;
        color: #fff !important;
        border-color: var(--sky) !important;
      }
      @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
    </style>`,

  init() {
    setTimeout(() => PatientsLogic.renderList(), 0);
  }
};
