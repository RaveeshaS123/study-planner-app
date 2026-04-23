let nextId = 1;

exports.createTask = (title, description, deadline) => {
  if (!title || !deadline) {
    throw new Error("Title and deadline are required");
  }

  // Parse date safely (handles MM/DD/YYYY and YYYY-MM-DD)
  const taskDeadline = parseDate(deadline);

  const now = new Date();
  if (taskDeadline.setHours(0, 0, 0, 0) < now.setHours(0, 0, 0, 0)) {
    throw new Error("Deadline cannot be in the past");
  }

  const task = {
    id: nextId++,
    title,
    description: description || "",
    deadline: formatDate(taskDeadline), // store in YYYY-MM-DD for consistency
    createdAt: new Date(),
    priority: exports.calculatePriority(taskDeadline)
  };
  return task;
};

exports.calculatePriority = (deadline) => {
  const now = new Date();
  const d = parseDate(deadline);
  const diffDays = (d - now) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "Expired";
  if (diffDays < 2) return "High";
  if (diffDays < 5) return "Medium";
  return "Low";
};

// Helper: parse MM/DD/YYYY or YYYY-MM-DD to Date
//existing parseDate function
function parseDate(dateStr) {
  if (!dateStr) throw new Error("Deadline missing");

  // Try ISO format YYYY-MM-DD
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  // Try MM/DD/YYYY
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    d = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
    if (!isNaN(d.getTime())) return d;
  }

  throw new Error("Invalid deadline date");
}

// Export it so other files can use it
exports.parseDate = parseDate;

// Helper: format Date to YYYY-MM-DD
function formatDate(dateObj) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

exports.formatDate = formatDate;