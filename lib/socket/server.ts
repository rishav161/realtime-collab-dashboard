import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export function initializeSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  const onlineUsers = new Map<string, string>(); // userId -> socketId

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // User authentication
    socket.on('authenticate', (userId: string) => {
      onlineUsers.set(userId, socket.id);
      socket.data.userId = userId;
      
      // Broadcast online status
      io.emit('user:online', userId);
      console.log(`User ${userId} authenticated`);
    });

    // One-to-One Chat Events
    socket.on('private:join', ({ userId, otherUserId }: { userId: string; otherUserId: string }) => {
      const roomName = [userId, otherUserId].sort().join('-');
      socket.join(`dm-${roomName}`);
      console.log(`User ${userId} joined DM room: dm-${roomName}`);
    });

    socket.on('private:message', (data: { senderId: string; receiverId: string; content: string; timestamp: string }) => {
      const roomName = [data.senderId, data.receiverId].sort().join('-');
      io.to(`dm-${roomName}`).emit('private:message', data);
    });

    socket.on('private:typing', ({ userId, otherUserId, isTyping }: { userId: string; otherUserId: string; isTyping: boolean }) => {
      const roomName = [userId, otherUserId].sort().join('-');
      socket.to(`dm-${roomName}`).emit('private:typing', { userId, isTyping });
    });

    // Group Chat Events
    socket.on('group:join', ({ groupId, userId }: { groupId: string; userId: string }) => {
      socket.join(`group-${groupId}`);
      socket.to(`group-${groupId}`).emit('group:user_joined', { userId, timestamp: new Date().toISOString() });
      console.log(`User ${userId} joined group: group-${groupId}`);
    });

    socket.on('group:leave', ({ groupId, userId }: { groupId: string; userId: string }) => {
      socket.leave(`group-${groupId}`);
      socket.to(`group-${groupId}`).emit('group:user_left', { userId, timestamp: new Date().toISOString() });
    });

    socket.on('group:message', (data: { groupId: string; senderId: string; content: string; timestamp: string }) => {
      io.to(`group-${data.groupId}`).emit('group:message', data);
    });

    socket.on('group:typing', ({ groupId, userId, isTyping }: { groupId: string; userId: string; isTyping: boolean }) => {
      socket.to(`group-${groupId}`).emit('group:typing', { userId, isTyping });
    });

    // Disconnect
    socket.on('disconnect', () => {
      const userId = socket.data.userId;
      if (userId) {
        onlineUsers.delete(userId);
        io.emit('user:offline', userId);
        console.log(`User ${userId} disconnected`);
      }
    });
  });

  return io;
}
