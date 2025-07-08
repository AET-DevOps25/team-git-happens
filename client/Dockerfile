# Stage 1: Build the React application
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
# COPY package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx static assets
RUN rm -rf ./*

# Copy built assets from the builder stage
COPY --from=builder /app/dist .

# Define the Nginx configuration file to use
ARG NGINX_CONF_FILE=nginx.conf

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy the selected configuration file into the container
COPY ${NGINX_CONF_FILE} /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx and serve the static files
CMD ["nginx", "-g", "daemon off;"]