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
const usernameInput = document.querySelector('#navUsername');
const passwordInput = document.querySelector('#navPassword');

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


// authForm lock reads the inputs and sends them to /api/auth/login or /api/auth/register in server.js.

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const { username, email, password } =
  Object.fromEntries(new FormData(authForm));

  try {
    const response = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const result = await response.json();

   
console.log("Login response:", result);

  if (response.ok && mode === "login") {
      localStorage.setItem("userId", result.userId);
      localStorage.setItem("username", result.username);

      document.getElementById("welcomeMessage").textContent =
          `Velkommen, ${result.username}!`;
  }

  navMessage.textContent = result.message;

  if (response.ok && mode === "login") {
      mainScreen.hidden = false;
      authModal.close();
  }
  } catch (err) {
    console.error("Login error:", err);
    navMessage.textContent = 'Kunne ikke koble opp til serveren.';
}
});

document.getElementById('logoutLink').addEventListener('click', (event) => {
  event.preventDefault();

  localStorage.removeItem('userId');
  localStorage.removeItem('username');

  window.location.reload();
});

const authModal = document.querySelector("#authModal");
const mainScreen = document.querySelector("#mainScreen");

authModal.showModal();

const sessionCourseSelect = document.getElementById('course-code');

async function loadSessionCourses() {
  try{
    const response = await fetch('/api/emner');
    if (!response.ok) throw new Error('Kunne ikke hente emner.');

    const emner = await response.json();
    const selectedCode = sessionCourseSelect.value;

    sessionCourseSelect.replaceChildren(new Option('Velg emne', ''));

    for (const { emnekode } of emner) {
      sessionCourseSelect.add(new Option(emnekode, emnekode));
    }

    if (emner.some(({emnekode})=> emnekode === selectedCode)) {
      sessionCourseSelect.value = selectedCode;
    }

  } catch (error) {
    console.error(error);
    if (sessionCourseSelect.options.length == 0) {
      sessionCourseSelect.addEventListener(new Option('Kunne ikke hente emner', ''));
    }
  }
}

loadSessionCourses();

const courseName = document.querySelector("#kurs_navn");
const courseForm = document.querySelector("#kursansvarlig");

courseForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(courseForm);
  const course = {
    emnekode: data.get("emne-kode"),
    navn_no: courseName.value.trim(),
    navn_en: data.get("navn_en"),
    beskrivelse_no: data.get("beskrivelse_no"),
    beskrivelse_en: data.get("beskrivelse_en")
  };

  try {
    const response = await fetch("/api/emner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(course)
    });

    const result = await response.json();
    alert(result.message);

    if (response.ok) {
      await loadSessionCourses();
    }
  } catch (error) {
    console.error("Feil ved lagring av emne:", error);
    alert("Kunne ikke lagre emnet.");
  }
});