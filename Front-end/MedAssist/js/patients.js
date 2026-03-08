/* ═══════════════════════════════════════
   js/patients.js — Patient Register + Full Search Logic
═══════════════════════════════════════ */

const PatientsLogic = (() => {

  let patients = [
    { id:1,  name:'Priya Kumar',      initials:'PK', gender:'F', age:32, village:'Mettupalayam', status:'Stable',    date:'Today',      color:'#e0f5ff', text:'#0ea5e9', condition:'Anaemia'        },
    { id:2,  name:'Muthu Rajan',      initials:'MR', gender:'M', age:65, village:'Karamadai',    status:'High Risk', date:'Yesterday',  color:'#ffeef1', text:'#f43f5e', condition:'Hypertension'   },
    { id:3,  name:'Lakshmi Velu',     initials:'LV', gender:'F', age:28, village:'Annur',        status:'Follow-up', date:'2 days ago', color:'#fff3e0', text:'#ff8c00', condition:'Pregnancy'      },
    { id:4,  name:'Ravi Sundaram',    initials:'RS', gender:'M', age:45, village:'Pollachi',     status:'Stable',    date:'3 days ago', color:'#e8f0ff', text:'#2979ff', condition:'Diabetes'       },
    { id:5,  name:'Amuda Balaji',     initials:'AB', gender:'F', age:55, village:'Sulur',        status:'Referred',  date:'1 week ago', color:'#f0ebff', text:'#7c3aed', condition:'TB'             },
    { id:6,  name:'Karthik Selvam',   initials:'KS', gender:'M', age:38, village:'Mettupalayam', status:'Stable',    date:'Today',      color:'#e6f9f2', text:'#007a4d', condition:'Fever'          },
    { id:7,  name:'Geetha Moorthy',   initials:'GM', gender:'F', age:60, village:'Annur',        status:'High Risk', date:'Today',      color:'#ffeef1', text:'#f43f5e', condition:'Heart Disease'   },
    { id:8,  name:'Suresh Pandian',   initials:'SP', gender:'M', age:22, village:'Karamadai',    status:'Stable',    date:'4 days ago', color:'#e0f8fa', text:'#0d7a74', condition:'Malaria'        },
    { id:9,  name:'Meena Devi',       initials:'MD', gender:'F', age:34, village:'Pollachi',     status:'Follow-up', date:'2 days ago', color:'#fff3e0', text:'#ff8c00', condition:'Pregnancy'      },
    { id:10, name:'Vijay Annamalai',  initials:'VA', gender:'M', age:50, village:'Sulur',        status:'Referred',  date:'5 days ago', color:'#fce8f4', text:'#e11d84', condition:'Kidney Disease'  },
  ];

  const STATUS_BADGE = {
    'Stable':    'badge-green',
    'High Risk': 'badge-red',
    'Follow-up': 'badge-amber',
    'Referred':  'badge-blue',
  };

  let currentQuery  = '';
  let currentStatus = 'All';
  let currentSort   = 'recent';

  /* ── Highlight matching text ── */
  function highlight(text, query) {
    if (!query) return text;
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(re, '<mark style="background:#fef08a;border-radius:3px;padding:0 2px">$1</mark>');
  }

  /* ── Render a single row ── */
  function renderRow(p, query) {
    return `
      <div class="patient-row" onclick="PatientsLogic.openDetail(${p.id})">
        <div class="patient-av" style="background:${p.color};color:${p.text}">${p.initials}</div>
        <div style="flex:1;min-width:0">
          <h4>${highlight(p.name, query)}</h4>
          <p>${p.gender === 'F' ? '👩' : '👨'} ${p.age} yrs &nbsp;•&nbsp; 📍 ${highlight(p.village, query)}</p>
          <p style="margin-top:3px;font-size:11px;color:var(--sub)">🩺 ${highlight(p.condition, query)}</p>
        </div>
        <div class="ml-auto" style="flex-shrink:0">
          <span class="badge ${STATUS_BADGE[p.status] || 'badge-blue'}">${p.status}</span>
          <div style="font-size:11px;color:var(--sub);margin-top:4px;text-align:right">${p.date}</div>
        </div>
      </div>`;
  }

  /* ── Core filter + sort ── */
  function getFiltered() {
    const q = currentQuery.toLowerCase().trim();
    return patients
      .filter(p => {
        if (currentStatus !== 'All' && p.status !== currentStatus) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q)      ||
          p.village.toLowerCase().includes(q)   ||
          p.condition.toLowerCase().includes(q) ||
          String(p.age).includes(q)
        );
      })
      .sort((a, b) => {
        if (currentSort === 'name')   return a.name.localeCompare(b.name);
        if (currentSort === 'age')    return a.age - b.age;
        if (currentSort === 'recent') return b.id - a.id;
        return 0;
      });
  }

  /* ── Render full list ── */
  function renderList() {
    const list    = document.getElementById('patient-list');
    const counter = document.getElementById('search-counter');
    if (!list) return;

    const filtered = getFiltered();
    const q        = currentQuery.trim();

    if (counter) {
      counter.textContent   = (q || currentStatus !== 'All')
        ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} found`
        : `${patients.length} patients total`;
      counter.style.display = 'block';
    }

    if (!filtered.length) {
      list.innerHTML = `
        <div style="text-align:center;padding:48px 24px">
          <div style="font-size:48px;margin-bottom:12px">🔍</div>
          <div style="font-weight:700;font-size:16px;margin-bottom:6px;color:var(--text)">No patients found</div>
          <div style="font-size:13px;color:var(--sub)">Try a different name, village, or clear the filters.</div>
          <button class="btn btn-secondary" style="margin-top:16px" onclick="PatientsLogic.clearSearch()">
            Clear Search
          </button>
        </div>`;
      return;
    }

    list.innerHTML = filtered.map(p => renderRow(p, q)).join('');
  }

  /* ── Search handler ── */
  function search(value) {
    currentQuery = value;
    renderList();
    const clearBtn = document.getElementById('search-clear');
    if (clearBtn) clearBtn.style.display = value ? 'flex' : 'none';
  }

  /* ── Status filter ── */
  function filterByStatus(status, el) {
    currentStatus = status;
    document.querySelectorAll('.status-pill').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
    renderList();
  }

  /* ── Sort ── */
  function sortBy(value) {
    currentSort = value;
    renderList();
  }

  /* ── Clear all ── */
  function clearSearch() {
    currentQuery  = '';
    currentStatus = 'All';
    currentSort   = 'recent';
    const inp = document.getElementById('search-input');
    if (inp) inp.value = '';
    const clearBtn = document.getElementById('search-clear');
    if (clearBtn) clearBtn.style.display = 'none';
    document.querySelectorAll('.status-pill').forEach((b, i) => b.classList.toggle('active', i === 0));
    const sortEl = document.getElementById('sort-select');
    if (sortEl) sortEl.value = 'recent';
    renderList();
  }

  /* ── Patient detail modal ── */
  function openDetail(id) {
    const p = patients.find(x => x.id === id);
    if (!p) return;
    const overlay = document.getElementById('patient-detail-overlay');
    const content = document.getElementById('patient-detail-content');
    if (!overlay || !content) return;
    content.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
        <div style="width:60px;height:60px;border-radius:18px;background:${p.color};color:${p.text};
                    display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;flex-shrink:0">
          ${p.initials}
        </div>
        <div>
          <div style="font-family:'Fraunces',serif;font-size:20px;font-weight:800">${p.name}</div>
          <div style="font-size:13px;color:var(--sub);margin-top:2px">
            ${p.gender === 'F' ? 'Female' : 'Male'} • ${p.age} years • ${p.village}
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        ${[
          ['Status',     `<span class="badge ${STATUS_BADGE[p.status]}">${p.status}</span>`],
          ['Condition',  '🩺 ' + p.condition],
          ['Village',    '📍 ' + p.village],
          ['Last Visit', '📅 ' + p.date],
        ].map(([k, v]) => `
          <div style="background:var(--bg);border-radius:12px;padding:12px">
            <div style="font-size:11px;font-weight:700;color:var(--sub);margin-bottom:5px;text-transform:uppercase">${k}</div>
            <div style="font-size:13px;font-weight:600">${v}</div>
          </div>`).join('')}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-primary"   style="flex:1" onclick="goTo('triage')">🩺 Triage</button>
        <button class="btn btn-secondary" style="flex:1" onclick="goTo('followup')">📅 Follow-up</button>
        <button class="btn btn-secondary" style="flex:1" onclick="goTo('referral')">🏥 Refer</button>
      </div>`;
    overlay.style.display = 'flex';
  }

  function closeDetail() {
    const overlay = document.getElementById('patient-detail-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  function showAddForm() { document.getElementById('add-patient-form').style.display = 'block'; }
  function hideAddForm() { document.getElementById('add-patient-form').style.display = 'none'; }

  function addPatient() {
    const name    = document.getElementById('new-name').value.trim();
    const age     = document.getElementById('new-age').value.trim();
    const gender  = document.getElementById('new-gender').value;
    const village = document.getElementById('new-village').value.trim();
    const cond    = document.getElementById('new-condition').value.trim();
    if (!name) { alert('Please enter patient name.'); return; }
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    patients.unshift({
      id: Date.now(), name, initials,
      gender: gender === 'Female' ? 'F' : 'M',
      age: parseInt(age) || 0,
      village: village || '—',
      condition: cond || 'General',
      status: 'Stable', date: 'Just now',
      color: '#e6f9f2', text: '#007a4d'
    });
    renderList();
    hideAddForm();
  }

  // Legacy alias
  function filter(value) { search(value); }

  return {
    renderList, search, filter, sortBy,
    filterByStatus, clearSearch,
    openDetail, closeDetail,
    showAddForm, hideAddForm, addPatient
  };
})();
