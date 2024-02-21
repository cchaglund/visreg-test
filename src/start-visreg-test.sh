#!/bin/bash

pretty_log() {
    echo -e "\x1b[2m$1\x1b[0m"
}

# Get the directory from where the script was called - this is the directory of the user's project,
# where they've installed the visreg-test npm package
PROJECT_ROOT="$(pwd)"
DIST="$PROJECT_ROOT/node_modules/visreg-test/dist"
SCRIPTS_DIR="$DIST/container-config"

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

is_lab_mode=false
for arg in "$@"; do
    if [[ $arg == "-l" || $arg == "--lab-mode" ]]; then
        is_lab_mode=true
        break
    fi
done

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


if [[ $is_containerized == "true" ]]; then
    # If the user wants to run the package from within a container, create the container dir
    create_container_dir
else
    # Otherwise, just run the package from the host machine
    node "$DIST/visreg.js" $@
fi


if [[ $* == *--run-container* || $* == *-r* ]]; then
    set -- "${@/--run-container/}" # Remove the --run-container argument from the arguments
    set -- "${@/-r/}" # Remove the -r argument from the arguments
    "$SCRIPTS_DIR/run-visreg-test.sh" "$@"
elif [[ $* == *--build-container* || $* == *-b* ]]; then
    set -- "${@/--build-container/}" # Remove the --build-container argument from the arguments
    set -- "${@/-b/}" # Remove the -b argument from the arguments
    "$SCRIPTS_DIR/build-visreg-test.sh" "$@"
fi