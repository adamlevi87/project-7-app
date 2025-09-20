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

  AND - modified health check logic (to support testing) (this entire app is basically a port open + /health returns a msg)
  i added the option to disable the health check so i could test failures.

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
we do add:
{
  "name": "it-works-on-my-machine",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "jest --coverage",
    "test:integration": "./test.sh"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "express": "^5.1.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
run npm install (again)
git add .
git commit -m "fix: remove bad script block & added new scripts"
git push
---------------------------------------


