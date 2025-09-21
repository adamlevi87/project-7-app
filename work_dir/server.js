const express = require('express');
const app = express();

// Simple security headers (satisfies security scanner)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

let healthy = true;

app.get('/health', (req, res) => {
  if (healthy) {
    res.send('Still working... on *my* machine 🧃');
  } else {
    res.status(500).send('Unhealthy');
  }
});

app.get('/disable-health', (req, res) => {
  healthy = false;
  res.send('Health disabled');
});

// Export the app for testing
module.exports = app;

// Only start server if this file is run directly
/* istanbul ignore next */
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
