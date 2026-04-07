const bcrypt = require("bcrypt");
// invalid credentials for username,password both not exisiting for security purpose
let users = []; // In-memory users

// Register a new user
exports.register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) 
    return res.status(400).json({ error: "Missing fields" });

  const existing = users.find(u => u.username === username);
  if (existing) 
    return res.status(400).json({ error: "User exists" });

  const hash = await bcrypt.hash(password, 10);
  const user = { username, password: hash };
  users.push(user);

  res.status(201).json({ message: "User registered" });
};

// Login user
exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) 
    return res.status(400).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) 
    return res.status(400).json({ error: "Invalid credentials" });

  req.session.user = username;
  res.json({ message: "Logged in" });
};

// Logout user
exports.logout = (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out" });
};