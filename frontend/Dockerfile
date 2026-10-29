# Stage 1: Build the Vite React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests first for caching
COPY package*.json ./

# Install all dependencies (including devDependencies required for vite build)
RUN npm install

# Copy frontend source files
COPY . .

# Pass backend API URL at build time (defaults to localhost:4000)
ARG VITE_API_BASE_URL=http://localhost:4000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build production bundle into /app/dist
RUN npm run build

# Stage 2: Serve production bundle with high-performance Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA routing support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose web server port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
