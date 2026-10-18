import express from 'express';
import { prisma } from '../prisma.js';

const router = express.Router();

// Get all chat rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { messages: true }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const formattedRooms = rooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      createdAt: room.createdAt,
      messageCount: room._count.messages,
      lastMessage: room.messages[0] || null
    }));

    res.json(formattedRooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch chat rooms' });
  }
});

// Create a new chat room
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-');

    const existingRoom = await prisma.room.findUnique({
      where: { name: cleanName }
    });

    if (existingRoom) {
      return res.status(409).json({ error: 'A room with this name already exists' });
    }

    const newRoom = await prisma.room.create({
      data: {
        name: cleanName,
        description: description ? description.trim() : null
      }
    });

    res.status(201).json(newRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
});

// Get messages for a specific room
router.get('/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    const room = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        }
      }
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
