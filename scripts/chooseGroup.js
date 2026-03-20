import studyGroups from "../data/studyGroups.json" with { type : 'json'};

const chooseGroup = document.getElementById('choose-group-dropdown');
const placeholder = document.getElementById('placeholder-option-2');
const groups = sessionStorage['groupsJoined'].split(",");

groups.forEach( (group) => {
    const option = document.createElement('option');
    option.value = group;
    option.innerHTML = studyGroups[group][1];
    chooseGroup.appendChild(option);
});
