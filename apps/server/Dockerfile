# Use Node.js 24 slim as the base image
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Stage 1: Prune the monorepo
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo@^2
COPY . .
RUN turbo prune server --docker

# Stage 2: Install dependencies and build
FROM base AS builder
WORKDIR /app

# Copy pruned workspace
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo run build --filter=server...

# Stage 3: Production runner
FROM node:24-slim AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy the entire workspace from builder
# After turbo prune, this only contains server and its dependencies
COPY --from=builder --chown=expressjs:nodejs /app /app

USER expressjs

# Environment variables
ENV NODE_ENV=production
ENV PORT=7200

EXPOSE 7200

# Start the server from its directory
WORKDIR /app/apps/server
CMD ["node", "dist/index.js"]
