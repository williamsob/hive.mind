import groups from "../data/studyGroups.json" with { type : "json" };
import userProfiles from "../data/userProfiles.json" with { type : "json"};
import { idToUsernameMap } from "./createIdMaps.js";

function createStudyGroup() {
    const studyGroupContainer = document.getElementById("study-group-container");
    const groupsJoined = sessionStorage.getItem("groupsJoined").split(",");
    const currentUserId = parseInt(sessionStorage.getItem("id"));
    let groupMembersAdded = new Set();

    studyGroupContainer.innerHTML = '';

    groupsJoined.forEach(groupId => {
        const group = groups[groupId];

        if (!group) return;

        const memberIds = group[0];
        const groupName = group[1];

        memberIds.forEach(memberId => {
            if (memberId === currentUserId){
                return;
            }

            // if (groupMembersAdded.has(memberId)){
                
            //     return;
            // }

            if (groupMembersAdded.has(memberId)){
                const labelContainer = document.getElementById("tm-label-container" + memberId);
                
                const groupLabel = document.createElement("tm-label-container");
                groupLabel.className = "tm-profile-label font-semibold";
                groupLabel.innerText = groupName;
                labelContainer.appendChild(groupLabel);
                return;
            }

            groupMembersAdded.add(memberId);

            let memberProfile = userProfiles[memberId];
            for (const username in userProfiles) {
                if (userProfiles[username].id === memberId) {
                    memberProfile = userProfiles[username];
                    break;
                }
                
            }
            if (!memberProfile) return;

            const teammateProfileContainer = document.createElement("div");
            teammateProfileContainer.className = "tm-profile-container";

            const teammatePfpContainer = document.createElement("div");
            teammatePfpContainer.className = "tm-pfp-container";

            const labelContainer = document.createElement("div");
            labelContainer.className = "tm-label-container";
            labelContainer.id = "tm-label-container" + memberId;

            const nameLabel = document.createElement("label");
            nameLabel.className = "tm-profile-label";
            nameLabel.innerText = memberProfile.firstName +" "+ memberProfile.lastName;

            const groupLabel = document.createElement("label");
            groupLabel.className = "tm-profile-label font-semibold";
            groupLabel.innerText = groupName;

            labelContainer.appendChild(nameLabel);
            labelContainer.appendChild(groupLabel);
            teammateProfileContainer.appendChild(teammatePfpContainer);
            teammateProfileContainer.appendChild(labelContainer);
            studyGroupContainer.appendChild(teammateProfileContainer);
        });
    });
}

createStudyGroup();
{/* <div id="study-group-container" class="flex flex-col space-y-5 pt-1 pb-2 border-x-2 border-y-2 w-full items-center h-[24.5rem] lg:h-96 overflow-y-scroll">

                        
                        <div class="tm-profile-container">
                            <div class="tm-pfp-container">

                            </div>

                            <div class="flex flex-col space-y-2">
                                <label class="tm-profile-label">
                                    First name Second name
                                </label>

                                <label class="tm-profile-label font-medium">
                                    Group name
                                </label>
                            </div>
                        </div>*/}
