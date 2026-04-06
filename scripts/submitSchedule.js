import { idToGroupIdMap } from "./createIdMaps.js";
import { splitDate } from "./scheduleDate.js";
import inputInThePast from "./scheduleDate.js";
import meetings from "../data/meetings.json" with { type : "json"};

const meetingForm = document.forms['meeting-form'];
const addMembers = document.getElementById('add-members-dropdown');
const chooseGroup = document.getElementById('choose-group-dropdown');
const placeholder = document.getElementById('placeholder-option');
const placeholder2 = document.getElementById('placeholder-option-2');
let groupMeetings = [];

function initialiseStoredMeetings() {
    const stored = localStorage.getItem('meetings');
    if (!stored) {
        localStorage.setItem('meetings', JSON.stringify(meetings));
    }
    return stored ? JSON.parse(stored) : meetings;
}

let storedMeetings = initialiseStoredMeetings();

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
    let teammateIDs = [];
    for (let i = 0; i < membersSelected.length; i++) {
        const option = membersSelected[i];
        const teammateID = option.value;
        const teammateGroupsJoined = idToGroupIdMap[teammateID];

        if (teammateGroupsJoined.includes(groupSelected) == false) {
            alert(`${option.innerText} isn't a part of the ${groupsSelected[0].innerText}.`);
            return;
        }

        teammateIDs.push(teammateID);        
    }

    const meetingDateTime = document.getElementById('meeting-date-input').value;
    
    if (inputInThePast(meetingDateTime)){
        return alert('Date cannot be in the past.');
    }

    function dataToJSON(meetingTitle, meetingMembers, 
        meetingGroup, meetingDate, meetingTime,
        repeatOption, meetingsScheduled ){
            
            const meetingJSON = {
                "id": meetingsScheduled.length + 1,
                "title" : meetingTitle,
                "date" : meetingDate,
                "time" : meetingTime,
                "members" : meetingMembers,
                "repeat" : repeatOption
            };

        return meetingJSON;
    }

    groupMeetings = storedMeetings[groupSelected];

    let [meetingDate, meetingTime] = meetingDateTime.split("T");
    const meetingTitle = document.getElementById('meeting-name').value;
    const meetingJSON = dataToJSON(meetingTitle, teammateIDs, groupSelected, meetingDate, meetingTime, true, groupMeetings);

    if (groupMeetings in storedMeetings){
        
    }
    groupMeetings.push(meetingJSON);

    storedMeetings[groupSelected] = groupMeetings;
    localStorage.setItem('meetings', JSON.stringify(storedMeetings));
    
    console.log("Meeting saved to localStorage:", meetingJSON);
    alert("Meeting added successfully!");
    
});