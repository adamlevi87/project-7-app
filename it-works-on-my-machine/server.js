const express = require("express");
const csrf = require("@dr.pogodin/csurf");
const app = express();

// Health check endpoints FIRST - NO CSRF protection (Kubernetes/ALB friendly)
let healthy = true;

app.get("/health", (req, res) => {
  if (healthy) {
    res.send("Still working... on *my* machine 🧃");
  } else {
    res.status(500).send("Unhealthy");
  }
});

// CSRF protection using cookies instead of sessions
// NO MEMORY LEAK WARNING! Perfect for ALB + Kubernetes
// const csrfProtection = csrf({
//   cookie: {
//     httpOnly: true,
//     secure: false, // ALB does TLS termination, app receives HTTP
//     sameSite: "strict",
//   },
// });
const csrfProtection = csrf({ 
  cookie: true  // Use all default cookie settings
});

app.use(csrfProtection);

// Get CSRF token for testing protected endpoints
app.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Protected routes AFTER CSRF protection (require CSRF token)
app.get("/disable-health", (req, res) => {
  healthy = false;
  res.send("Health disabled");
});

// Export the app for testing
module.exports = app;

/* istanbul ignore next */
if (require.main === module) {
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

  // Graceful termination
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(() => {
      console.log("Process terminated");
    });
  });

  process.on("SIGINT", () => {
    console.log("SIGINT received, shutting down gracefully");
    server.close(() => {
      console.log("Process terminated");
    });
  });
}
