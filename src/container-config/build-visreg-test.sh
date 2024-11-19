#!/bin/bash

pretty_log() {
    echo -e "\x1b[2m$1\x1b[0m"
}

SCRIPT_DIR="$(dirname "$0")"

image_name=$1
shift # Remove the first argument (image_name) from the list of arguments

pretty_log "Stopping and removing the previous container..."

docker stop $image_name >/dev/null 2>&1 || true # Stop the previous container
docker rm $image_name >/dev/null 2>&1 || true # Remove the previous container
docker rmi $image_name >/dev/null 2>&1 || true # Remove the old image

pretty_log "Building the new image..."
echo ""
docker build -t $image_name "$SCRIPT_DIR"
echo ""



