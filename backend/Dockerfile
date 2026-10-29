# Use lightweight Node 20 LTS Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency manifests first for optimal layer caching
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose backend port
EXPOSE 4000

# Production environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Start application
CMD ["npm", "start"]
