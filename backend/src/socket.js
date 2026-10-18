import { prisma } from './prisma.js';

// Map of roomId -> Map of socketId -> user details
const activeRoomUsers = new Map();

export function setupSocketIO(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join a chat room
    socket.on('join_room', async ({ roomId, username, avatar }) => {
      if (!roomId || !username) return;

      // Join the socket room
      socket.join(roomId);
      socket.data.currentRoomId = roomId;
      socket.data.username = username;
      socket.data.avatar = avatar;

      if (!activeRoomUsers.has(roomId)) {
        activeRoomUsers.set(roomId, new Map());
      }

      const usersMap = activeRoomUsers.get(roomId);
      usersMap.set(socket.id, {
        socketId: socket.id,
        username,
        avatar: avatar || null
      });

      // Broadcast updated online users in this room
      const userList = Array.from(usersMap.values());
      io.to(roomId).emit('room_users', {
        roomId,
        users: userList
      });

      // Notify other room members
      socket.to(roomId).emit('user_status', {
        type: 'join',
        username,
        timestamp: new Date().toISOString()
      });
    });

    // Leave a chat room
    socket.on('leave_room', ({ roomId }) => {
      if (!roomId) return;
      socket.leave(roomId);

      if (activeRoomUsers.has(roomId)) {
        const usersMap = activeRoomUsers.get(roomId);
        const user = usersMap.get(socket.id);
        usersMap.delete(socket.id);

        io.to(roomId).emit('room_users', {
          roomId,
          users: Array.from(usersMap.values())
        });

        if (user) {
          socket.to(roomId).emit('user_status', {
            type: 'leave',
            username: user.username,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // Send a message
    socket.on('send_message', async (data, callback) => {
      try {
        const { roomId, content, username, avatar } = data;

        if (!roomId || !content || !content.trim()) {
          if (callback) callback({ error: 'Message content and room are required' });
          return;
        }

        const trimmedContent = content.trim();
        const senderName = username?.trim() || 'Anonymous';

        // Upsert user profile in PostgreSQL
        let dbUser = null;
        try {
          dbUser = await prisma.user.upsert({
            where: { username: senderName },
            update: { avatar: avatar || null },
            create: {
              username: senderName,
              avatar: avatar || null
            }
          });
        } catch (uErr) {
          console.warn('[Socket] User upsert warning:', uErr.message);
        }

        // Save message to PostgreSQL via Prisma
        const savedMessage = await prisma.message.create({
          data: {
            content: trimmedContent,
            roomId,
            username: senderName,
            userId: dbUser ? dbUser.id : null
          },
          include: {
            user: {
              select: { id: true, username: true, avatar: true }
            }
          }
        });

        // Broadcast to everyone in the room including sender
        io.to(roomId).emit('new_message', savedMessage);

        if (callback) callback({ status: 'ok', message: savedMessage });
      } catch (error) {
        console.error('[Socket] Error saving/sending message:', error);
        if (callback) callback({ error: 'Failed to send message' });
      }
    });

    // User typing indicator
    socket.on('typing', ({ roomId, username, isTyping }) => {
      if (!roomId) return;
      socket.to(roomId).emit('user_typing', {
        roomId,
        username: username || 'Someone',
        isTyping: Boolean(isTyping)
      });
    });

    // Message reactions
    socket.on('react_message', ({ messageId, roomId, emoji, username }) => {
      if (!roomId || !messageId || !emoji) return;
      io.to(roomId).emit('message_reaction', {
        messageId,
        emoji,
        username: username || 'Someone'
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      const roomId = socket.data.currentRoomId;

      if (roomId && activeRoomUsers.has(roomId)) {
        const usersMap = activeRoomUsers.get(roomId);
        const user = usersMap.get(socket.id);
        usersMap.delete(socket.id);

        io.to(roomId).emit('room_users', {
          roomId,
          users: Array.from(usersMap.values())
        });

        if (user) {
          socket.to(roomId).emit('user_status', {
            type: 'leave',
            username: user.username,
            timestamp: new Date().toISOString()
          });
        }
      }
    });
  });
}
