#!/bin/bash

REPO_ROOT="$(pwd)"

npm run build
mkdir sandbox-project
cd sandbox-project
npm init -y
npm install visreg-test@latest

DIST="node_modules/visreg-test/dist"

# Replace the dist dir with the latest version from the repo
rm -rf "$DIST"
ln -s "$REPO_ROOT"/dist node_modules/visreg-test

# Replace the package.json with the latest version from the repo
rm node_modules/visreg-test/package.json
ln -s "$REPO_ROOT"/package.json node_modules/visreg-test

# Scaffold the test suite
chmod +x "$DIST"/entry.sh
"$DIST"/entry.sh --scaffold-ts

npm install --save-dev typescript

# Build the container
"$DIST"/entry.sh --build-container --env=dev

