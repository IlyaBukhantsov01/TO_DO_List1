const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const dateInput = document.getElementById("dateInput");
const addTaskBtn = document.getElementById("addTask");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const filters = document.querySelectorAll(".filter");

const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");

const completedCount = document.getElementById("completedCount");
const totalCount = document.getElementById("totalCount");

const allCount = document.getElementById("allCount");
const activeCount = document.getElementById("activeCount");
const doneCount = document.getElementById("doneCount");

const themeToggle = document.getElementById("themeToggle");
const todayElement = document.getElementById("today");

let tasks = JSON.parse(localStorage.getItem("taskflow-tasks")) || [];
let currentFilter = "all";

/* ---------------------------
   Helpers
---------------------------- */

function saveTasks() {
  localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
}

function createId() {
  return Date.now() + Math.random().toString(16).slice(2);
}

function formatDate(date) {
  if (!date) return "";

  const d = new Date(date + "T00:00:00");

  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short"
  });
}

function setToday() {
  const now = new Date();

  todayElement.textContent = now.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

/* ---------------------------
   Add task
---------------------------- */

function addTask() {
  const title = taskInput.value.trim();

  if (!title) {
    taskInput.focus();
    return;
  }

  const task = {
    id: createId(),
    title,
    priority: prioritySelect.value,
    date: dateInput.value,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(task);

  saveTasks();
  render();

  taskInput.value = "";
  dateInput.value = "";

  taskInput.focus();
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

/* ---------------------------
   Toggle task
---------------------------- */

function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return {
        ...task,
        completed: !task.completed
      };
    }

    return task;
  });

  saveTasks();
  render();
}

/* ---------------------------
   Delete task
---------------------------- */

function deleteTask(id) {
  const element = document.querySelector(`[data-id="${id}"]`);

  if (element) {
    element.style.opacity = "0";
    element.style.transform = "translateX(20px)";
  }

  setTimeout(() => {
    tasks = tasks.filter((task) => task.id !== id);

    saveTasks();
    render();
  }, 180);
}

/* ---------------------------
   Edit task
---------------------------- */

function editTask(id) {
  const task = tasks.find((item) => item.id === id);

  if (!task) return;

  const newTitle = prompt("Изменить задачу:", task.title);

  if (newTitle === null) return;

  const title = newTitle.trim();

  if (!title) return;

  task.title = title;

  saveTasks();
  render();
}

/* ---------------------------
   Filtering
---------------------------- */

function getVisibleTasks() {
  const query = searchInput.value.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(query);

    let matchesFilter = true;

    if (currentFilter === "active") {
      matchesFilter = !task.completed;
    }

    if (currentFilter === "completed") {
      matchesFilter = task.completed;
    }

    return matchesSearch && matchesFilter;
  });
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    currentFilter = button.dataset.filter;

    render();
  });
});

searchInput.addEventListener("input", render);

/* ---------------------------
   Render
---------------------------- */

function render() {
  const visibleTasks = getVisibleTasks();

  taskList.innerHTML = "";

  emptyState.style.display =
    visibleTasks.length === 0 ? "block" : "none";

  visibleTasks.forEach((task) => {
    const element = document.createElement("article");

    element.className = `task ${
      task.completed ? "completed" : ""
    }`;

    element.dataset.id = task.id;

    const priorityNames = {
      low: "Низкий",
      medium: "Средний",
      high: "Высокий"
    };

    const dateHTML = task.date
      ? `<span>📅 ${formatDate(task.date)}</span>`
      : "";

    element.innerHTML = `
      <button
        class="checkbox"
        aria-label="Отметить задачу"
        onclick="toggleTask('${task.id}')"
      >
        ✓
      </button>

      <div class="task-content">
        <div class="task-title">${escapeHTML(task.title)}</div>

        <div class="task-meta">
          <span class="priority ${task.priority}">
            ${priorityNames[task.priority]}
          </span>

          ${dateHTML}
        </div>
      </div>

      <div class="task-actions">
        <button
          class="task-action"
          title="Изменить"
          onclick="editTask('${task.id}')"
        >
          ✎
        </button>

        <button
          class="task-action delete"
          title="Удалить"
          onclick="deleteTask('${task.id}')"
        >
          ×
        </button>
      </div>
    `;

    taskList.appendChild(element);
  });

  updateStats();
}

/* ---------------------------
   Stats
---------------------------- */

function updateStats() {
  const total = tasks.length;

  const completed = tasks.filter(
    (task) => task.completed
  ).length;

  const active = total - completed;

  const percent =
    total === 0
      ? 0
      : Math.round((completed / total) * 100);

  progressFill.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;

  completedCount.textContent = completed;
  totalCount.textContent = total;

  allCount.textContent = total;
  activeCount.textContent = active;
  doneCount.textContent = completed;
}

/* ---------------------------
   Security
---------------------------- */

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;

  return div.innerHTML;
}

/* ---------------------------
   Theme
---------------------------- */

function setTheme(theme) {
  document.body.classList.toggle(
    "light",
    theme === "light"
  );

  themeToggle.textContent =
    theme === "light" ? "☾" : "☼";

  localStorage.setItem(
    "taskflow-theme",
    theme
  );
}

themeToggle.addEventListener("click", () => {
  const isLight =
    document.body.classList.contains("light");

  setTheme(isLight ? "dark" : "light");
});

/* ---------------------------
   Keyboard shortcuts
---------------------------- */

document.addEventListener("keydown", (event) => {
  // Ctrl/Cmd + K — поиск
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key.toLowerCase() === "k"
  ) {
    event.preventDefault();
    searchInput.focus();
  }

  // N — новая задача
  if (
    event.key.toLowerCase() === "n" &&
    document.activeElement.tagName !== "INPUT"
  ) {
    taskInput.focus();
  }
});

/* ---------------------------
   Init
---------------------------- */

const savedTheme =
  localStorage.getItem("taskflow-theme") || "dark";

setTheme(savedTheme);
setToday();
render();
