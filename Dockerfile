FROM node:20-bullseye-slim

# Create app directory
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manifests first (for better layer caching)
COPY package.json pnpm-lock.yaml ./

# Install deps (include devDependencies because we need drizzle-kit for migrations)
RUN pnpm install --frozen-lockfile

# Copy source
COPY . ./

# Make sure start script is executable
RUN chmod +x /app/scripts/start-prod.sh || true

ENV NODE_ENV=production

# Expose port used by Next.js
EXPOSE 3000

CMD ["/bin/sh", "/app/scripts/start-prod.sh"]
