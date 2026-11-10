const courses = [
  {
    code: "IDG2052",
    name: {
      en: "Programming",
      no: "Programmering"
    },
    description: {
      en: "A relaxed and friendly study group for anyone interested in programming.",
      no: "En avslappet og hyggelig kollokviegruppe for alle som er interessert i programmering."
    }
  },
  {
    code: "IDATG2208",
    name: {
      en: "Machine Learning",
      no: "Maskinlæring"
    },
    description: {
      en: "A relaxed and friendly study group for anyone interested in machine learning.",
      no: "En avslappet og hyggelig kollokviegruppe for alle som er interessert i maskinlæring."
    }
  },
  {
    code: "IDATG2102",
    name: {
      en: "Algorithmic Methods",
      no: "Algoritmiske metoder"
    },
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

let mode = 'login';

toRegister.addEventListener('click', () => {
  mode = 'register';
  submitButton.textContent = 'Registrer deg';
  toRegister.hidden = true;
  toLogin.hidden = false;
  navMessage.textContent = '';
});

toLogin.addEventListener('click', () => {
  mode = 'login';
  submitButton.textContent = 'Login';
  toLogin.hidden = true;
  toRegister.hidden = false;
  navMessage.textContent = '';
});

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const { email, password } = Object.fromEntries(new FormData(authForm));

  try {
    const response = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    navMessage.textContent = result.message;

    if (response.ok && mode === 'login') {
      window.location.href = '/index.html';
    }
  } catch {
    navMessage.textContent = 'Kunne ikke koble opp til serveren.';
  } 
});