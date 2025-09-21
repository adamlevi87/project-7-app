const express = require("express");
const app = express();

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