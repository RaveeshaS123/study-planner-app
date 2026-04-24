const express = require("express");
const path = require("path");
const session = require("express-session");
const client = require('prom-client');
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
client.collectDefaultMetrics(); 
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

app.get("/metrics", async (req, res) => {
  res.setHeader('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

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
  app.listen(3000, '0.0.0.0', () => console.log("Server running on port 3000"));
}