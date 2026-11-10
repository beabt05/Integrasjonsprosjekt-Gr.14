const sessionTitel = document.querySelector("#session-titel");
const sessionStart = document.querySelector("#session-start");
const sessionCapacity = document.querySelector("#session-capacity");
const sessionDate = document.querySelector("#session-date");
const courseCode = document.querySelector("#course-code-num");
const buildingName = document.querySelector("#bygningNo");
const roomNo = document.querySelector("#roomNo");
const submit_btn = document.getElementById("contact-submit");

let editing = null;   // the session object being edited, or null

function refreshList() {
  allSessions = [...createdSessions, ...allSessions.filter(s => !createdSessions.includes(s))];
  fillFilter();
  showSessions();
}

function clearForm() {
  sessionForm.reset();
  sessionCapacity.value = 3;
  editing = null;
  submit_btn.innerText = "send inn";
}

function startEdit(s) {
  editing = s;
  sessionTitel.value = s.tittel;
  sessionStart.value = s.starttid;
  sessionCapacity.value = s.ledigePlasser;
  sessionDate.value = s.dato;
  courseCode.value = s.emnekode;
  buildingName.value = s.bygning || "";
  roomNo.value = s.romnr || "";
  submit_btn.innerText = "oppdater økt";
  sessionForm.hidden = false;
  sessionForm.scrollIntoView({ behavior: "smooth" });
}

function removeSession(s) {
  createdSessions = createdSessions.filter(x => x !== s);
  allSessions = allSessions.filter(x => x !== s);
  if (editing === s) clearForm();
  refreshList();
}

submit_btn.addEventListener("click", function (e) {
  e.preventDefault();

  if (!sessionTitel.value || !sessionStart.value || !sessionCapacity.value ||
      !sessionDate.value || !courseCode.value) {
    alert("Vennligst fyll ut alle påkrevde felt!");
    return;
  }

  const bygning = buildingName.value.trim();
  const romnr = roomNo.value.trim();
  const data = {
    tittel: sessionTitel.value.trim(),
    beskrivelse: "",
    emnekode: courseCode.value,
    host: "Du",
    bygning,
    romnr,
    rom: `${bygning} ${romnr}`.trim(),
    dato: sessionDate.value,
    starttid: sessionStart.value,
    ledigePlasser: Number(sessionCapacity.value) || 0
  };

  if (editing) {
    Object.assign(editing, data);        // update in place
  } else {
    createdSessions.unshift({ id: Date.now(), ...data });
  }

  clearForm();
  sessionForm.hidden = true;
  refreshList();
});