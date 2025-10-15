# # Dockerfile

# Use the stable Node 20 LTS image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies with better error handling
RUN apk add --no-cache curl && \
    npm install -g npm@latest && \
    npm ci --only=production --no-optional && \
    npm cache clean --force

# Copy application code
COPY . .

# Create non-root user for security (optional but recommended)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /usr/src/app

USER nextjs

# Expose the application port
EXPOSE 3000

# Health check command
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Run the application
CMD ["npm", "start"]