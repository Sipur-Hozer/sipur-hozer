# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# 1. Install standard dependencies from your package.json
RUN npm ci

# 2. FORCE install testing tools (Fixes "jest not found" error)
# This ensures they exist in the container even if missing from your local package.json
RUN npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom ts-node

COPY . .

# Stage 2: Linter
FROM base AS linter
RUN npm run lint

# Stage 3: Tester
FROM base AS tester
ENV CI=true
# Fix: Pass the config explicitly if it's not detected automatically
RUN npx jest --config jest.config.js

# Stage 4: Builder
FROM base AS builder
RUN npm run build

# Stage 5: Runner (Production)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]