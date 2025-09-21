const express = require("express");
const session = require("express-session");
const csrf = require("csurf");
const app = express();

// Session middleware (required for csurf)
app.use(session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: false
}));

// CSRF protection middleware
const csrfProtection = csrf();
app.use(csrfProtection);

let healthy = true;

app.get("/health", (req, res) => {
  if (healthy) {
    res.send("Still working... on *my* machine 🧃");
  } else {
    res.status(500).send("Unhealthy");
  }
});

app.get("/disable-health", (req, res) => {
  healthy = false;
  res.send("Health disabled");
});

// Export the app for testing
module.exports = app;

/* istanbul ignore next */
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
