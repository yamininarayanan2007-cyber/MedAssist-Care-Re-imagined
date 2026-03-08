/* pages/login.js */
const LoginPage = {
  getHTML: () => `
    <div style="background:linear-gradient(145deg,#0f172a 0%,#0d3b2e 60%,#064e3b 100%);
                min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;">
      <div class="login-card">
        <div class="login-logo">
          <div class="logo-icon">🌿</div>
          <h2>MedAssist</h2>
          <p>Care, Reimagined</p>
        </div>
        <div class="login-tabs">
          <button class="login-tab active" onclick="LoginPage.switchTab('login',this)">Login</button>
          <button class="login-tab"        onclick="LoginPage.switchTab('register',this)">Register</button>
        </div>
        <div id="login-form">
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input class="form-input" type="tel" placeholder="Enter Phone Number"/>
          </div>
          <div class="form-group">
            <label class="form-label">OTP</label>
            <div class="otp-row">
              <input class="form-input" type="text" placeholder="Enter 6-digit OTP"/>
              <button class="btn btn-secondary otp-btn">Send OTP</button>
            </div>
          </div>
          <button class="btn btn-primary btn-full" style="margin-top:4px" onclick="goTo('dashboard')">
            Login →
          </button>
          <div class="divider-or"><span>or</span></div>
          <button class="social-btn">🔑 Login with ASHA ID</button>
        </div>
        <div id="register-form" style="display:none">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">First Name</label>
              <input id="reg-firstname" class="form-input" placeholder="Priya"/>
            </div>
            <div class="form-group">
              <label class="form-label">Last Name</label>
              <input id="reg-lastname" class="form-input" placeholder="Devi"/>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">ASHA Worker ID</label>
            <input id="reg-asha" class="form-input" placeholder="ASHA-TN-2024-XXXX"/>
          </div>
          <div class="form-group">
            <label class="form-label">District</label>
            <select id="reg-district" class="form-input form-select">
              <option>Select District</option>
              <option>Coimbatore</option><option>Erode</option>
              <option>Salem</option><option>Tiruppur</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input id="reg-phone" class="form-input" type="tel" placeholder="Enter phone number"/>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input id="reg-password" class="form-input" type="password" placeholder="Enter password"/>
          </div>
          <button class="btn btn-primary btn-full" style="margin-top:4px" onclick="register()">
            Create Account →
          </button>
        </div>
      </div>
    </div>`,

  switchTab(tab, el) {
    document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('login-form').style.display    = tab === 'login'    ? 'block' : 'none';
    document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
  }
};

// ── Register API call ──
async function register() {
  const firstName = document.getElementById('reg-firstname').value.trim();
  const lastName  = document.getElementById('reg-lastname').value.trim();
  const ashaId    = document.getElementById('reg-asha').value.trim();
  const district  = document.getElementById('reg-district').value;
  const phone     = document.getElementById('reg-phone').value.trim();
  const password  = document.getElementById('reg-password').value;

  if (!firstName || !lastName) { alert('Please enter your name.'); return; }
  if (!ashaId)                  { alert('Please enter ASHA Worker ID.'); return; }
  if (!phone)                   { alert('Please enter phone number.'); return; }
  if (!password)                { alert('Please enter password.'); return; }

  try {
    const response = await fetch('http://127.0.0.1:8000/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username:  ashaId,
        full_name: firstName + ' ' + lastName,
        village:   district,
        phone:     phone,
        password:  password
      })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Account created successfully!');
      goTo('dashboard');
    } else {
      alert(data.message || 'Registration failed. Please try again.');
    }
  } catch (err) {
    alert('Cannot connect to server. Please make sure backend is running!');
  }
}