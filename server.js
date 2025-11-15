const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3001;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store active users and online status
const activeUsers = new Map();
const onlineUsers = new Map(); // userId -> socketId

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? false 
        : ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // User authentication
    socket.on('authenticate', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.data.userId = userId;
      io.emit('user:online', userId);
      console.log(`✅ User ${userId} authenticated`);
    });

    // One-to-One Chat Events
    socket.on('private:join', ({ userId, otherUserId }) => {
      const roomName = [userId, otherUserId].sort().join('-');
      socket.join(`dm-${roomName}`);
      console.log(`💬 User ${userId} joined DM room: dm-${roomName}`);
    });

    socket.on('private:message', (data) => {
      const roomName = [data.senderId, data.receiverId].sort().join('-');
      io.to(`dm-${roomName}`).emit('private:message', data);
    });

    socket.on('private:typing', ({ userId, otherUserId, isTyping }) => {
      const roomName = [userId, otherUserId].sort().join('-');
      socket.to(`dm-${roomName}`).emit('private:typing', { userId, isTyping });
    });

    // Group Chat Events
    socket.on('group:join', ({ groupId, userId }) => {
      socket.join(`group-${groupId}`);
      socket.to(`group-${groupId}`).emit('group:user_joined', { 
        userId, 
        timestamp: new Date().toISOString() 
      });
      console.log(`👥 User ${userId} joined group: group-${groupId}`);
    });

    socket.on('group:leave', ({ groupId, userId }) => {
      socket.leave(`group-${groupId}`);
      socket.to(`group-${groupId}`).emit('group:user_left', { 
        userId, 
        timestamp: new Date().toISOString() 
      });
    });

    socket.on('group:message', (data) => {
      io.to(`group-${data.groupId}`).emit('group:message', data);
    });

    socket.on('group:typing', ({ groupId, userId, isTyping }) => {
      socket.to(`group-${groupId}`).emit('group:typing', { userId, isTyping });
    });

    // Legacy events (for backward compatibility)
    socket.on('user_joined', (user) => {
      activeUsers.set(socket.id, user);
      console.log('👤 User joined:', user.name);
      io.emit('active_users', Array.from(activeUsers.values()));
      socket.broadcast.emit('user_joined', user);
    });

    socket.on('new_message', (message) => {
      console.log('💬 Message from', message.senderName + ':', message.content);
      io.emit('new_message', message);
    });

    socket.on('data_sync', (data) => {
      console.log('🔄 Data sync:', data);
      socket.broadcast.emit('data_sync', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      const userId = socket.data.userId;
      if (userId) {
        onlineUsers.delete(userId);
        io.emit('user:offline', userId);
        console.log(`❌ User ${userId} disconnected`);
      }

      const user = activeUsers.get(socket.id);
      if (user) {
        console.log('👋 User left:', user.name);
        activeUsers.delete(socket.id);
        io.emit('active_users', Array.from(activeUsers.values()));
        io.emit('user_left', socket.id);
      }
      console.log('🔌 Client disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
