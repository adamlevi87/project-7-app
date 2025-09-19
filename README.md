# project-7-app


Docker file changes:
switched from npm install to npm ci
because:
npm install - reads package.json, updates package-lock.json
npm ci - reads package-lock.json only - validates with package.json -> throws the error.
package-lock.json mentions packages-> with specific versions , no ranges .

npm install is for development-> meaning the best practice for a production ready (production means ANYTHING not local, even DEV)-> you must switch to to npm ci -> and use that for validation too (CI) .