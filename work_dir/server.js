const express = require("express");
const csrf = require("csrf");
const app = express();

// Initialize CSRF tokens
const tokens = csrf();

// Store CSRF secrets (in a real app, you'd use sessions/database)
const csrfSecrets = new Map();

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CSRF protection middleware
app.use((req, res, next) => {
  // Skip CSRF for GET requests to health endpoints (read-only operations)
  if (req.method === 'GET' && (req.path === '/health' || req.path === '/csrf-token')) {
    return next();
  }
  
  // For other GET requests, generate and store a secret
  if (req.method === 'GET') {
    const secret = tokens.secretSync();
    const sessionId = req.ip; // Simple session identification
    csrfSecrets.set(sessionId, secret);
    return next();
  }
  
  // For POST/PUT/DELETE requests, validate CSRF token
  const sessionId = req.ip;
  const secret = csrfSecrets.get(sessionId);
  const token = req.body._csrf || req.headers['x-csrf-token'] || req.headers['csrf-token'];
  
  if (!secret || !token || !tokens.verify(secret, token)) {
    return res.status(403).json({ 
      error: 'Invalid or missing CSRF token',
      message: 'Get a token from /csrf-token endpoint'
    });
  }
  
  next();
});

let healthy = true;

// Health check endpoints (GET - no CSRF needed)
app.get("/health", (req, res) => {
  if (healthy) {
    res.send("Still working... on *my* machine 🧃");
  } else {
    res.status(500).send("Unhealthy");
  }
});

// CSRF token endpoint - provides tokens for other operations
app.get("/csrf-token", (req, res) => {
  const sessionId = req.ip;
  let secret = csrfSecrets.get(sessionId);
  
  if (!secret) {
    secret = tokens.secretSync();
    csrfSecrets.set(sessionId, secret);
  }
  
  const token = tokens.create(secret);
  res.json({ csrfToken: token });
});

// Modified disable-health to use POST with CSRF protection
app.post("/disable-health", (req, res) => {
  healthy = false;
  res.json({ message: "Health disabled", status: "success" });
});

// Re-enable health endpoint
app.post("/enable-health", (req, res) => {
  healthy = true;
  res.json({ message: "Health enabled", status: "success" });
});

// Export the app for testing
module.exports = app;

// Only start server if this file is run directly
/* istanbul ignore next */
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Get CSRF token from: http://localhost:${port}/csrf-token`);
  });
}
