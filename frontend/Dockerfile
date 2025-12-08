# Stage 1: Base
# Installs dependencies and copies source code. 
# Used as the foundation for both Linting and Building.
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci 
COPY . .

# Stage 2: Linter
# Runs the lint check. If this fails, the build stops.
FROM base AS linter
RUN npm run lint

# Stage 3: Builder
# Compiles the application for production.
FROM base AS builder
RUN npm run build

# Stage 4: Runner (Production)
# Creates the final, tiny image for deployment.
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy public folder (images, etc)
COPY --from=builder /app/public ./public

# Copy the standalone build files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]