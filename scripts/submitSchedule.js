import { idToGroupIdMap } from "./createIdMaps.js";
const meetingForm = document.forms['meeting-form'];
const addMembers = document.getElementById('add-members-dropdown');
const chooseGroup = document.getElementById('choose-group-dropdown');
const placeholder = document.getElementById('placeholder-option');
const placeholder2 = document.getElementById('placeholder-option-2');

console.log('This is the group mapping:', idToGroupIdMap);
meetingForm.addEventListener('submit', (event) => {
    event.preventDefault(event);

    const membersSelected = [...addMembers.selectedOptions].filter((option) => option !== placeholder);
    const groupsSelected = [...chooseGroup.selectedOptions].filter( (option) => option !== placeholder2);
    
    if (groupsSelected.length === 0){
        return alert("Select group to meet with.");
    }

    if (membersSelected.length === 0){
        return alert("Select members to add to this meeting.");
    }

    const groupSelected = Number(groupsSelected[0].value);

    for (let i = 0; i < membersSelected.length; i++) {
        const option = membersSelected[i];
        const teammateID = option.value;
        const teammateGroupsJoined = idToGroupIdMap[teammateID];

        if (teammateGroupsJoined.includes(groupSelected) == false) {
            alert(`${option.innerText} isn't a part of the ${groupsSelected[0].innerText}.`);
            return;
        }
    }


    
});