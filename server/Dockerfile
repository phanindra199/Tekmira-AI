# ==============================================================================
# Tekmira AI — Backend Production Multi-Stage Dockerfile (Day 17)
# Stage 1: Install dependencies and generate Prisma Client ORM binaries
# Stage 2: Create lightweight, non-root, hardened Node 22 Alpine runtime
# ==============================================================================

# --- Stage 1: Build & Dependencies Stage ---
FROM node:22-alpine AS deps

WORKDIR /app

# Install OpenSSL for Prisma engine compatibility on Alpine Linux
RUN apk add --no-cache openssl

# Install npm dependencies using package-lock.json
COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate --schema=prisma/schema.prisma

# --- Stage 2: Production Runner Stage ---
FROM node:22-alpine AS runner

WORKDIR /app

# Install dumb-init for PID 1 signal forwarding & curl for container health check
RUN apk add --no-cache dumb-init curl openssl

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy Prisma schema and pre-generated query engines from Stage 1
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma

# Copy application source code
COPY . .

# Enforce least-privilege security by running as non-root user 'node'
RUN chown -R node:node /app
USER node

# Expose backend REST API port
EXPOSE 5000

# Container healthcheck: pings /api/health endpoint every 15s
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Forward UNIX signals properly via dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Launch Tekmira AI Express Engine
CMD ["node", "src/server.js"]
