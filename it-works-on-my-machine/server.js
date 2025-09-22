const express = require("express");
const session = require("express-session");
const csrf = require("@dr.pogodin/csurf");
const csrf = csrf;
const app = express();

// Session middleware with secure settings
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-for-dev",
    name: "sessionId", // Custom session cookie name
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Force HTTPS-only cookies
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours expiration
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Explicit expiration date
      path: "/", // Cookie path
      domain: process.env.COOKIE_DOMAIN || undefined, // Set domain if needed
    },
  }),
);

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
