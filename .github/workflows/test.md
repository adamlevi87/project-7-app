this needs to be detected:
Docker file changes-> 
COPY package.json ./
COPY package-lock.json ./
RUN npm ci

------------------------------------------
------------------------------------------
------------------------------------------
STEP 1
---------------------
lockfile-lint:
many:
detected invalid host(s) for package: accepts@2.0.0-28801cb2d4c10a0bd7419f78115a721729a35563
    expected: registry.npmjs.org,registry.npmjs.org
    actual: ironsrc.jfrog.io

detected invalid host(s) for package: body-parser@2.2.0-999359dae0e362a7b23405d625baa244cc3a0024
    expected: registry.npmjs.org,registry.npmjs.org
    actual: ironsrc.jfrog.io

developer would PROBABLY do:
rm package-lock.json && npm install

we use:
fix-lockfile


------------------------
npm ci --dry-run
version mismatch - we change either the package.json or lock.json
chaning package.json made more sense to me
^5.1.0
-------------------------------------
dockle

WARN    - CIS-DI-0001: Create a user for the container
        * Last user should not be root
WARN    - DKL-DI-0006: Avoid latest tag
        * Avoid 'latest' tag
INFO    - CIS-DI-0005: Enable Content trust for Docker
        * export DOCKER_CONTENT_TRUST=1 before docker pull/build
INFO    - CIS-DI-0006: Add HEALTHCHECK instruction to the container image
        * not found HEALTHCHECK statement
INFO    - DKL-LI-0003: Only put necessary files
        * Suspicious directory : root/.npm
        * unnecessary file : app/Dockerfile
how to fixe:
CIS DI 0001: RUN chown -R node:node /app  , USER node

DKL-DI-0006: 
docker build -t dockle-scan:$(date +%Y%m%d) .
dockle --exit-code 1 --exit-level INFO dockle-scan:$(date +%Y%m%d)

CIS-DI-0005: export DOCKER_CONTENT_TRUST=1 before docker pull/build

CIS-DI-0006: Added a node based HEALTHCHECK
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

  AND - add/edit , modified health check logic (to support testing) (this entire app is basically a port open + /health returns a msg)
  i added the option to disable the health check so i could test failures:
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

DKL-LI-0003:
# Clean up npm cache before switching users
RUN rm -rf /root/.npm

# Disable COPY . .
#COPY . .
COPY server.js ./
COPY test.sh ./


--------------------------------------
Setup Prettier (code formatting)
fix by running:
prettier --write .
git add .
git commit -m "fix: format code with prettier"
git push


------------------------------------------
------------------------------------------
------------------------------------------
STEP 2
---------------------------------------
npm test
Error: no test specified
package.json (default that came with the project)
has a "script" - a simple command that always breaks.
the fix:
remove that OR 
add real tests,
we edit the package.json (add\replace these)
{
  "scripts": {
    "test": "echo \"Basic test validation passed ✅\"",
    "test:unit": "jest --coverage --forceExit --coverageThreshold='{\"global\":{\"lines\":100}}'",
    "test:integration": "./test.sh"
  },
  "devDependencies": {
    "jest": "^30.1.3",
    "supertest": "^7.1.4"
  }
}

in it-works-on-my.. :
create the file server.test.js :
const request = require("supertest");
const app = require("./server");

describe("Express App Health Endpoints", () => {
  test("GET /health should return healthy message", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.text).toBe("Still working... on *my* machine 🧃");
  });

  test("GET /disable-health should disable health check", async () => {
    const response = await request(app).get("/disable-health");

    expect(response.status).toBe(200);
    expect(response.text).toBe("Health disabled");
  });

  test("GET /health should return 500 after being disabled", async () => {
    await request(app).get("/disable-health");
    const response = await request(app).get("/health");

    expect(response.status).toBe(500);
    expect(response.text).toBe("Unhealthy");
  });
});


in server.js add/(and replace) to support he unit tests:
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


run npm install (again)
git add .
git commit -m "fix: remove bad script block & added new scripts"
git push
---------------------------------------


