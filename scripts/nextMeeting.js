const nextMeetingLabel = document.getElementById("welcome-next-meeting-date");

initializeNextMeeting();

async function initializeNextMeeting() {
    if (!nextMeetingLabel) {
        return;
    }

    try {
        const allMeetings = await loadMeetings();
        const joinedGroups = getJoinedGroups();

        if (!joinedGroups.length) {
            nextMeetingLabel.textContent = "No meeting set";
            return;
        }

        const nextMeetingDate = findNextMeetingDate(allMeetings, joinedGroups, new Date());
        nextMeetingLabel.textContent = nextMeetingDate
            ? formatDateDDMMYYYY(nextMeetingDate)
            : "No meeting set";
    } catch (error) {
        console.error("Unable to load next meeting.", error);
        nextMeetingLabel.textContent = "No meeting set";
    }
}

function getJoinedGroups() {
    const rawGroups = sessionStorage.getItem("groupsJoined");

    if (!rawGroups) {
        return [];
    }

    return rawGroups
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
}

async function loadMeetings() {
    const stored = localStorage.getItem("meetings");

    if (stored) {
        return JSON.parse(stored);
    }

    const response = await fetch("../data/meetings.json");
    if (!response.ok) {
        throw new Error(`Failed to fetch meetings.json: ${response.status}`);
    }

    const meetingData = await response.json();
    localStorage.setItem("meetings", JSON.stringify(meetingData));
    return meetingData;
}

function findNextMeetingDate(allMeetings, joinedGroups, now) {
    let nearestMeeting = null;

    joinedGroups.forEach((groupId) => {
        const groupMeetings = Array.isArray(allMeetings[groupId]) ? allMeetings[groupId] : [];

        groupMeetings.forEach((meeting) => {
            const candidateDate = getNextOccurrence(meeting, now);

            if (!candidateDate) {
                return;
            }

            if (!nearestMeeting || candidateDate < nearestMeeting) {
                nearestMeeting = candidateDate;
            }
        });
    });

    return nearestMeeting;
}

function getNextOccurrence(meeting, now) {
    const baseDate = parseMeetingDate(meeting?.date, meeting?.time);

    if (!baseDate) {
        return null;
    }

    if (!meeting.repeat) {
        return baseDate >= now ? baseDate : null;
    }

    const nextDate = new Date(now);
    nextDate.setSeconds(0, 0);

    const targetDay = baseDate.getDay();
    const currentDay = nextDate.getDay();
    let daysAhead = targetDay - currentDay;

    if (daysAhead < 0) {
        daysAhead += 7;
    }

    nextDate.setDate(nextDate.getDate() + daysAhead);
    nextDate.setHours(baseDate.getHours(), baseDate.getMinutes(), 0, 0);

    if (nextDate < now) {
        nextDate.setDate(nextDate.getDate() + 7);
    }

    return nextDate;
}

function parseMeetingDate(datePart, timePart = "00:00") {
    if (!datePart) {
        return null;
    }

    const [year, month, day] = String(datePart).split("-").map(Number);
    const [hours = 0, minutes = 0] = String(timePart).split(":").map(Number);

    if ([year, month, day].some((value) => Number.isNaN(value))) {
        return null;
    }

    return new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
}

function formatDateDDMMYYYY(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

