import userProfiles from "/data/userProfiles.json" with { type: "json" };

function createSession(currentUserProfile) {
    // sessionStorage.setItem("username", currentUserProfile["username"]);
    // sessionStorage.setItem("userID", currentUserProfile["id"]);
    // sessionStorage.setItem("firstname", currentUserProfile["firstname"]);
    // sessionStorage.setItem("lastname", currentUserProfile["lastname"]);
    // sessionStorage.setItem("password", currentUserProfile["password"]);
    // sessionStorage.setItem("email", currentUserProfile["email"]);

    Object.keys(currentUserProfile).forEach( function(key) {
        
        sessionStorage.setItem(key, currentUserProfile[key]);
    });

}

function login(event) {
    event.preventDefault();
    // what is this?

    let form = document.forms["loginForm"]; 
    let username = form["username"].value;
    let accountNotFoundAlert = alert("Account not found");
    
    if (typeof userProfiles[username] == typeof undefined){
        return accountNotFoundAlert, console.log(formInputs);
    }
    
    let email = form["email"].value;
    if (userProfiles[username]["email"] != email){
        
        return accountNotFoundAlert;
    }

    let password = form["password"].value;
    if (userProfiles[username]["password"] != password){
        return accountNotFoundAlert;
    }

    let currentUserProfile = userProfiles[username];
    createSession(currentUserProfile);
    window.location.href = "/homepage.html";
}


document.getElementById("loginForm")
        .addEventListener('submit', login);


