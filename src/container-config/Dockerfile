# Use an official Node.js runtime as the base image
FROM cypress/browsers

# Set the working directory in the container to /app
WORKDIR /app

# Install curl and jq
RUN apt-get update && apt-get install -y curl jq

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

