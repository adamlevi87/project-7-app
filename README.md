## project-7-app


Docker file changes:
switched from npm install to npm ci
because:
npm install - reads package.json, updates package-lock.json
npm ci - reads package-lock.json only - validates with package.json -> throws the error.
package-lock.json mentions packages-> with specific versions , no ranges .
npc ci is a clean install meant for consistent deployments and should be used in the CI.
npm install is for development-> meaning the best practice for a production ready (production means ANYTHING not local, even DEV)-> you must switch to to npm ci -> and use that for validation too (CI) .
the Issue with this, i dont have the developer to talk to, even though this is a super simple app, its lock file has other problems( private repos with no credentials given) - am i supposed to generate the lock file using npm install? i dont know (just for this specific application, i dont see why not)