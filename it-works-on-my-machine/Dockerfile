########## Stage 1: Build stage
FROM node:18-alpine AS builder

# Workdir
WORKDIR /app

# Copy files for npm
COPY package.json ./
COPY package-lock.json ./

# run npm ci 
RUN npm ci --omit=dev && rm -rf /root/.npm


########## Stage 1.5: dumb stage  
FROM adamlevi87/node-18-buster-slim-current AS dumb

# Install dumb-init
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*


########## Stage 2: Runtime stage  
FROM adamlevi87/node-18-buster-slim-current AS runtime

# Workdir
WORKDIR /app

# Set ENV mode for NODE
ENV NODE_ENV production

# Copy from build stage - dump init
COPY --from=dumb /usr/bin/dumb-init /usr/bin/dumb-init

# Copy only what's needed for runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy Additional relevant files for production
COPY server.js ./

# Change ownership to node user
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose the relevant port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]