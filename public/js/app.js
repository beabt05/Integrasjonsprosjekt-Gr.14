const form = document.getElementById("userForm");
const message = document.getElementById("message");

form.addEventListener("submit", function(event){
    event.preventDefault();

    const name = document.getElementById("name").value.trim()
    const email = document.getElementById("email").value.trim()
    const role = document.getElementById("role").value;

    if (name.length < 2) {
        message.textContent = "Please enter a valid name.";
        return;
    }

    const user = {
        name: name,
        email: email,
        role: role
    };

    console.log(user);
    message.textContent = "User Created"

 });