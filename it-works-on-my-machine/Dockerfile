FROM node:18-alpine


WORKDIR /app

COPY package.json ./
RUN npm install

# Clean up npm cache before switching users
RUN rm -rf /root/.npm

# Disable COPY . .
#COPY . .
COPY server.js ./
COPY test.sh ./

# Change ownership to node user
RUN chown -R node:node /app

# Switch to non-root user
USER node

EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]