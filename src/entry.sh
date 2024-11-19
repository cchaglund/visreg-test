#!/bin/bash

pretty_log() {
    # Function to print logs in a pretty format
    echo -e "\x1b[2m$1\x1b[0m"
}

# Get the directory from where the script was called - this is the directory of the user's project,
# where they've installed the visreg-test npm package
PROJECT_ROOT="$(pwd)"
CONFIG_FILE="$PROJECT_ROOT/visreg.config.json"
PACKAGE_FILE="$PROJECT_ROOT/package.json"

# Check if the visreg.config.json file exists and read the dockerImageName attribute if it does
if [ -f "$CONFIG_FILE" ]; then
    custom_image_name=$(jq -r '.["dockerImageName"] // empty' "$CONFIG_FILE")
fi

# If dockerImageName is not found, check for the name property in package.json
if [ -z "$custom_image_name" ] && [ -f "$PACKAGE_FILE" ]; then
    package_name=$(jq -r '.name // empty' "$PACKAGE_FILE")
fi

# Set the image name based on the custom name, package name, or default to visreg-image-<project-name>
if [ -n "$custom_image_name" ]; then
    image_name="$custom_image_name"
elif [ -n "$package_name" ]; then
    image_name="$package_name"
else
    image_name="visreg-image-$(basename "$PROJECT_ROOT")"
fi

DIST="$PROJECT_ROOT/node_modules/visreg-test/dist"
SCRIPTS_DIR="$DIST/container-config"

pretty_log "Image name: $image_name"

create_container_dir() {
    # If the user doesn't have the container dir in their project root, create it
    if [ ! -d "$PROJECT_ROOT/container" ]; then
        pretty_log "Creating the container dir in the project root..."

        mkdir "$PROJECT_ROOT/container"
        mkdir "$PROJECT_ROOT/container/volumes"
        mkdir "$PROJECT_ROOT/container/volumes/app"
        mkdir "$PROJECT_ROOT/container/volumes/cypress-cache"
    fi
}

# Check if lab mode is enabled
is_lab_mode=false
for arg in "$@"; do
    if [[ $arg == "-l" || $arg == "--lab-mode" ]]; then
        is_lab_mode=true
        break
    fi
done

# Check if containerized mode is enabled
is_containerized=false
for arg in "$@"; do
    if [[ $arg == "-r" || $arg == "--run-container" || $arg == "-b" || $arg == "--build-container" ]]; then
        is_containerized=true
        break
    fi
done

# Exit if the user tries to run lab mode from within a container 
if [[  $is_lab_mode == "true" && $is_containerized == "true" ]]; then
    echo "Lab mode is only supported when run locally (not in a container). Run the command again without the --run-container/--build-container argument."
    exit 0
fi

# If containerized mode is enabled, create the container dir
if [[ $is_containerized == "true" ]]; then
    create_container_dir
else
    # Otherwise, just run the package from the host machine
    node "$DIST/visreg.js" $@
fi

# Handle --run-container and --build-container arguments
if [[ $* == *--run-container* || $* == *-r* ]]; then
    set -- "${@/--run-container/}" # Remove the --run-container argument from the arguments
    set -- "${@/-r/}" # Remove the -r argument from the arguments
    "$SCRIPTS_DIR/run-visreg-test.sh" "$image_name" "$@"
elif [[ $* == *--build-container* || $* == *-b* ]]; then
    set -- "${@/--build-container/}" # Remove the --build-container argument from the arguments
    set -- "${@/-b/}" # Remove the -b argument from the arguments
    "$SCRIPTS_DIR/build-visreg-test.sh" "$image_name" "$@"
fi

