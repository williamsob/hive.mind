import meetingSeed from "../data/meetings.json" with { type: "json" };
import studyGroups from "../data/studyGroups.json" with { type: "json" };
import userProfiles from "../data/userProfiles.json" with { type: "json" };

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const START_HOUR = 7;
const END_HOUR = 21;
const SLOT_HEIGHT = 56;
const DEFAULT_DURATION_HOURS = 2;
const GROUP_COLORS = ["#DEA54B", "#007AFF", "#6E7E85", "#c57f17", "#3b82f6", "#4b5563"];

const calendarEl = document.getElementById("calendar");
const weekLabelEl = document.getElementById("weekLabel");
const subtitleEl = document.getElementById("calendarSubtitle");
const groupListEl = document.getElementById("groupList");
const meetingCountEl = document.getElementById("meetingCount");
const meetingSummaryEl = document.getElementById("meetingSummary");
const prevWeekBtn = document.getElementById("prevWeek");
const nextWeekBtn = document.getElementById("nextWeek");
const todayBtn = document.getElementById("todayBtn");

let currentWeekStart = getStartOfWeek(new Date());
let storedMeetings = getStoredMeetings();
const currentUser = getCurrentUserContext();

bindEvents();
renderCalendarPage();

function bindEvents() {
    prevWeekBtn.addEventListener("click", () => {
        currentWeekStart = addDays(currentWeekStart, -7);
        renderCalendarPage();
    });

    nextWeekBtn.addEventListener("click", () => {
        currentWeekStart = addDays(currentWeekStart, 7);
        renderCalendarPage();
    });

    todayBtn.addEventListener("click", () => {
        currentWeekStart = getStartOfWeek(new Date());
        renderCalendarPage();
    });

    window.addEventListener("storage", () => {
        storedMeetings = getStoredMeetings();
        renderCalendarPage();
    });
}

function renderCalendarPage() {
    storedMeetings = getStoredMeetings();
    const weekMeetings = getMeetingsForWeek(currentWeekStart);

    renderHeader();
    weekLabelEl.textContent = formatWeekRange(currentWeekStart);
    meetingCountEl.textContent = `${weekMeetings.length} meeting${weekMeetings.length === 1 ? "" : "s"}`;

    buildCalendarGrid(weekMeetings);
    renderMeetingSummary(weekMeetings);
}

function getStoredMeetings() {
    const stored = localStorage.getItem("meetings");

    if (!stored) {
        localStorage.setItem("meetings", JSON.stringify(meetingSeed));
        return JSON.parse(JSON.stringify(meetingSeed));
    }

    try {
        const parsed = JSON.parse(stored);
        if (!parsed || typeof parsed !== "object") {
            throw new Error("Invalid meetings payload.");
        }
        return parsed;
    } catch (error) {
        console.warn("Resetting meetings in localStorage.", error);
        localStorage.setItem("meetings", JSON.stringify(meetingSeed));
        return JSON.parse(JSON.stringify(meetingSeed));
    }
}

function getCurrentUserContext() {
    const profiles = Object.values(userProfiles);
    const sessionId = Number(sessionStorage.getItem("id"));
    const matchedProfile = profiles.find((profile) => profile.id === sessionId) ?? profiles[0] ?? null;
    const groupsFromSession = parseGroupIds(sessionStorage.getItem("groupsJoined"));
    const groupsFromProfile = Array.isArray(matchedProfile?.groupsJoined)
        ? matchedProfile.groupsJoined.map(String)
        : [];

    return {
        id: Number.isFinite(sessionId) && sessionId > 0 ? sessionId : matchedProfile?.id ?? null,
        firstName: sessionStorage.getItem("firstName") || matchedProfile?.firstName || "Your",
        groupsJoined: groupsFromSession.length ? groupsFromSession : groupsFromProfile,
    };
}

function parseGroupIds(rawValue) {
    if (!rawValue) {
        return [];
    }

    return String(rawValue)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
}

function renderHeader() {
    const groupNames = currentUser.groupsJoined
        .map((groupId) => studyGroups[groupId]?.[1])
        .filter(Boolean);

    const owner = currentUser.firstName === "Your" ? "Your" : `${currentUser.firstName}'s`;
    subtitleEl.textContent = groupNames.length
        ? `${owner} meetings from every study group you’re in. Use < and > to browse past and future weeks.`
        : `${owner} meetings will appear here once you join or schedule a group meeting.`;

    groupListEl.innerHTML = "";

    if (!groupNames.length) {
        const chip = document.createElement("span");
        chip.className = "group-chip muted";
        chip.textContent = "No groups joined";
        groupListEl.appendChild(chip);
        return;
    }

    groupNames.forEach((groupName) => {
        const chip = document.createElement("span");
        chip.className = "group-chip";
        chip.textContent = groupName;
        groupListEl.appendChild(chip);
    });
}

function getMeetingsForWeek(weekStart) {
    const weekStartDate = new Date(weekStart);
    weekStartDate.setHours(0, 0, 0, 0);

    const weekEndDate = addDays(weekStartDate, 6);
    weekEndDate.setHours(23, 59, 59, 999);

    const meetingsForWeek = [];

    currentUser.groupsJoined.forEach((groupId) => {
        const groupName = studyGroups[groupId]?.[1] || `Group ${groupId}`;
        const groupMeetings = Array.isArray(storedMeetings[groupId]) ? storedMeetings[groupId] : [];

        groupMeetings.forEach((meeting, index) => {
            const baseDate = parseMeetingDateTime(meeting.date, meeting.time);
            if (!baseDate) {
                return;
            }

            let occurrenceDate = null;

            if (meeting.repeat) {
                const weekDayIndex = getMondayBasedDayIndex(baseDate);
                const candidateDate = addDays(weekStartDate, weekDayIndex);
                candidateDate.setHours(baseDate.getHours(), baseDate.getMinutes(), 0, 0);

                if (candidateDate >= baseDate && candidateDate <= weekEndDate) {
                    occurrenceDate = candidateDate;
                }
            } else if (baseDate >= weekStartDate && baseDate <= weekEndDate) {
                occurrenceDate = baseDate;
            }

            if (!occurrenceDate) {
                return;
            }

            meetingsForWeek.push({
                ...meeting,
                key: `${groupId}-${meeting.id ?? index}-${occurrenceDate.toISOString()}`,
                groupId,
                groupName,
                occurrenceDate,
                durationHours: Number(meeting.duration) || DEFAULT_DURATION_HOURS,
            });
        });
    });

    return meetingsForWeek.sort((firstMeeting, secondMeeting) => firstMeeting.occurrenceDate - secondMeeting.occurrenceDate);
}

function buildCalendarGrid(weekMeetings) {
    calendarEl.innerHTML = "";

    const cornerCell = document.createElement("div");
    cornerCell.className = "corner-cell";
    cornerCell.textContent = "Time";
    calendarEl.appendChild(cornerCell);

    DAYS.forEach((dayName, dayIndex) => {
        const date = addDays(currentWeekStart, dayIndex);
        const header = document.createElement("div");
        header.className = "day-header";

        if (isSameDay(date, new Date())) {
            header.classList.add("today");
        }

        const dayLabel = document.createElement("span");
        dayLabel.className = "day-name";
        dayLabel.textContent = dayName;

        const dateLabel = document.createElement("span");
        dateLabel.className = "day-date";
        dateLabel.textContent = formatDayDate(date);

        header.appendChild(dayLabel);
        header.appendChild(dateLabel);
        calendarEl.appendChild(header);
    });

    for (let hour = START_HOUR; hour < END_HOUR; hour += 1) {
        const timeCell = document.createElement("div");
        timeCell.className = "time-cell";
        timeCell.textContent = formatHour(hour);
        calendarEl.appendChild(timeCell);

        DAYS.forEach((_, dayIndex) => {
            const cell = document.createElement("div");
            cell.className = "day-cell";
            cell.dataset.dayIndex = String(dayIndex);
            cell.dataset.hour = String(hour);

            if (isSameDay(addDays(currentWeekStart, dayIndex), new Date())) {
                cell.classList.add("today-column");
            }

            calendarEl.appendChild(cell);
        });
    }

    renderMeetingBlocks(weekMeetings);
}

function renderMeetingBlocks(weekMeetings) {
    weekMeetings.forEach((meeting) => {
        const startDate = meeting.occurrenceDate;
        const startHour = startDate.getHours();
        const startMinutes = startDate.getMinutes();
        const dayIndex = getMondayBasedDayIndex(startDate);

        if (startHour < START_HOUR || startHour >= END_HOUR) {
            return;
        }

        const targetCell = calendarEl.querySelector(`.day-cell[data-day-index="${dayIndex}"][data-hour="${startHour}"]`);
        if (!targetCell) {
            return;
        }

        const meetingCard = document.createElement("article");
        meetingCard.className = "meeting";
        meetingCard.style.top = `${(startMinutes / 60) * SLOT_HEIGHT}px`;
        meetingCard.style.height = `${Math.max((meeting.durationHours * SLOT_HEIGHT) - 6, 34)}px`;
        meetingCard.style.background = getGroupColor(meeting.groupId);
        meetingCard.title = `${meeting.title} (${meeting.groupName})`;

        const groupLabel = document.createElement("strong");
        groupLabel.textContent = meeting.groupName;

        const titleLabel = document.createElement("span");
        titleLabel.textContent = meeting.title;

        const metaLabel = document.createElement("small");
        metaLabel.textContent = `${formatTimeRange(meeting.occurrenceDate, meeting.durationHours)} • ${formatDuration(meeting.durationHours)} meeting`;

        meetingCard.appendChild(groupLabel);
        meetingCard.appendChild(titleLabel);
        meetingCard.appendChild(metaLabel);
        targetCell.appendChild(meetingCard);
    });
}

function renderMeetingSummary(weekMeetings) {
    meetingSummaryEl.innerHTML = "";

    if (!weekMeetings.length) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";
        emptyState.textContent = "No meetings are scheduled for this week yet. Use the arrows above to browse to another week or add a new one from the schedule page.";
        meetingSummaryEl.appendChild(emptyState);
        return;
    }

    weekMeetings.forEach((meeting) => {
        const summaryCard = document.createElement("article");
        summaryCard.className = "summary-card";

        const summaryRow = document.createElement("div");
        summaryRow.className = "summary-row";

        const dot = document.createElement("span");
        dot.className = "summary-dot";
        dot.style.background = getGroupColor(meeting.groupId);

        const textWrap = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = meeting.title;

        const group = document.createElement("p");
        group.className = "summary-group";
        group.textContent = meeting.groupName;

        textWrap.appendChild(title);
        textWrap.appendChild(group);
        summaryRow.appendChild(dot);
        summaryRow.appendChild(textWrap);

        const meta = document.createElement("p");
        meta.className = "summary-meta";
        meta.textContent = `${formatAgendaDate(meeting.occurrenceDate)} • ${formatTimeRange(meeting.occurrenceDate, meeting.durationHours)} • ${formatDuration(meeting.durationHours)} • ${meeting.repeat ? "Repeats weekly" : "One-off meeting"}`;

        summaryCard.appendChild(summaryRow);
        summaryCard.appendChild(meta);
        meetingSummaryEl.appendChild(summaryCard);
    });
}

function parseMeetingDateTime(datePart, timePart = "00:00") {
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

function getStartOfWeek(dateInput) {
    const date = new Date(dateInput);
    date.setHours(0, 0, 0, 0);

    const day = date.getDay();
    const difference = (day + 6) % 7;
    date.setDate(date.getDate() - difference);
    return date;
}

function addDays(dateInput, numberOfDays) {
    const date = new Date(dateInput);
    date.setDate(date.getDate() + numberOfDays);
    return date;
}

function getMondayBasedDayIndex(dateInput) {
    return (dateInput.getDay() + 6) % 7;
}

function isSameDay(firstDate, secondDate) {
    return firstDate.getFullYear() === secondDate.getFullYear()
        && firstDate.getMonth() === secondDate.getMonth()
        && firstDate.getDate() === secondDate.getDate();
}

function formatHour(hour) {
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = (hour % 12) || 12;
    return `${hour12}:00 ${suffix}`;
}

function formatDayDate(dateInput) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
    }).format(dateInput);
}

function formatWeekRange(weekStart) {
    const weekEnd = addDays(weekStart, 6);
    const startLabel = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
    }).format(weekStart);
    const endLabel = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
    }).format(weekEnd);

    return `${startLabel} – ${endLabel}`;
}

function formatAgendaDate(dateInput) {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
    }).format(dateInput);
}

function formatTimeRange(startDate, durationHours) {
    const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
    const formatter = new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit",
    });

    return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
}

function formatDuration(durationHours) {
    return `${Number.isInteger(durationHours) ? durationHours : durationHours.toFixed(1)} hr${durationHours === 1 ? "" : "s"}`;
}

function getGroupColor(groupId) {
    const numericGroupId = Number(groupId);
    const colorIndex = Number.isNaN(numericGroupId)
        ? 0
        : Math.abs(numericGroupId - 1) % GROUP_COLORS.length;

    return GROUP_COLORS[colorIndex];
}
