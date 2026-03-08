/* pages/referral.js */
const ReferralPage = {
  getHTML: () => `
    <div class="nav">
      <button class="nav-back" onclick="goTo('dashboard')">← Back</button>
      <span style="font-weight:700;font-size:15px">Referral Helper</span>
      <div style="width:60px"></div>
    </div>

    <div class="hero-band" style="background:linear-gradient(135deg,#2979ff,#0ea5e9)">
      <div class="chip">Feature 06</div>
      <h1>Referral Decision Helper</h1>
      <p>Evidence-based guidance on when and where to refer patients.</p>
    </div>

    <div class="container">
      <div class="step-progress">
        <div class="step done">
          <div class="step-circle">✓</div>
          <div class="step-label">Patient</div>
        </div>
        <div class="step active">
          <div class="step-circle">2</div>
          <div class="step-label">Condition</div>
        </div>
        <div class="step">
          <div class="step-circle">3</div>
          <div class="step-label">Facility</div>
        </div>
        <div class="step">
          <div class="step-circle">4</div>
          <div class="step-label">Confirm</div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Primary Condition</label>
        <select class="form-input form-select"
                onchange="ReferralLogic.updateAdvice(this.value)">
          <option value="">Select Condition</option>
          <option value="htn">Hypertension — Uncontrolled</option>
          <option value="anc">High-risk Pregnancy</option>
          <option value="tb">Suspected TB</option>
          <option value="dm">Diabetes — Complications</option>
          <option value="peds">Severely Malnourished Child</option>
        </select>
      </div>

      <div id="referral-advice" class="card" style="display:none;margin-bottom:18px">
        <div id="advice-content"></div>
      </div>

      <div class="section-title">Nearby Facilities</div>
      <div class="facility-card">
        <h4>🏥 PHC Mettupalayam</h4>
        <p>Primary Health Centre • General OPD</p>
        <div class="facility-dist">📍 3.2 km away</div>
      </div>
      <div class="facility-card">
        <h4>🏨 GH Coimbatore</h4>
        <p>Government Hospital • Specialist care</p>
        <div class="facility-dist">📍 24 km away</div>
      </div>
      <div class="facility-card">
        <h4>🏥 CHC Karamadai</h4>
        <p>Community Health Centre • Lab & X-Ray</p>
        <div class="facility-dist">📍 8.5 km away</div>
      </div>

      <button class="btn btn-primary" style="margin-top:18px" onclick="alert('Referral slip generated!')">
        Generate Referral Slip →
      </button>
    </div>`
};
