import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './prisma.js';
import roomsRouter from './routes/rooms.js';
import { setupSocketIO } from './socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN === '*' ? '*' : CORS_ORIGIN.split(',').map(o => o.trim()),
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: CORS_ORIGIN === '*' ? '*' : CORS_ORIGIN.split(',').map(o => o.trim()),
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'chat-app-backend'
  });
});

app.use('/api/rooms', roomsRouter);

// Setup Socket.io event listeners
setupSocketIO(io);

// Seed default rooms if none exist
async function seedDefaultRooms() {
  try {
    const roomCount = await prisma.room.count();
    if (roomCount === 0) {
      console.log('[Database] Seeding default chat rooms...');
      const defaultRooms = [
        { name: 'general', description: 'General chat for everyone to connect and hang out' },
        { name: 'tech-talk', description: 'Discussion about code, architectures, and tech trends' },
        { name: 'random', description: 'Memes, casual banter, and off-topic conversations' },
        { name: 'announcements', description: 'Important updates and community announcements' }
      ];

      for (const room of defaultRooms) {
        await prisma.room.create({ data: room });
      }
      console.log('[Database] Default rooms seeded successfully.');
    }

    const general = await prisma.room.findUnique({ where: { name: 'general' } });
    if (general) {
      const msgCount = await prisma.message.count({ where: { roomId: general.id } });
      if (msgCount === 0) {
        console.log('[Database] Seeding initial screenshot messages in #general...');
        const baseTime = new Date();
        baseTime.setHours(12, 28, 0, 0);

        await prisma.message.create({
          data: {
            content: 'Deploying to prod real quick.',
            username: 'Alex',
            roomId: general.id,
            createdAt: new Date(baseTime.getTime()),
          }
        });
        await prisma.message.create({
          data: {
            content: "Hello! Wait... It's 4:55 PM. On a Friday.",
            username: 'User-6431',
            roomId: general.id,
            createdAt: new Date(baseTime.getTime() + 60000),
          }
        });
        await prisma.message.create({
          data: {
            content: "It's a one-line change.",
            username: 'Alex',
            roomId: general.id,
            createdAt: new Date(baseTime.getTime() + 120000),
          }
        });
        await prisma.message.create({
          data: {
            content: "It's always a one-line change 😅.",
            username: 'User-6431',
            roomId: general.id,
            createdAt: new Date(baseTime.getTime() + 180000),
          }
        });
        await prisma.message.create({
          data: {
            content: 'Alright, let me take a look.',
            username: 'User-6431',
            roomId: general.id,
            createdAt: new Date(baseTime.getTime() + 185000),
          }
        });
        console.log('[Database] Initial messages seeded successfully.');
      }
    }
  } catch (error) {
    console.warn('[Database] Could not seed rooms (database might be connecting):', error.message);
  }
}

// Start Server
server.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`🚀 Chat App Backend running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`🌐 CORS allowed origin: ${CORS_ORIGIN}`);
  console.log(`===============================================`);
  await seedDefaultRooms();
});

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  try {
    await prisma.$disconnect();
    server.close(() => {
      console.log('[Server] HTTP and Socket.io server closed.');
      process.exit(0);
    });
  } catch (err) {
    console.error('[Server] Error during shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
