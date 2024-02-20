#!/bin/bash

pretty_log() {
    echo -e "\x1b[2m$1\x1b[0m"
}

env=$ENV
args=$ARGS

IFS=',' read -r -a parsedArgs <<< "$ARGS"

if [ -n "$ARGS" ]; then
    pretty_log "From container: Arguments are: ${parsedArgs[@]}"
fi

# If the mounted package.json has changed update dependencies
if [[ ! -f prev-package.json ]] || [[ -f prev-package.json && ! -z "$(diff -q package.json prev-package.json)" ]]; then
    pretty_log "Running npm install..."
    npm install
fi

# If the node_modules folder doesn't exist, run npm install
if [[ ! -d node_modules ]]; then
    pretty_log "Running npm install..."
    npm install
fi

# If the Cypress cache doesn't exist, install cypress binary
if [ ! -d /root/.cache/Cypress ]; then
    pretty_log "Installing cypress..."
    ./node_modules/.bin/cypress install
fi

# Save a copy of the package.json in the container's /app directory.
# Used to check if it has changed on the host machine since the last run
cp /app/package.json /app/prev-package.json

if [ $env = "dev" ]; then
    # When developing, we mount the dist folder from the local repo into a temp dir (this is done from the
    # run-visreg-test.sh script), and once inside the container we replace the npm-installed dist files
    # with the local dist folder, thereby running the latest built code
    rm -rf /app/node_modules/visreg-test/dist
    cp -r /temp /app/node_modules/visreg-test/dist
fi

# Run visreg-test
pretty_log "Running visreg-test package..."

chmod +x ./node_modules/.bin/visreg-test
npx visreg-test "${parsedArgs[@]}" --run-in-container

