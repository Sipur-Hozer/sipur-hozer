# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
# 'npm ci' is faster and cleaner than 'npm install' for builds
RUN npm ci 
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy public folder (images, etc)
COPY --from=builder /app/public ./public

# Copy the standalone build files (this includes a tiny node_modules)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

# Notice we run 'server.js' now, not 'npm start'
CMD ["node", "server.js"]