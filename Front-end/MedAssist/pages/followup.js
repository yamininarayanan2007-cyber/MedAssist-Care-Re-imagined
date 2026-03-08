/* pages/followup.js */
const FollowupPage = {
  getHTML: () => `
    <div class="nav">
      <button class="nav-back" onclick="goTo('dashboard')">← Back</button>
      <span style="font-weight:700;font-size:15px">Follow-up Reminders</span>
      <div style="width:60px"></div>
    </div>

    <div class="hero-band" style="background:linear-gradient(135deg,#ff8c00,#f43f5e)">
      <div class="chip">Feature 03</div>
      <h1>Follow-up Reminders</h1>
      <p>3 patients need attention today.</p>
    </div>

    <div class="container">
      <div class="section-title">Today — ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long'})}</div>
      <div class="timeline">
        <div class="tl-item">
          <div class="tl-dot" style="background:#ffeef1">🚨</div>
          <div class="tl-body" style="border-color:var(--red)">
            <h4>Muthu Rajan — BP Check</h4>
            <p>Hypertension follow-up. Last BP: 160/100 mmHg. Medication review needed.</p>
            <div class="tl-time">⏰ 9:00 AM • <span class="badge badge-red">Urgent</span></div>
          </div>
        </div>
        <div class="tl-item">
          <div class="tl-dot" style="background:#fff3e0">📅</div>
          <div class="tl-body" style="border-color:var(--amber)">
            <h4>Lakshmi Velu — Antenatal Visit</h4>
            <p>32-week ANC check. Weight measurement and fetal heartbeat monitoring required.</p>
            <div class="tl-time">⏰ 11:00 AM • <span class="badge badge-amber">Scheduled</span></div>
          </div>
        </div>
        <div class="tl-item">
          <div class="tl-dot" style="background:#e0f5ff">💊</div>
          <div class="tl-body">
            <h4>Priya Kumar — Medication Refill</h4>
            <p>Iron and folic acid supply running low. Provide 30-day stock from PHC.</p>
            <div class="tl-time">⏰ 2:00 PM • <span class="badge badge-blue">Routine</span></div>
          </div>
        </div>
      </div>

      <hr class="divider"/>
      <div class="section-title">Schedule New Follow-up</div>
      <div class="card" style="border-color:var(--amber)">
        <div class="form-group">
          <label class="form-label">Patient</label>
          <select class="form-input form-select">
            <option>Select Patient</option>
            <option>Priya Kumar</option><option>Muthu Rajan</option><option>Lakshmi Velu</option>
          </select>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Date</label>
            <input class="form-input" type="date"/>
          </div>
          <div class="form-group">
            <label class="form-label">Time</label>
            <input class="form-input" type="time"/>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Reminder Type</label>
          <select class="form-input form-select">
            <option>BP Check</option><option>Antenatal Visit</option>
            <option>Vaccination</option><option>Medication Refill</option><option>Post-discharge</option>
          </select>
        </div>
        <button class="btn btn-primary">+ Schedule Reminder</button>
      </div>
    </div>`
};
