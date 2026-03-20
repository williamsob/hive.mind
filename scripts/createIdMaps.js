import studyGroups from '../data/studyGroups.json' with {type : 'json'};
import userProfiles from '../data/userProfiles.json' with {type : 'json'};

let idToUsernameMap = {};
let idToGroupIdMap = {}; 
Object.entries(userProfiles).forEach( (profile) => {
    
    idToUsernameMap[profile[1]['id']] = profile[1]['firstName'] + " " + profile[1]['lastName'];
    idToGroupIdMap[profile[1]['id']] = profile[1]['groupsJoined'];

})


export {idToGroupIdMap, idToUsernameMap};