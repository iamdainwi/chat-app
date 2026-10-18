FROM node:24-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@12.14.0 --activate

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL

COPY package.json pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

RUN pnpm install --filter frontend...

COPY frontend/ ./frontend/

WORKDIR /app/frontend

RUN pnpm build

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["pnpm", "start"]
