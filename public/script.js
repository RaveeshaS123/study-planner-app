// Common API base
const API = "";

// LOGIN / REGISTER  //
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) window.location.href = "index.html";
    else alert(data.error);
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async e => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const res = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) window.location.href = "login.html";
    else alert(data.error);
  });
}

//  TASK LOGIC  //
const taskForm = document.getElementById("taskForm");
const tasksList = document.getElementById("tasksList");
const logoutBtn = document.getElementById("logoutBtn");
const taskErrorDiv = document.getElementById("taskError"); // add a div in HTML for errors

const fetchTasks = async () => {
  const res = await fetch("/tasks");
  if (res.status === 401) window.location.href = "login.html";
  else {
    const tasks = await res.json();
    tasksList.innerHTML = "";
    tasks.forEach(t => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${t.title} - ${t.description} - ${t.deadline} (${t.priority})</span>
        <span class="task-actions">
          <button onclick="updateTask('${t.id}', '${t.title}', '${t.description}', '${t.deadline}')">
            Update
          </button>
          <button onclick="deleteTask('${t.id}')">Delete</button>
        </span>
      `;
      tasksList.appendChild(li);
    });
  }
};

const createTask = async (title, description, deadline) => {
  taskErrorDiv.textContent = ""; // clear previous errors
  try {
    const res = await fetch("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, deadline }),
    });
    const data = await res.json();
    if (!res.ok) {
      taskErrorDiv.textContent = data.error || "Failed to create task";
      return;
    }
    fetchTasks();
  } catch (err) {
    taskErrorDiv.textContent = "Network error. Try again.";
  }
};

const updateTask = async (id, oldTitle, oldDescription, oldDeadline) => {
  taskErrorDiv.textContent = "";

  const title = prompt("New title:", oldTitle);
  const description = prompt("New description:", oldDescription);
  const deadline = prompt("New deadline (YYYY-MM-DD):", oldDeadline);

  if (title === null || description === null || deadline === null) return;

  const updatedTask = {
    title: title.trim() || oldTitle,
    description: description.trim() || oldDescription,
    deadline: deadline.trim() || oldDeadline,
  };

  try {
    const res = await fetch(`/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });

    const data = await res.json();

    if (!res.ok) {
      taskErrorDiv.textContent = data.error || "Failed to update task";
      return;
    }

    fetchTasks();
  } catch (err) {
    taskErrorDiv.textContent = "Network error. Try again.";
  }
};

const deleteTask = async (id) => {
  taskErrorDiv.textContent = "";
  if (!confirm("Delete this task?")) return;
  try {
    const res = await fetch(`/tasks/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) taskErrorDiv.textContent = data.error || "Failed to delete task";
    fetchTasks();
  } catch (err) {
    taskErrorDiv.textContent = "Network error. Try again.";
  }
};

if (taskForm) {
  taskForm.addEventListener("submit", e => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const deadline = document.getElementById("deadline").value;
    createTask(title, description, deadline);
    taskForm.reset();
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await fetch("/auth/logout");
    window.location.href = "login.html";
  });
}

// Load tasks on index page
if (tasksList) fetchTasks();