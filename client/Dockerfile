# ==============================================================================
# Tekmira AI — Client Production Multi-Stage Dockerfile (Day 17)
# Stage 1: Build production React + Vite application bundle
# Stage 2: Serve static bundle via high-performance, hardened Nginx Alpine image
# ==============================================================================

# --- Stage 1: Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies strictly from lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source code
COPY . .

# Production API Endpoint Environment Variable
ENV VITE_API_URL=/api

# Build minified assets
RUN npm run build

# --- Stage 2: Production Serving Stage ---
FROM nginx:alpine AS runner

# Remove default boilerplate configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom Nginx SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static distribution from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Health check to verify Nginx is actively responding to HTTP requests
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

# Start Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
