const express = require("express");
const path = require("path");
const session = require("express-session");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: false
}));

// Serve frontend
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/tasks", taskRoutes);
app.use("/auth", authRoutes);

// Protect index page
app.get("/", (req, res) => {
  if (!req.session.user) return res.redirect("/login.html");
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = app;

if (require.main === module) {
  app.listen(3000, () => console.log("Server running on port 3000"));
}