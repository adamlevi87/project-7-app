FROM node:18-alpine


WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Change ownership to node user
RUN chown -R node:node /app

# Switch to non-root user
USER node

EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server.js"]