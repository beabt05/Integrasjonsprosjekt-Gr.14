const sessionTitel = document.querySelector("#session-titel");
const sessionStart = document.querySelector("#session-start");
const sessionEnd = document.querySelector("#session-end");
const sessionCapacity = document.querySelector("#session-capacity");
const sessionDate = document.querySelector("#session-date");
const courseCode = document.querySelector("#course-code-num");
const buildingName = document.querySelector("#bygningNo");
const roomNo = document.querySelector("#roomNo");
const submit_btn = document.getElementById("contact-submit");
const sessionMessage = document.getElementById("session-message");

function clearForm() {
  sessionForm.reset();
  sessionCapacity.value = 3;
}

submit_btn.addEventListener("click", async function (e) {
  e.preventDefault();

  if (!sessionTitel.value || !sessionStart.value || !sessionEnd.value ||
      !sessionCapacity.value || !sessionDate.value || !courseCode.value) {
    alert("Vennligst fyll ut alle påkrevde felt!");
    return;
  }

  const userId = localStorage.getItem("userId");
  if (!userId) {
    sessionMessage.textContent = "Du må logge inn først.";
    return;
  }

  const data = {
    tittel: sessionTitel.value.trim(),
    emnekode: courseCode.value,
    bygning: buildingName.value.trim(),
    host: localStorage.getItem("username"),
    rom: roomNo.value.trim(),
    dato: sessionDate.value,
    starttid: sessionStart.value,
    sluttid: sessionEnd.value,
    maks_deltakere: Number(sessionCapacity.value),
    userId: Number(userId)
  };

  try {
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    sessionMessage.textContent = result.message;

    if (response.ok) {
      clearForm();
      sessionForm.hidden = true;
      loadSessions();            // reload the list from the server
    }
  } catch {
    sessionMessage.textContent = "Kunne ikke koble opp til serveren.";
  }
});