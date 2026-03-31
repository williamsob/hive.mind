const taskContainer = document.getElementById("table");
const taskCount = document.getElementById("task-count");
const pageTitle = document.getElementById("tasks-page-title");
const pageSubtitle = document.getElementById("tasks-page-subtitle");
const searchBar = document.getElementById("searchBar");
const createTaskButton = document.getElementById("createtask");
const deleteTaskButton = document.getElementById("deletetask");
const taskDialog = document.getElementById("task-dialog");
const taskForm = document.getElementById("task-form");
const taskNameInput = document.getElementById("task-name-input");
const taskDescriptionInput = document.getElementById("task-desc-input");
const taskDueDateInput = document.getElementById("task-due-date");
const taskFormCloseButtons = document.querySelectorAll("[data-close-task-form]");

const defaultUserId = "1";
const checkIcon = `
<svg viewBox="0 0 50 50" aria-hidden="true" focusable="false">
    <path d="M25 2C12.3 2 2 12.3 2 25s10.3 23 23 23 23-10.3 23-23S37.7 2 25 2Zm-3.4 32.1L11.8 24.4l3.4-3.4 6.2 6.2 13.4-13.4 3.4 3.4-16.6 16.9Z" fill="#4AAA16"/>
</svg>`;

let taskItems = [];
let selectedTaskIndex = null;

function wireNavigation() {
    const navTargets = {
        "study-group-chat-btn": "./homepage.html",
        "pomodoro-btn": "./pomodoro.html",
        "group-calendar-btn": "./calendar.html"
    };

    Object.entries(navTargets).forEach(([id, destination]) => {
        const button = document.getElementById(id);

        if (button) {
            button.addEventListener("click", () => {
                window.location.href = destination;
            });
        }
    });
}

function getCurrentUserId() {
    return sessionStorage.getItem("id") || defaultUserId;
}

function getCurrentUserName() {
    return sessionStorage.getItem("firstName") || sessionStorage.getItem("username") || "Your";
}

function getStorageKey() {
    return `hiveMind.tasks.${getCurrentUserId()}`;
}

function getDefaultDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split("T")[0];
}

function normalizeTask(task = {}, fallbackId = 1) {
    return {
        taskId: task.taskId ?? fallbackId,
        taskName: task.taskName || `Task ${fallbackId}`,
        taskDescription: task.taskDescription || "No details added yet.",
        taskDueDate: task.taskDueDate || getDefaultDueDate(),
        taskCompletionStatus: Boolean(task.taskCompletionStatus)
    };
}

function saveTasks() {
    localStorage.setItem(getStorageKey(), JSON.stringify(taskItems));
}

function formatDate(dateString) {
    const parsedDate = new Date(dateString);

    if (Number.isNaN(parsedDate.getTime())) {
        return dateString || "No due date";
    }

    return parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function getSortedTasks() {
    return [...taskItems].sort((taskA, taskB) => {
        const completionDifference = Number(Boolean(taskA.taskCompletionStatus)) - Number(Boolean(taskB.taskCompletionStatus));

        if (completionDifference !== 0) {
            return completionDifference;
        }

        return (Number(taskA.taskId) || 0) - (Number(taskB.taskId) || 0);
    });
}

function updateHeading() {
    const completedCount = taskItems.filter((task) => task.taskCompletionStatus).length;
    const userName = getCurrentUserName();

    if (pageTitle) {
        pageTitle.textContent = `${userName}'s Tasks`;
    }

    if (pageSubtitle) {
        pageSubtitle.textContent = `${taskItems.length} total • ${completedCount} completed • Use the tick to finish a task or click a row before deleting.`;
    }

    if (taskCount) {
        taskCount.textContent = String(taskItems.length).padStart(2, "0");
    }
}

function createEmptyState(message) {
    if (!taskContainer) {
        return;
    }

    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = message;
    taskContainer.appendChild(emptyState);
}

function toggleTaskCompletion(index) {
    const task = taskItems[index];

    if (!task) {
        return;
    }

    task.taskCompletionStatus = !task.taskCompletionStatus;

    if (task.taskCompletionStatus && selectedTaskIndex === index) {
        selectedTaskIndex = null;
    }

    saveTasks();
    updateHeading();
    renderTasks();
}

function createTaskRow(task, index) {
    if (!taskContainer) {
        return;
    }

    const row = document.createElement("div");
    row.className = `task-row${selectedTaskIndex === index ? " is-selected" : ""}${task.taskCompletionStatus ? " is-complete" : ""}`;
    row.setAttribute("role", "row");
    row.tabIndex = 0;

    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.className = `task-check${task.taskCompletionStatus ? " is-done" : ""}`;
    completeButton.innerHTML = checkIcon;
    completeButton.setAttribute(
        "aria-label",
        task.taskCompletionStatus ? `Mark task ${task.taskId} as incomplete` : `Mark task ${task.taskId} as complete`
    );

    completeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleTaskCompletion(index);
    });

    const idCell = document.createElement("div");
    idCell.className = "task-id-cell";
    idCell.textContent = task.taskId;

    const nameCell = document.createElement("div");
    nameCell.className = "task-name-cell";

    const titleLine = document.createElement("div");
    titleLine.className = "task-main-line";

    const taskTitle = document.createElement("span");
    taskTitle.className = "task-title";
    taskTitle.textContent = task.taskName;

    const statusChip = document.createElement("span");
    statusChip.className = `task-status ${task.taskCompletionStatus ? "done" : "pending"}`;
    statusChip.textContent = task.taskCompletionStatus ? "Completed" : "To do";

    const meta = document.createElement("p");
    meta.className = "task-meta";
    meta.textContent = `Due ${formatDate(task.taskDueDate)} • ${task.taskDescription}`;

    titleLine.appendChild(taskTitle);
    titleLine.appendChild(statusChip);
    nameCell.appendChild(titleLine);
    nameCell.appendChild(meta);

    row.appendChild(completeButton);
    row.appendChild(idCell);
    row.appendChild(nameCell);

    row.addEventListener("click", () => {
        selectedTaskIndex = index;
        renderTasks();
    });

    row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectedTaskIndex = index;
            renderTasks();
        }
    });

    taskContainer.appendChild(row);
}

function renderTasks() {
    if (!taskContainer) {
        return;
    }

    taskContainer.innerHTML = "";

    const query = (searchBar?.value || "").trim().toLowerCase();
    const filteredTasks = getSortedTasks().filter((task) => {
        return [task.taskId, task.taskName, task.taskDescription, task.taskDueDate]
            .some((value) => String(value || "").toLowerCase().includes(query));
    });

    if (!filteredTasks.length) {
        createEmptyState(query ? "No matching tasks for that search yet." : "No tasks available for this user yet.");
        return;
    }

    filteredTasks.forEach((task) => {
        createTaskRow(task, taskItems.indexOf(task));
    });
}

async function loadTasks() {
    try {
        let parsedTasks = [];
        const savedTasks = localStorage.getItem(getStorageKey());

        if (savedTasks) {
            const storedTasks = JSON.parse(savedTasks);
            if (Array.isArray(storedTasks)) {
                parsedTasks = storedTasks;
            }
        }

        const response = await fetch("../data/tasks.json");

        if (!response.ok) {
            throw new Error(`Unable to load tasks.json (${response.status})`);
        }

        const allTasks = await response.json();
        const starterTasks = (allTasks[getCurrentUserId()] || allTasks[defaultUserId] || [])
            .map((task, index) => normalizeTask({ ...task }, index + 1));
        const taskMap = new Map(starterTasks.map((task) => [String(task.taskId), task]));

        parsedTasks.forEach((task, index) => {
            const normalizedTask = normalizeTask({ ...task }, index + 1);
            const taskKey = String(normalizedTask.taskId);
            taskMap.set(taskKey, { ...taskMap.get(taskKey), ...normalizedTask });
        });

        taskItems = Array.from(taskMap.values()).map((task, index) => normalizeTask({ ...task }, index + 1));
        saveTasks();
    } catch (error) {
        console.error("Failed to load tasks:", error);
        taskItems = [];
    }

    updateHeading();
    renderTasks();
}

function openTaskDialog() {
    if (!taskDialog) {
        return;
    }

    taskForm?.reset();

    if (taskDueDateInput) {
        taskDueDateInput.value = getDefaultDueDate();
    }

    if (typeof taskDialog.showModal === "function") {
        if (!taskDialog.open) {
            taskDialog.showModal();
        }
    } else {
        taskDialog.setAttribute("open", "open");
    }

    taskNameInput?.focus();
}

function closeTaskDialog() {
    if (!taskDialog) {
        return;
    }

    if (typeof taskDialog.close === "function") {
        taskDialog.close();
    } else {
        taskDialog.removeAttribute("open");
    }
}

function addTask(event) {
    event.preventDefault();

    const taskName = taskNameInput?.value.trim();

    if (!taskName) {
        taskNameInput?.focus();
        return;
    }

    const highestTaskId = taskItems.reduce((maxId, task) => Math.max(maxId, Number(task.taskId) || 0), 0);

    taskItems.push(normalizeTask({
        taskId: highestTaskId + 1,
        taskName,
        taskDescription: taskDescriptionInput?.value.trim() || "No details added yet.",
        taskDueDate: taskDueDateInput?.value || getDefaultDueDate(),
        taskCompletionStatus: false
    }, highestTaskId + 1));

    selectedTaskIndex = taskItems.length - 1;
    saveTasks();
    updateHeading();
    renderTasks();
    closeTaskDialog();
}

function removeSelectedTask() {
    if (!taskItems.length || selectedTaskIndex === null || !taskItems[selectedTaskIndex]) {
        return;
    }

    taskItems.splice(selectedTaskIndex, 1);
    selectedTaskIndex = null;
    saveTasks();
    updateHeading();
    renderTasks();
}

wireNavigation();
taskFormCloseButtons.forEach((button) => button.addEventListener("click", closeTaskDialog));
createTaskButton?.addEventListener("click", openTaskDialog);
deleteTaskButton?.addEventListener("click", removeSelectedTask);
searchBar?.addEventListener("input", () => {
    selectedTaskIndex = null;
    renderTasks();
});
taskForm?.addEventListener("submit", addTask);
taskDialog?.addEventListener("click", (event) => {
    if (event.target === taskDialog) {
        closeTaskDialog();
    }
});
window.addEventListener("storage", (event) => {
    if (event.key === getStorageKey()) {
        loadTasks();
    }
});
loadTasks();

window.addRow = openTaskDialog;
window.removeLastRow = removeSelectedTask;
