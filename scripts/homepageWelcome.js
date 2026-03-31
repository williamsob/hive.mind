console.log(sessionStorage);


function getProfileColour(seedText) {

    return `hsl(${Math.floor(Math.random() * 360)}, 65%, 70%)`;
}

function getInitials(firstName, lastName) {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
}

let welcomeUsername = document.getElementById("welcome-username");
const welcomePfp = document.getElementById("welcome-pfp");
const firstName = sessionStorage.getItem("firstName") || "???";
const lastName = sessionStorage.getItem("lastName") || "";
const username = sessionStorage.getItem("username") || firstName;

welcomeUsername.innerText = firstName;

if (welcomePfp) {
    welcomePfp.innerText = getInitials(firstName, lastName);
    welcomePfp.style.backgroundColor = getProfileColour(username);
}