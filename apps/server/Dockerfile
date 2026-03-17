# Use Node.js 20 slim as the base image
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Stage 1: Prune the monorepo to only include the server app and its dependencies
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo@^2
COPY . .
RUN turbo prune server --docker

# Stage 2: Install dependencies
FROM base AS installer
WORKDIR /app

# First copy the pruned lockfile and package.json files
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo run build --filter=server...

# Stage 4: Production runner
FROM node:20-slim AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

# Copy the built application and dependencies
# Note: In a monorepo, some dependencies might be in the root node_modules
# For a simple setup, we copy the necessary parts. 
# Better would be to use a bundler for the server, but standard TSC is used here.
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/server/node_modules ./apps/server/node_modules

# Environment variables
ENV NODE_ENV=production
ENV PORT=7200

EXPOSE 7200

# Start the server
CMD ["node", "apps/server/dist/index.js"]
