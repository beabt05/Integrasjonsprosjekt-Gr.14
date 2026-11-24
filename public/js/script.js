const authForm = document.querySelector('#navAuthForm');
const submitButton = document.querySelector('#navAuthBtn');
const toRegister = document.querySelector('#navToRegister');
const toLogin = document.querySelector('#navToLogin');
const navMessage = document.querySelector('#navAuthMessage');
const usernameInput = document.querySelector('#navUsername');
const passwordInput = document.querySelector('#navPassword');
const navButtons = document.querySelectorAll('nav button[data-target]');
const sections = document.querySelectorAll('#appFrame section');
const headerTitle = document.getElementById('headerTitle');
const headerIcon = document.getElementById('headerIcon');
const newSessionBtn = document.getElementById('newSessionBtn');
const sessionForm = document.getElementById('contact');
const sessionList = document.getElementById('sessionList');
const sessionFilter = document.getElementById('sessionFilter');
const sessionNote = document.getElementById('sessionNote');
const courseSelect = document.getElementById('course-code-num')
const courseForm = document.getElementById('kursansvarlig');
const courseMessage = document.getElementById('course-message');
const requestsBox = document.getElementById('requestsBox');
const requestList = document.getElementById('requestList');

usernameInput.hidden = true;
usernameInput.disabled = true;
usernameInput.required = false;

let mode = 'login';

toRegister.addEventListener('click', () => {
  mode = 'register';
  usernameInput.hidden = false;
  usernameInput.disabled = false;
  usernameInput.required = true;
  submitButton.textContent = 'Registrer deg';
  toRegister.hidden = true;
  toLogin.hidden = false;
  passwordInput.autocomplete = 'new-password';
  navMessage.textContent = '';
});

toLogin.addEventListener('click', () => {
  mode = 'login';
  usernameInput.hidden = true;
  usernameInput.disabled = true;
  usernameInput.required = false;
  submitButton.textContent = 'Login';
  toLogin.hidden = true;
  toRegister.hidden = false;
  passwordInput.autocomplete = 'current-password';
  navMessage.textContent = '';
});

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const { username, email, password } = Object.fromEntries(new FormData(authForm));

  try {
    const response = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const result = await response.json();
    navMessage.textContent = result.message;

    if (response.ok && mode === 'login') {
      if (result.username) localStorage.setItem('username', result.username);
      if (result.userId) localStorage.setItem('userId', result.userId);

      const welcome = document.getElementById('welcomeMessage');
      if (welcome && result.username) welcome.textContent = `Velkommen, ${result.username}!`;

      courseForm.hidden = result.role !== 'admin';

      mainScreen.hidden = false;
      authModal.close();
    }
  } catch (err) {
    console.error('Login error:', err);
    navMessage.textContent = 'Kunne ikke koble opp til serveren.';
  }
});

const logoutLink = document.getElementById('logoutLink');
if (logoutLink) {
  logoutLink.addEventListener('click', event => {
    event.preventDefault();
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    window.location.reload();
  });
}

const authModal = document.querySelector("#authModal");
const mainScreen = document.querySelector("#mainScreen");

navButtons.forEach(button => {
  button.addEventListener('click', () => {
    sections.forEach(section => {
      section.hidden = true;
    });

    document.getElementById(button.dataset.target).hidden = false;

    headerTitle.textContent = button.dataset.title;
    headerIcon.src = button.querySelector('img').src;

    navButtons.forEach(b => b.classList.remove('active'));
    button.classList.add('active');

    if (button.dataset.target === 'sessionssection') {
      loadSessions();
    }
  });
});

newSessionBtn.addEventListener('click', () => {
  sessionForm.hidden = !sessionForm.hidden;
});

authModal.showModal();
// ---------- Study sessions list ----------

// Example data, used only if the server can't be reached
const MOCK_SESSIONS = [
  { id: 1, tittel: 'Eksamensforberedelse', beskrivelse: 'Går gjennom gamle eksamener',
    emnekode: 'IDATG2102', host: 'Ife', rom: 'A154', dato: '2026-11-05',
    starttid: '12:15', ledigePlasser: 2 },
  { id: 2, tittel: 'Oblig 2', beskrivelse: 'Hjelper hverandre med oppgave 3',
    emnekode: 'IDG2052', host: 'Anna', rom: 'K101', dato: '2026-11-05',
    starttid: '13:00', ledigePlasser: 1 },
  { id: 3, tittel: 'Maskinlæring repetisjon', beskrivelse: '',
    emnekode: 'IDATG2208', host: 'Derek', rom: 'G149', dato: '2026-11-05',
    starttid: '14:30', ledigePlasser: 3 }
];

let allSessions = [];
let createdSessions = [];   // sessions made with the form (crud.js adds to this)

function fillFilter() {
  const current = sessionFilter.value;
  const codes = [...new Set(allSessions.map(s => s.emnekode))];
  sessionFilter.length = 1;          // keep the first "Alle emner" option
  codes.forEach(code => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = code;
    sessionFilter.appendChild(opt);
  });
  sessionFilter.value = codes.includes(current) ? current : '';
}

async function fillCourses() {
  let list = [];
  try {
    const res = await fetch('/api/courses');
    if (!res.ok) throw new Error('bad response');
    list = await res.json();
  } catch {
    /* leave the list empty */
  }

  courseSelect.length = 1;
  list.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.emnekode;
    opt.textContent = `${c.emnekode} ${c.navn_no}`;
    courseSelect.appendChild(opt);
  });
}
fillCourses();

function showSessions() {
  const code = sessionFilter.value;
  const shown = code ? allSessions.filter(s => s.emnekode === code) : allSessions;

  sessionList.replaceChildren();
  if (shown.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'Ingen live-økter akkurat nå.';
    sessionList.appendChild(p);
    return;
  }
  shown.forEach(s => sessionList.appendChild(renderSession(s)));
}

// One column of a card: first line bold, rest normal
function cell(...lines) {
  const div = document.createElement('div');
  div.className = 'session-cell';
  lines.forEach((text, i) => {
    if (!text) return;
    const p = document.createElement('p');
    p.textContent = text;            // textContent, never innerHTML
    if (i === 0) p.className = 'session-strong';
    div.appendChild(p);
  });
  return div;
}

const myId = () => Number(localStorage.getItem('userId')) || 0;

function renderSession(s) {
  const card = document.createElement('article');
  card.className = 'session-card';
  card.tabIndex = 0;

  const row = document.createElement('div');
  row.className = 'session-row-cols';
  row.append(
    cell(s.host, s.emnekode),
    cell(s.tittel, s.beskrivelse),
    cell(s.starttid, `${s.ledigePlasser} ledige plasser`)
  );

  const more = document.createElement('div');
  more.className = 'session-more';
  more.hidden = true;
  more.append(cell(`Rom: ${s.rom || 'ikke oppgitt'}`, `Dato: ${s.dato || ''}`));

  // Join area: always visible, doesn't toggle the card
  const join = document.createElement('div');
  join.className = 'session-join';
  join.addEventListener('click', e => e.stopPropagation());

  const label = text => {
    const span = document.createElement('span');
    span.className = 'join-status';
    span.textContent = text;
    join.appendChild(span);
  };

  if (s.opprettet_av === myId()) {
    label('Din økt');
  } else if (s.minStatus === 'godkjent') {
    label('✓ Du er med');
  } else if (s.minStatus === 'venter') {
    label('Forespørsel sendt …');
  } else if (s.minStatus === 'avslatt') {
    label('Forespørselen ble avslått');
  } else if (s.avsluttet) {
    label('Avsluttet');
  } else if (s.ledigePlasser <= 0) {
    label('Full');
  } else {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'join-btn';
    btn.textContent = 'Be om å bli med';
    btn.addEventListener('click', () => requestJoin(s, btn));
    join.appendChild(btn);
  }

  const toggle = () => { more.hidden = !more.hidden; };
  card.addEventListener('click', toggle);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target === card) toggle();
  });

  card.append(row, more, join);
  return card;
}

async function requestJoin(s, btn) {
  btn.disabled = true;
  try {
    const res = await fetch('/api/sessions/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: s.id, userId: myId() })
    });
    const result = await res.json();
    sessionNote.textContent = result.message;
  } catch {
    sessionNote.textContent = 'Kunne ikke koble opp til serveren.';
  }
  loadSessions();   // refresh status and free spots
}

async function loadSessions() {
  let fetched;
  try {
    const res = await fetch(`/api/sessions?userId=${myId()}`);
    if (!res.ok) throw new Error('bad response');
    fetched = await res.json();
  } catch {
    fetched = MOCK_SESSIONS;
    sessionNote.textContent = 'Viser eksempeldata (fikk ikke kontakt med serveren).';
  }
  allSessions = [...createdSessions, ...fetched];
  fillFilter();
  showSessions();
  loadRequests();
}

// ---------- Host: incoming join requests ----------

async function loadRequests() {
  let list = [];
  try {
    const res = await fetch(`/api/requests?userId=${myId()}`);
    if (res.ok) list = await res.json();
  } catch { /* leave the list empty */ }

  requestList.replaceChildren();
  requestsBox.hidden = list.length === 0;

  list.forEach(r => {
    const row = document.createElement('div');
    row.className = 'request-row';

    const text = document.createElement('p');
    text.textContent = `${r.brukernavn} vil bli med på «${r.tittel}» (${r.emnekode})`;

    const actions = document.createElement('div');
    actions.className = 'request-actions';
    [['Godta', 'godkjent'], ['Avslå', 'avslatt']].forEach(([title, action]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = action === 'godkjent' ? 'join-btn' : 'join-btn secondary';
      b.textContent = title;
      b.addEventListener('click', () => respondToRequest(r, action, b));
      actions.appendChild(b);
    });

    row.append(text, actions);
    requestList.appendChild(row);
  });
}

async function respondToRequest(r, action, btn) {
  btn.disabled = true;
  try {
    const res = await fetch('/api/requests/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: r.sessionId,
        studentId: r.studentId,
        userId: myId(),
        action
      })
    });
    const result = await res.json();
    sessionNote.textContent = result.message;
  } catch {
    sessionNote.textContent = 'Kunne ikke koble opp til serveren.';
  }
  loadSessions();   // also reloads the request list
}

courseForm.addEventListener('submit', async event => {
  event.preventDefault();
  const course = Object.fromEntries(new FormData(courseForm));
  try {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course)
    });
    const result = await response.json();
    courseMessage.textContent = result.message;
    if (response.ok) {
      courseForm.reset();
      fillCourses();   // refresh the dropdown in the create-session form
    }
  } catch {
    courseMessage.textContent = 'Kunne ikke koble opp til serveren.';
  }
});

sessionFilter.addEventListener('change', showSessions);