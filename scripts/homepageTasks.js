import tasks from "../data/tasks.json" with { type: "json" };
import Btn from "../data/taskBtn.js";

const defaultUserId = "1";

function getCurrentUserId() {
    return sessionStorage.getItem("id") || defaultUserId;
}

function getStorageKey() {
    return `hiveMind.tasks.${getCurrentUserId()}`;
}

function normalizeTask(task = {}, fallbackId = 1) {
    return {
        taskId: task.taskId ?? fallbackId,
        taskName: task.taskName || `Task ${fallbackId}`,
        taskDescription: task.taskDescription || "No details added yet.",
        taskDueDate: task.taskDueDate || "No due date",
        taskCompletionStatus: Boolean(task.taskCompletionStatus)
    };
}

function formatDueDate(dateString) {
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

function mergeWithStarterTasks(savedTasks = []) {
    const starterTasks = (tasks[getCurrentUserId()] || tasks[defaultUserId] || [])
        .map((task, index) => normalizeTask(task, index + 1));
    const taskMap = new Map(starterTasks.map((task) => [String(task.taskId), task]));

    savedTasks.forEach((task, index) => {
        const normalizedTask = normalizeTask(task, index + 1);
        const taskKey = String(normalizedTask.taskId);
        taskMap.set(taskKey, { ...taskMap.get(taskKey), ...normalizedTask });
    });

    return Array.from(taskMap.values());
}

function loadCurrentUserTasks() {
    let parsedTasks = [];
    const savedTasks = localStorage.getItem(getStorageKey());

    if (savedTasks) {
        try {
            const storedTasks = JSON.parse(savedTasks);

            if (Array.isArray(storedTasks)) {
                parsedTasks = storedTasks;
            }
        } catch (error) {
            console.warn("Unable to read saved homepage tasks:", error);
        }
    }

    const mergedTasks = mergeWithStarterTasks(parsedTasks);
    localStorage.setItem(getStorageKey(), JSON.stringify(mergedTasks));
    return mergedTasks;
}

function createTasks() {
    const taskContainer = document.getElementById("task-container-with-scroll");
    const taskBtn = Btn;

    if (!taskContainer) {
        return;
    }

    taskContainer.innerHTML = "";

    const currentUserTasks = loadCurrentUserTasks().sort((taskA, taskB) => {
        const completionDifference = Number(Boolean(taskA.taskCompletionStatus)) - Number(Boolean(taskB.taskCompletionStatus));

        if (completionDifference !== 0) {
            return completionDifference;
        }

        return (Number(taskA.taskId) || 0) - (Number(taskB.taskId) || 0);
    });

    if (!currentUserTasks.length) {
        taskContainer.innerHTML = '<p class="text-center text-gray-700 py-4">No tasks available yet.</p>';
        return;
    }

    currentUserTasks.forEach((element) => {
        const taskBorder = document.createElement("div");
        taskBorder.className = "home-task-border";

        const task = document.createElement("div");
        task.className = "home-task";

        const labelContainer = document.createElement("div");
        labelContainer.className = "home-task-label-container";

        const taskName = document.createElement("label");
        taskName.className = "home-task-label";
        taskName.innerText = element.taskName;

        const taskDueDate = document.createElement("label");
        taskDueDate.className = "home-task-label";
        taskDueDate.innerText = `Due Date: ${formatDueDate(element.taskDueDate)}`;

        const taskBtnContainer = document.createElement("div");
        taskBtnContainer.className = "home-task-btn";
        taskBtnContainer.innerHTML = taskBtn;
        taskBtnContainer.style.opacity = element.taskCompletionStatus ? "0.55" : "1";

        labelContainer.appendChild(taskName);
        labelContainer.appendChild(taskDueDate);
        task.appendChild(labelContainer);
        task.appendChild(taskBtnContainer);
        taskBorder.appendChild(task);
        taskContainer.appendChild(taskBorder);
    });
}

createTasks();
window.addEventListener("storage", createTasks);

// <div id="task-container-with-scroll" class="flex flex-col items-center py-2 w-full space-y-2 overflow-y-scroll ">

/*
<div class="home-task-border">
<div class="home-task">

<div class="home-task-label-container">
<label class="home-task-label">
Task name: Task description
</label>

<label class="home-task-label">
Due Date: DD MMM YYYY
</label>
</div>

<div class="home-task-btns">
<svg width="35" height="35" viewBox="0 0 55 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_130_148)">
<path d="M13.9926 
27.6628C13.8763 27.5374 13.7721 
27.4032 13.6826 27.2636C13.5926 
27.1232 13.5141 26.9731 13.4494 
26.8172C13.2333 26.3025 13.1748 
25.7467 13.2659 25.2165C13.357 
24.6899 13.5963 24.1866 13.9755 
23.7728L14.1139 23.6304C15.0469 
22.7413 16.4621 22.5757 17.5722 
23.2434C17.7309 23.3382 17.8822 
23.4509 18.0234 23.5799L18.0373 
23.5925C18.823 24.3461 20.1523 
25.5786 21.0252 26.3554L21.7743 
27.0272L30.9426 17.4101C31.0716 
17.277 31.2136 17.1578 31.3638 
17.0536C31.5176 16.9474 31.6791 
16.8575 31.846 16.7847C32.0144 
16.711 32.1926 16.6532 32.3749 
16.6134C32.5568 16.5731 32.7424 
16.5503 32.9267 16.5462H32.9373C33.1208 
16.5442 33.3006 16.5572 33.4829 
16.5881C33.6608 16.6182 33.8394 
16.6667 34.0253 16.7383C34.1967 
16.8038 34.361 16.886 34.5165 
16.9841C34.665 17.078 34.8099 
17.1899 34.9462 17.3185L35.0121 
17.3783C35.1407 17.5057 35.2566 
17.644 35.358 17.7909C35.4621 
17.9411 35.5512 18.1026 35.6233 
18.2703C35.6977 18.4387 35.7555 
18.6169 35.7958 18.7988C35.8365 
18.9775 35.8584 19.163 35.8629 
19.3522V19.4458C35.8613 19.6082 
35.8458 19.7729 35.8165 19.9357C35.7844 
20.1127 35.736 20.2869 35.6717 20.4529C35.6066 
20.623 35.5232 20.7886 35.4247 20.9452C35.3278 
21.0986 35.2139 21.2459 35.0861 21.3806L24.0106 
33.0017C23.8804 33.1409 23.7408 33.2629 23.5948
33.3671C23.4446 33.4745 23.2827 33.5669 23.1134
33.6442C22.9437 33.7207 22.7671 33.7813 22.5893
33.8232C22.4123 33.8656 22.2276 33.8908 22.04
33.8993L21.9891 33.9006C21.817 33.9042 21.6473 
33.894 21.4841 33.8688L21.4426 33.8607C21.2738 
33.8322 21.1094 33.7899 20.9523 33.7345C20.781 
33.6735 20.6134 33.595 20.4535 33.5006L20.4278 
33.4843C20.2769 33.3932 20.1361 33.2902 20.0079 
33.1775L19.9823 33.1531C19.3394 32.5566 18.6407 
31.9495 17.9343 31.3359C16.7107 30.2726 15.0135 
28.739 13.9963 27.6656L13.9926 27.6628ZM25.0002 
0C31.9013 0 38.1546 2.8007 42.6814 7.31893C47.1997 
11.8457 50 18.099 50 25C50 31.9014 47.1993 38.1547 
42.6814 42.6815C38.155 47.1997 31.9013 50 25.0002 
50C18.0987 50 11.8454 47.1997 7.31858 42.6815C2.80032 
38.1547 0 31.901 0 24.9996C0 18.099 2.80032 11.8457 
7.31858 7.31893C11.8458 2.8007 18.0987 0 25.0002 
0ZM39.4286 10.5717C35.7368 6.87948 30.6358 4.59635 
25.0002 4.59635C19.3642 4.59635 14.2632 6.87948
10.5714 10.5717C6.87953 14.2635 4.59639 19.3644 
4.59639 24.9996C4.59639 30.6356 6.87953 35.7365 
10.5714 39.4283C14.2632 43.1201 19.3642 45.4036 
25.0002 45.4036C30.6358 45.4036 35.7368 43.1205 
39.4286 39.4283C43.1205 35.7361 45.4036 30.6356 
45.4036 24.9996C45.4036 19.3644 43.1209 14.2635 
39.4286 10.5717Z" fill="#4AAA16"/>






</g>
<defs>
<clipPath id="clip0_130_148">
<rect width="50" height="50" fill="white"/>
</clipPath>
</defs>
</svg>
</div>

</div> */