# Use an official Node.js runtime as the base image
FROM cypress/browsers

# Set the working directory in the container to /app
WORKDIR /app

# Make port 3000 available outside the container
EXPOSE 3000

# COPY . /app
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

