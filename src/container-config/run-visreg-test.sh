#!/bin/bash

pretty_log() {
    echo -e "\x1b[2m$1\x1b[0m"
}

run_visreg_test() {
    exists=$(docker images -q visreg-test 2> /dev/null)

    # Check if the visreg-test image exists, and if not, build it
    if [ -z "$exists" ]; then
        pretty_log "Building the visreg-test image..."
        SCRIPT_DIR="$(dirname "$0")"
        "$SCRIPT_DIR/build-visreg-test.sh" "$@"
    fi

    # Check if the container is running, and if so, stop it
    if [ "$(docker ps -q -f name=visreg-test)" ]; then
        pretty_log "Stopping the previous container..."
        docker stop visreg-test >/dev/null 2>&1
    fi

    # Remove the old container, if it exists
    if [ "$(docker ps -aq -f status=exited -f name=visreg-test)" ]; then
        pretty_log "Removing the previous container..."
        docker rm visreg-test >/dev/null 2>&1
    fi

    local env=$1
    local ARGS=$2
    local PROJECT_ROOT="$(pwd)"

    # "Mirror" the project's
    #     - suites directory
    #     - package.json
    #     - visreg.config.json
    # These will be shared by both the npm package and the Docker container, enabling the user to run
    # visreg-test from the Docker container with the same configuration as they would from the npm package

    # Mount for persistence - things only used by the container (stored in the "container" dir):
    #     - Cypress cache
    #     - node_modules (modules are installed based on the project's package.json, but they are distinct from
    #       the node_modules found in the project root, which are installed and used locally by the host machine.
    #       This allows for running visreg-test from the host machine outside of the container, and from the container,
    #       with the same configuration. 

    # if there's no visreg.config.json in the project root, create one:
    if [ ! -f "$PROJECT_ROOT/visreg.config.json" ]; then
        pretty_log "Creating a visreg.config.json file in the project root..."
        touch "$PROJECT_ROOT/visreg.config.json"
    fi

    # Run the visreg-test container
    if [ $env = "dev" ]; then
        pretty_log "Running container (with mounted local dist folder)..."

        docker run --name visreg-test -it \
        -e ENV=dev \
        -e ARGS=$ARGS \
        -v "$PROJECT_ROOT"/suites:/app/suites \
        -v "$PROJECT_ROOT"/package.json:/app/package.json \
        -v "$PROJECT_ROOT"/tsconfig.json:/app/tsconfig.json \
        -v "$PROJECT_ROOT"/visreg.config.json:/app/visreg.config.json \
        -v "$PROJECT_ROOT"/container/volumes/app:/app \
        -v "$PROJECT_ROOT"/container/volumes/cypress-cache:/root/.cache/Cypress \
        -v "$PROJECT_ROOT"/../repo/visual-regression/dist:/temp \
        -p 3000:3000 \
        visreg-test
    else
        pretty_log "Running container..."

        docker run --name visreg-test -it \
        -e ENV=prod \
        -e ARGS=$ARGS \
        -v "$PROJECT_ROOT"/suites:/app/suites \
        -v "$PROJECT_ROOT"/package.json:/app/package.json \
        -v "$PROJECT_ROOT"/tsconfig.json:/app/tsconfig.json \
        -v "$PROJECT_ROOT"/visreg.config.json:/app/visreg.config.json \
        -v "$PROJECT_ROOT"/container/volumes/app:/app \
        -v "$PROJECT_ROOT"/container/volumes/cypress-cache:/root/.cache/Cypress \
        -p 3000:3000 \
        visreg-test
    fi
}

# Parse the arguments
container_args=()

for arg in "$@"
do
    key=$(echo $arg | cut -f1 -d=)
    value=$(echo $arg | cut -f2 -d=)

    if [ "$key" = "--env" ]; then
        env=$value
    else
        container_args+=("$arg")
    fi
done


# Join all container-args with a comma
ARGS=$(printf ",%s" "${container_args[@]}")

run_visreg_test $env $ARGS


