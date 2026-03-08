/* pages/emergency.js */
const EmergencyPage = {
  getHTML: () => `
    <div class="nav">
      <button class="nav-back" onclick="goTo('dashboard')">← Back</button>
      <span style="font-weight:700;font-size:15px">Emergency Alert</span>
      <div style="width:60px"></div>
    </div>

    <div class="hero-band" style="background:linear-gradient(135deg,#f43f5e,#c94040)">
      <div class="chip">Feature 05</div>
      <h1>Emergency Alert Generator</h1>
      <p>Send instant alerts to PHC, ambulance, and supervisors.</p>
    </div>

    <div class="container">
      <button class="sos-btn" onclick="EmergencyLogic.showSent()">SOS</button>
      <p style="text-align:center;font-size:13px;color:var(--sub);margin-bottom:28px">
        Tap to send immediate emergency alert
      </p>

      <div class="section-title">Alert Type</div>
      <div class="alert-type-grid" style="margin-bottom:20px">
        ${[
          ['🤰','Obstetric Emergency'],
          ['💔','Cardiac Event'],
          ['🤕','Accident / Trauma'],
          ['🫁','Respiratory Distress']
        ].map(([icon, label]) => `
          <div class="alert-type" onclick="EmergencyLogic.toggleAlertType(this)">
            <div class="at-icon">${icon}</div>
            <h4>${label}</h4>
          </div>`).join('')}
      </div>

      <div class="form-group">
        <label class="form-label">Patient Name</label>
        <input class="form-input" placeholder="Name"/>
      </div>
      <div class="form-group">
        <label class="form-label">Location / Village</label>
        <input class="form-input" placeholder="Describe location"/>
      </div>
      <div class="form-group">
        <label class="form-label">Additional Notes</label>
        <textarea class="form-input" rows="3" placeholder="Current condition, visible symptoms…"></textarea>
      </div>

      <button class="btn btn-danger btn-full" style="font-size:16px;padding:14px"
              onclick="EmergencyLogic.showSent()">
        🚨 Send Emergency Alert
      </button>

      <div id="emergency-sent" class="result-box" style="margin-top:14px">
        <h3 style="color:var(--green-d)">✅ Alert Sent!</h3>
        <p>Emergency alert dispatched to PHC Mettupalayam, Ambulance 108, and your supervisor. ETA: 15 minutes.</p>
      </div>
    </div>`
};
