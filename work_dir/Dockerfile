FROM node:18-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install --omit=dev && rm -rf /root/.npm

#COPY . .
COPY server.js ./
COPY test.sh ./

# Change ownership to node user
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

EXPOSE 3000
CMD ["node", "server.js"]