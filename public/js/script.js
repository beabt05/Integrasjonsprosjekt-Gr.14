const courses = [
  {
    code: "IDG2052",
    name: { en: "Programming", no: "Programmering" },
    description: {
      en: "A relaxed and friendly study group for anyone interested in programming.",
      no: "En avslappet og hyggelig kollokviegruppe for alle som er interessert i programmering."
    }
  },
  {
    code: "IDATG2208",
    name: { en: "Machine Learning", no: "Maskinlæring" },
    description: {
      en: "A relaxed and friendly study group for anyone interested in machine learning.",
      no: "En avslappet og hyggelig kollokviegruppe for alle som er interessert i maskinlæring."
    }
  },
  {
    code: "IDATG2102",
    name: { en: "Algorithmic Methods", no: "Algoritmiske metoder" },
    description: {
      en: "A relaxed and friendly study group for anyone interested in algorithms.",
      no: "En avslappet og hyggelig kollokviegruppe for alle som er interessert i algoritmer."
    }
  }
];

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

authForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // TEMP: Frontend preview only. No server request or authentication.
  // Restore backend authentication before using real accounts.
  mainScreen.hidden = false;
  authModal.close();
});

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

  // Extra info, shown when the card is clicked
  const more = document.createElement('div');
  more.className = 'session-more';
  more.hidden = true;
  more.append(cell(`Rom: ${s.rom || 'ikke oppgitt'}`, `Dato: ${s.dato || ''}`));

  // Edit/remove only for sessions created with the form
  if (createdSessions.includes(s)) {
    const actions = document.createElement('div');
    actions.className = 'session-actions';
    ['edit', 'remove'].forEach(kind => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = kind;
      b.textContent = kind;
      b.addEventListener('click', e => {
        e.stopPropagation();         // don't toggle the card
        if (kind === 'edit') startEdit(s);      // defined in crud.js
        else removeSession(s);                  // defined in crud.js
      });
      actions.appendChild(b);
    });
    more.appendChild(actions);
  }

  const toggle = () => { more.hidden = !more.hidden; };
  card.addEventListener('click', toggle);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter') toggle();
  });

  card.append(row, more);
  return card;
}

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

async function loadSessions() {
  let fetched;
  try {
    const res = await fetch('/api/sessions');
    if (!res.ok) throw new Error('bad response');
    fetched = await res.json();
    sessionNote.textContent = '';
  } catch {
    fetched = MOCK_SESSIONS;
    sessionNote.textContent = 'Viser eksempeldata (fikk ikke kontakt med serveren).';
  }
  allSessions = [...createdSessions, ...fetched];
  fillFilter();
  showSessions();
}

sessionFilter.addEventListener('change', showSessions);