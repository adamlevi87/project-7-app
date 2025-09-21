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
  try {
    console.log(`CSRF Check: ${req.method} ${req.path}`);
    
    // Skip CSRF for GET requests to health endpoints (read-only operations)
    if (req.method === 'GET' && (req.path === '/health' || req.path === '/csrf-token')) {
      console.log('Skipping CSRF for GET endpoint');
      return next();
    }
    
    // For other GET requests, generate and store a secret
    if (req.method === 'GET') {
      const secret = tokens.secretSync();
      const sessionId = req.ip || 'default'; // Simple session identification
      csrfSecrets.set(sessionId, secret);
      console.log('Generated CSRF secret for GET request');
      return next();
    }
    
    // For POST/PUT/DELETE requests, validate CSRF token
    const sessionId = req.ip || 'default';
    const secret = csrfSecrets.get(sessionId);
    const token = req.body._csrf || req.headers['x-csrf-token'] || req.headers['csrf-token'];
    
    console.log('POST request validation:', {
      sessionId,
      hasSecret: !!secret,
      hasToken: !!token,
      token: token ? token.substring(0, 10) + '...' : 'none'
    });
    
    if (!secret) {
      console.log('No CSRF secret found');
      return res.status(403).json({ 
        error: 'No CSRF secret found',
        message: 'Get a token from /csrf-token endpoint first'
      });
    }
    
    if (!token) {
      console.log('CSRF token missing');
      return res.status(403).json({ 
        error: 'CSRF token missing',
        message: 'Include csrf-token in headers'
      });
    }
    
    const isValid = tokens.verify(secret, token);
    console.log('Token verification result:', isValid);
    
    if (!isValid) {
      console.log('CSRF token verification failed');
      return res.status(403).json({ 
        error: 'Invalid CSRF token',
        message: 'Token verification failed'
      });
    }
    
    console.log('CSRF validation passed');
    next();
  } catch (error) {
    console.error('CSRF middleware error:', error);
    return res.status(500).json({ 
      error: 'CSRF processing error',
      message: error.message 
    });
  }
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
  try {
    const sessionId = req.ip || 'default';
    let secret = csrfSecrets.get(sessionId);
    
    if (!secret) {
      secret = tokens.secretSync();
      csrfSecrets.set(sessionId, secret);
    }
    
    const token = tokens.create(secret);
    res.json({ csrfToken: token });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    res.status(500).json({ error: 'Failed to generate CSRF token' });
  }
});

// Modified disable-health to use POST with CSRF protection
app.post("/disable-health", (req, res) => {
  try {
    healthy = false;
    res.json({ message: "Health disabled", status: "success" });
  } catch (error) {
    console.error('Disable health error:', error);
    res.status(500).json({ error: 'Failed to disable health' });
  }
});

// Re-enable health endpoint
app.post("/enable-health", (req, res) => {
  try {
    healthy = true;
    res.json({ message: "Health enabled", status: "success" });
  } catch (error) {
    console.error('Enable health error:', error);
    res.status(500).json({ error: 'Failed to enable health' });
  }
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
