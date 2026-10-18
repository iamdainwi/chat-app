# PulseChat — Real-Time Chat Application

A high-performance, real-time chat application built as a **pnpm monorepo** with a **Next.js + Shadcn UI** frontend and a **pure JavaScript Node.js / Express + Socket.io** backend, backed by **PostgreSQL** in **Docker** with **Prisma ORM**.

---

## 🌟 Architecture & Tech Stack

- **Monorepo Architecture**: Managed with `pnpm` workspaces (`frontend`, `backend`).
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, **Shadcn UI** components (`Button`, `Input`, `Card`, `ScrollArea`, `Avatar`, `Badge`, `Dialog`, `Separator`), Lucide icons, and `socket.io-client`.
- **Backend**: Node.js & Express.js written in **pure JavaScript (ESM)** without TypeScript, HTTP server + **Socket.io**.
- **Database & ORM**: **PostgreSQL** containerized in Docker with persistent named volume (`postgres_data`), managed via **Prisma ORM**.
- **Containerization**: Full `docker-compose.yml` orchestrating PostgreSQL, Backend, and Frontend.

---

## 📁 Repository Structure

```
chat-app/
├── pnpm-workspace.yaml          # pnpm workspace definition
├── package.json                 # Monorepo root scripts
├── docker-compose.yml           # Multi-container orchestration (Postgres, Backend, Frontend)
├── backend/                     # Pure JavaScript Node.js / Express Backend
│   ├── Dockerfile
│   ├── package.json             # Express, Socket.io, Prisma Client (ESM, no TS)
│   ├── .env                     # Database URL, PORT, CORS_ORIGIN
│   ├── prisma/
│   │   └── schema.prisma        # User, Room, Message models
│   └── src/
│       ├── server.js            # Express server, Socket.io setup, room seeding
│       ├── socket.js            # Socket event handlers (messaging, presence, typing)
│       ├── prisma.js            # Prisma client instance
│       └── routes/
│           └── rooms.js         # REST endpoints for rooms and message history
└── frontend/                    # Next.js App with Shadcn UI & Socket.io client
    ├── Dockerfile
    ├── package.json
    ├── .env.local               # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx             # Main chat interface
    │   └── globals.css          # Theme tokens and Tailwind CSS v4
    ├── components/
    │   ├── ui/                  # Shadcn UI primitives (Button, Input, Avatar, Dialog, etc.)
    │   └── chat/
    │       ├── sidebar.tsx      # Channel navigation, search, profile trigger
    │       ├── chat-area.tsx    # Message feed, input bar, reactions, typing indicator
    │       ├── members-drawer.tsx # Online room members drawer
    │       ├── new-room-modal.tsx # Dialog to create channels
    │       └── user-profile-modal.tsx # Profile display name editor
    └── lib/
        ├── socket.ts            # Socket.io client singleton
        ├── avatar.ts            # Dynamic avatar initials and gradient generator
        └── types.ts             # TypeScript interfaces for chat domain
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (v9 or v12)
- [Docker & Docker Compose](https://www.docker.com/)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Start PostgreSQL Container
Start PostgreSQL in Docker with persistent storage volume:
```bash
pnpm db:up
```

### 4. Push Database Schema (Prisma)
Sync the Prisma schema with the PostgreSQL database:
```bash
pnpm db:migrate
# or
pnpm --filter backend prisma:push
```

### 5. Start Both Frontend and Backend Concurrently
```bash
pnpm dev
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Sockets**: [http://localhost:5001](http://localhost:5001)
- **Health Check**: [http://localhost:5001/health](http://localhost:5001/health)

---

## 🐳 Running Everything with Docker Compose

You can containerize and launch the entire stack with a single command:

```bash
pnpm docker:up
# or
docker compose up --build
```

To stop all containers:
```bash
pnpm docker:down
```

---

## 💬 Real-Time Features

- **Multi-Channel Chat**: Switch between default channels (`#general`, `#tech-talk`, `#random`, `#announcements`) or create custom channels.
- **Message Persistence**: All chat messages and users are persisted in PostgreSQL via Prisma ORM.
- **Real-Time Presence**: Track active users online in the current channel.
- **Typing Indicator**: Animated indicators showing who is currently typing in the channel.
- **Quick Reactions**: Quick emoji insertion bar for rapid engagement.
- **Custom Display Name**: Set and change display names with persistent avatars in `localStorage`.
