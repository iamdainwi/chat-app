FROM node:24-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@12.14.0 --activate

# Copy workspace configuration and package manifests
COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install backend dependencies
RUN pnpm install --filter backend...

# Copy backend source code
COPY backend/ ./backend/

WORKDIR /app/backend

# Generate Prisma client
RUN pnpm prisma:generate

EXPOSE 5001

# Automatically push database schema on startup and start server
CMD ["sh", "-c", "pnpm prisma db push && node src/server.js"]
