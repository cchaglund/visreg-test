#!/bin/bash

pretty_log() {
    echo -e "\x1b[2m$1\x1b[0m"
}

install_dependencies() {
    pretty_log "Running npm install (takes a moment)..."
    npm install
    echo "Running npm audit fix..."
    npm audit fix
}

env=$ENV
args=$ARGS

# Split the args string into an array
IFS='=' read -r -a parsedArgs <<< "$ARGS"

# If the mounted package.json has changed, update dependencies
if [[ ! -f prev-package.json ]] || [[ -f prev-package.json && ! -z "$(diff -q package.json prev-package.json)" ]]; then
    rm -rf node_modules
    install_dependencies
fi

# If the node_modules folder doesn't exist, run npm install
if [[ ! -d node_modules ]]; then
    install_dependencies
fi

# If the Cypress cache doesn't exist, install cypress binary
if [ ! -d /root/.cache/Cypress ]; then
    pretty_log "Installing cypress..."
    ./node_modules/.bin/cypress install
fi

# Extract Cypress version from package.json
cypress_version=$(jq -r '.version' ./node_modules/cypress/package.json)
# cypress_version=$(jq -r '.dependencies.cypress' /app/package.json)

pretty_log "Cypress version: $cypress_version..."

# Remove any Cypress cache directories that do not match the version in package.json
for dir in /root/.cache/Cypress/*; do
    if [[ $(basename "$dir") != "$cypress_version" ]]; then
        pretty_log "Removing mismatched Cypress version cache: $(basename "$dir")..."
        rm -rf "$dir"
    fi
done

# Check if the Cypress version in the cache matches the version in package.json
if [[ ! -d "/root/.cache/Cypress/$cypress_version" ]]; then
    pretty_log "Cypress version mismatch. Clearing cache and reinstalling..."
    ./node_modules/.bin/cypress install
fi

# Save a copy of the package.json in the container's /app directory.
# Used to check if it has changed on the host machine since the last run.
cp /app/package.json /app/prev-package.json
# cp /app/visreg.config.json /app/prev-visreg.config.json

if [ $env = "dev" ]; then
    # When developing, we mount the dist folder from the local repo into a temp dir (this is done from the
    # run-visreg-test.sh script), and once inside the container we replace the npm-installed dist files
    # with the local dist folder, thereby running the latest built code
    rm -rf /app/node_modules/visreg-test/dist
    cp -r /temp /app/node_modules/visreg-test/dist
fi

# Run visreg-test
pretty_log "Running visreg-test package..."


if [[ ! -z "$ARGS" && "$ARGS" != "=" ]]; then
    pretty_log "Arguments: ${parsedArgs[*]}"
fi

chmod +x ./node_modules/visreg-test/dist/visreg.js
node ./node_modules/visreg-test/dist/visreg.js "${parsedArgs[@]}" --containerized

