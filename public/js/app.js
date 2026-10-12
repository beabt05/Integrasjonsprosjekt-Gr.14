// Handle the user registration form on the front end.
const form = document.getElementById("userForm");
const message = document.getElementById("message");

// Prevent the browser from reloading the page and validate the form before sending data.
form.addEventListener("submit", function(event){
    event.preventDefault();

    const name = document.getElementById("name").value.trim()
    const email = document.getElementById("email").value.trim()
    const role = document.getElementById("role").value;
    const password = document.getElementById("password").value

    // Basic validation so the API only receives usable account information.
    if (name.length < 2) {
        message.textContent = "Please enter a valid name.";
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
    fetch("/register", {
        method: "POST",
        body: new URLSearchParams({ name: name, email: email, password: password })
    })

    .then(response => response.text())
        .then(text => {
            // The response can be used to show a success or error message to the user.
        })
 });