ARG NODE_VERSION=24.9.0

FROM node:${NODE_VERSION}-alpine AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Build stage - install all dependencies and build
FROM base AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
# Install all dependencies (including dev) for build
RUN pnpm install --frozen-lockfile

COPY . .

# Clean any existing build artifacts to prevent stale cache issues
RUN rm -rf dist .astro

# Build no longer needs the database — SSR pages fetch data at request time
RUN pnpm run build

# Production image, copy all the files and run astro
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PROD=true
ENV ASTRO_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

# Copy package files and the builder's working dependency layout.
# Reinstalling with pnpm --prod drops the top-level link for
# @astrojs/internal-helpers, which the generated server entry imports.
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules

# Copy the built application
COPY --from=builder --chown=astro:nodejs /app/dist ./dist

# Change ownership after installation
RUN chown -R astro:nodejs /app

EXPOSE 4321
ENV HOST=0.0.0.0
ENV PORT=4321

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -qO- http://127.0.0.1:4321/ || exit 1

USER astro
CMD ["node", "./dist/server/entry.mjs"]
