/* pages/mental.js */
const MentalPage = {
  getHTML: () => `
    <div class="nav">
      <button class="nav-back" onclick="goTo('dashboard')">← Back</button>
      <span style="font-weight:700;font-size:15px">Mental Health Screening</span>
      <div style="width:60px"></div>
    </div>

    <div class="hero-band" style="background:linear-gradient(135deg,#7c3aed,#2979ff)">
      <div class="chip">Feature 08</div>
      <h1>Mental Health Screening</h1>
      <p>PHQ-9 Depression screening tool. Takes about 3 minutes.</p>
    </div>

    <div class="container">
      <div class="form-group" style="margin-bottom:20px">
        <label class="form-label">Patient Name</label>
        <input class="form-input" placeholder="Enter patient name"/>
      </div>

      <div class="phq-card" id="phq-card">
        <div class="phq-progress-bar">
          <div class="phq-progress-fill" id="phq-prog" style="width:11%"></div>
        </div>
        <div id="phq-q-num" style="font-size:12px;font-weight:700;color:var(--sub);margin-bottom:6px">
          Question 1 of 9
        </div>
        <div class="phq-question" id="phq-question"></div>
        <div class="phq-options" id="phq-options">
          <button class="phq-opt" onclick="MentalLogic.answer(0,this)">Not at all</button>
          <button class="phq-opt" onclick="MentalLogic.answer(1,this)">Several days</button>
          <button class="phq-opt" onclick="MentalLogic.answer(2,this)">More than half the days</button>
          <button class="phq-opt" onclick="MentalLogic.answer(3,this)">Nearly every day</button>
        </div>
      </div>

      <div class="score-result" id="phq-result">
        <div class="score-circle" id="score-circle"></div>
        <h2 id="score-label" style="margin-bottom:8px"></h2>
        <p id="score-desc" style="font-size:14px;color:var(--sub);line-height:1.6;margin-bottom:20px"></p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary"   onclick="goTo('referral')">🏥 Refer for Counseling</button>
          <button class="btn btn-secondary" onclick="MentalLogic.reset()">↺ Retake</button>
        </div>
      </div>
    </div>`,

  init() {
    setTimeout(() => MentalLogic.render(), 0);
  }
};
