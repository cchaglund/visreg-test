# Use an official Node.js runtime as the base image
FROM cypress/browsers

# Set the working directory in the container to /app
WORKDIR /app

# Make port 3000 available outside the container (express server)
EXPOSE 3000

# Disable sound and Vulkan
ENV QT_QPA_PLATFORM='offscreen'
ENV QT_QPA_PLATFORM='minimal'
ENV QT_DEBUG_PLUGINS='0'

# COPY . /app
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

