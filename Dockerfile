# ---------- Builder stage (install deps) ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build deps
RUN apk add --no-cache python3 make g++ git

# Copy package files first (cache)
COPY package*.json ./

# Install production dependencies only (smaller image)
RUN npm ci --production

# Copy source
COPY . .

# Optional: run any build step here (if you had TS/webpack)
# RUN npm run build

# ---------- Final stage (runtime) ----------
FROM node:20-alpine

WORKDIR /app

# Provide curl for healthchecks and tini-like process handling
RUN apk add --no-cache curl tini

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy node_modules & app from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=8000

# Expose port used by your app (matches your env)
EXPOSE 8000

# Healthcheck uses internal HTTP endpoint - ensure you have /health or /
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || curl -f http://localhost:8000/ || exit 1

# Run as non-root for safety
USER app

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the server (adjust if your start script differs)
CMD ["node", "src/index.js"]
