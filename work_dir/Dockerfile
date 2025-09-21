# Stage 1: Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy files for npm
COPY package.json ./
COPY package-lock.json ./
# run npm
RUN npm ci --omit=dev && rm -rf /root/.npm

# Copy Additional relevant files for production
COPY server.js ./
COPY test.sh ./

# Stage 2: Runtime stage  
FROM node:18-alpine AS runtime
WORKDIR /app

# Copy only what's needed for runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/test.sh ./

# Change ownership to node user
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose the relevant port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]