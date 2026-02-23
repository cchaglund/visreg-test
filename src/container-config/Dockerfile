# Use an official Node.js runtime as the base image
FROM cypress/browsers:node-20.18.0-chrome-130.0.6723.69-1-ff-131.0.3-edge-130.0.2849.52-1

# Set the working directory in the container to /app
WORKDIR /app

# Remove stale Chrome/Edge repo sources (browsers are already in the base image)
# to prevent GPG key errors during apt-get update, then install curl and jq
RUN rm -f /etc/apt/sources.list.d/google-chrome.list /etc/apt/sources.list.d/microsoft-edge*.list \
    && apt-get update && apt-get install -y curl jq

# Make port 3000 available outside the container (express server)
EXPOSE 3000

# Make port 8080 available outside the container (websocket server)
EXPOSE 8080

# Disable sound and Vulkan
ENV QT_QPA_PLATFORM='offscreen'
ENV QT_QPA_PLATFORM='minimal'
ENV QT_DEBUG_PLUGINS='0'

# COPY . /app
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

