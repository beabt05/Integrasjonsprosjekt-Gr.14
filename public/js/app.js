// Handle the user registration form on the front end.
const form = document.getElementById("userForm");
const message = document.getElementById("message");

// Prevent the browser from reloading the page and validate the form before sending data.
form.addEventListener("submit", function(event){
    event.preventDefault();

    const name = document.getElementById("name").value.trim()
    const email = document.getElementById("email").value.trim()
    const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-z0-9-]+\.)*ntnu\.no$/i;  //Regex handles email validation for active ntnu students (those holding an .ntnu account) 
    const role = document.getElementById("role").value;
    const password = document.getElementById("password").value

    // Basic validation so the API only receives usable account information.
    if (name.length < 2) {
        message.textContent = "Please enter a valid name.";
        return;
    }

      if (!emailRegex.test(email)) {
        message.textContent = "Please enter a valid ntnu email.";
        return;
    }

    // Package the data for the server as a single user object.
    const user = {
        name: name,
        email: email,
        password: password,
        role: role
    };


    // Send the registration data to the backend endpoint for processing.
    fetch("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({ username: name, email: email, password: password })
    })

    
    .then(response => response.json())
    .then(data => {
        message.textContent = data.message;
    })

    .catch(error => {
        console.error("registration error:", error)
    })



    

    

 });






