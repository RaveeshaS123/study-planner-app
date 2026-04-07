const taskService = require("../services/taskService");

let tasks = []; // In-memory tasks

// Create a new task
exports.createTask = (req, res) => {
  const { title, description, deadline } = req.body;

  console.log("Received data:", { title, description, deadline });

  if (!title || !deadline)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const task = taskService.createTask(title, description, deadline);
    console.log("Task created:", task);
    tasks.push(task);
    res.status(201).json(task);
  } catch (err) {
    console.error("Create task error:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// Get all tasks
exports.getTasks = (req, res) => {
  res.json(tasks);
};

// Update an existing task
exports.updateTask = (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });

  const { title, description, deadline } = req.body;

  try {
    if (title) task.title = title;
    if (description) task.description = description;

    if (deadline) {
      const taskDeadline = taskService.parseDate(deadline); // parse safely
      if (isNaN(taskDeadline.getTime()))
        return res.status(400).json({ error: "Invalid deadline date" });

      const now = new Date();
      if (taskDeadline.setHours(0,0,0,0) < now.setHours(0,0,0,0)) {
        return res.status(400).json({ error: "Deadline cannot be in the past" });
      }

      task.deadline = taskService.formatDate(taskDeadline); // consistent format
      task.priority = taskService.calculatePriority(taskDeadline);
    }

    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a task
exports.deleteTask = (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Task not found" });
  const deleted = tasks.splice(index, 1);
  res.json(deleted[0]);
};