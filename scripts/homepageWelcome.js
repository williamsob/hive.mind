console.log(sessionStorage);

let welcomeUsername = document.getElementById("welcome-username");
welcomeUsername.innerText = sessionStorage.getItem("firstName") || "???";