const sessionCard = document.querySelector("#sessionCard");
const sessionTitel = document.querySelector("#session-titel");
const sessionStart = document.querySelector("#session-start");
const sessionCapacity = document.querySelector("#session-capacity");
const sessionDate = document.querySelector("#session-date");
const courseCode = document.querySelector("#course-code-num");
const submit_btn = document.getElementById("contact-submit");
const buildingName = document.querySelector("#bygningNo");


const clearAll_btn = document.getElementById("clearAll");
let editRow = null;

const fields = [
   ["session-title", sessionTitel],
   ["session-start", sessionStart],
   ["session-capacity", sessionCapacity],
   ["session-date", sessionDate],
   ["course-code", courseCode], 
   ["building-name", buildingName]
];

// Create or update a session
submit_btn.addEventListener("click", function (e) {
   e.preventDefault();

   const values = fields.map(([className, input]) => input.value);

   if (values.some(value => !value)) {
      alert("Vennligst fyll ut alle påkrevde felt!");
      return;
   }

   if (editRow) {
      fields.forEach(([className], index) => {
         editRow.querySelector("." + className).textContent = values[index];
      });

      editRow = null;
      submit_btn.innerText = "send inn";
   } else {

      fetch("/api/studieokter", {
      method: "POST",
      body: new URLSearchParams({
         title: sessionTitel.value,
         start: sessionStart.value,
         capacity: sessionCapacity.value,
         date: sessionDate.value,
         courseCode: courseCode.value,
         buildingName: buildingName.value,
         opprettet_av: localStorage.getItem("userId")
      })
   })
   .then(response => {
      if (!response.ok) {
         throw new Error("Could not save the session");
      }
      return response.text();
      //return response.json();
   })
   .then(data => {
      console.log("Session saved:", data);
   })
   .catch(error => {
      console.error(error);
   });   

      addSessionDOM(values);
   }

   sessionTitel.value = "";
   sessionStart.value = "";
   sessionCapacity.value = "";
   sessionDate.value = "";
   courseCode.value = "";
   buildingName.value = "";
});





// Create a car

function addSessionDOM(values) {
   const studysession = document.createElement("div");
   studysession.className = "container";

   studysession.innerHTML = `
      <article class="session-card" id="sessionItem">
         <p class="item-session-date">
            <strong></strong>
            <span class="session-date"></span>
         </p>
         <h2 id="item-title" class="session-title"></h2>

         <p>
            <strong>Emne:</strong>
            <span class="course-code"></span>
         </p>
         
         <p>
            
            <span class="building-name"></span>
         </p>
         

         <p>
            <strong>Starttid:</strong>
            <span class="session-start"></span>
         </p>

         <p>
            <strong>Maks deltakere:</strong>
            <span class="session-capacity"></span>
         </p>
         <p>
            <strong>Vert:</strong>
            <span class="session-host"></span>
         </p>

         <div class="session-actions">
            <button type="button" class="edit">edit</button>
            <button type="button" class="remove">remove</button>
         </div>
      </article>
   `;

   fields.forEach(([className], index) => {
      studysession.querySelector("." + className).textContent = values[index];
   });


   studysession.querySelector(".session-host").textContent =
    localStorage.getItem("username") || "";

   sessionCard.appendChild(studysession);
}

// Edit or remove a card
sessionCard.addEventListener("click", function (e) {
   const button = e.target.closest("button");
   if (!button) return;

   const content = button.closest(".session-card");
   if (!content) return;

   const studysession = content.parentElement;

   if (button.classList.contains("remove")) {
      studysession.remove();

      if (editRow === studysession) {
         editRow = null;
         submit_btn.innerText = "send inn";
      }
   } else if (button.classList.contains("edit")) {
      editRow = studysession;

      fields.forEach(([className, input]) => {
         input.value = content.querySelector("." + className).textContent;
      });

      submit_btn.innerText = "oppdater økt";
   }
});

// Clear all cards
clearAll_btn.addEventListener("click", function (e) {
   e.preventDefault();
   sessionCard.innerHTML = "";
   editRow = null;
   submit_btn.innerText = "send inn";
});