# ==========================================
# Stage 1: Build & Dependency Resolution
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies cleanly
RUN npm install --omit=dev && npm cache clean --force

# ==========================================
# Stage 2: Production Hardened Runner
# ==========================================
FROM node:20-alpine AS runner

# Install dumb-init for proper signal handling (SIGTERM / SIGINT)
RUN apk add --no-cache dumb-init

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5002

# Copy production node_modules from builder stage
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src ./src

# Switch to non-root node user for security
USER node

EXPOSE 5002

# Use dumb-init as PID 1 to prevent zombie processes and ensure clean shutdown
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "src/server.js"]