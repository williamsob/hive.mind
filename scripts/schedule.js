import studyGroups from '../data/studyGroups.json' with {type : 'json'};
import userProfiles from '../data/userProfiles.json' with {type : 'json'};

console.log(sessionStorage);
const addMembers = document.getElementById('add-members-dropdown');


const groups = sessionStorage['groupsJoined'].split(",");

groups.forEach( (group) => {

    const groupMembers = studyGroups[group][0]; //returns the ids of groupMembers
    groupMembers.forEach( (groupMember) => {
        
        createOption(addMembers, String(groupMember));
    })

});


function createOption(select, userID) {
    const userProfile = userProfiles[userID];

    for (username in userProfiles){
        if () 
    }
    console.log(userID + "   4v");
    const option = document.createElement('Option');
    option.value = userProfile['id'];
    option.innerHTML = userProfile['firstName'] + ' ' + userProfile['lastName'] + '.';
    select.appendChild(option);
};