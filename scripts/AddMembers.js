import studyGroups from '../data/studyGroups.json' with { type : 'json'};
import { idToUsernameMap } from './createIdMaps.js';

const addMembers = document.getElementById('add-members-dropdown');
const placeholder = document.getElementById('placeholder-option');
let groupMembersAdded = new Set();

const groups = sessionStorage['groupsJoined'].split(",");

groups.forEach( (group) => {

    const groupMembers = studyGroups[group][0]; //returns the ids of groupMembers

    groupMembers.forEach( (groupMember) => {
        groupMembersAdded.add(2000);
        if (groupMember == sessionStorage.getItem('id')){
            return;
        }

        if (groupMembersAdded.has(groupMember)){
            return;
        }

        groupMembersAdded.add(groupMember);
        createOption(addMembers, String(groupMember));
    })

});

function createOption(selectElement, userID) {

    const option = document.createElement('Option');
    option.value = userID;
    option.className = 'team-members';
    option.innerHTML = idToUsernameMap[userID];
    selectElement.appendChild(option);
};

addMembers.addEventListener('change', (event) => {

    const membersSelected = [...addMembers.selectedOptions].filter(opt => opt !== placeholder);
    if (membersSelected.length > 0) {
        placeholder.selected = false;
        addMembers.style.color = 'black';
    } else {
        placeholder.selected = true;
        addMembers.style.color = 'grey';
    }
    console
})