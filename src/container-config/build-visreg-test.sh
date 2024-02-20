#!/bin/bash

pretty_log() {
    echo -e "\x1b[2m$1\x1b[0m"
}

SCRIPT_DIR="$(dirname "$0")"

pretty_log "Stopping and removing the previous container..."

docker stop visreg-test >/dev/null 2>&1 || true # Stop the previous container
docker rm visreg-test >/dev/null 2>&1 || true # Remove the previous container
docker rmi visreg-test >/dev/null 2>&1 || true # Remove the old image

pretty_log "Building the new image..."
docker build -t visreg-test "$SCRIPT_DIR"


