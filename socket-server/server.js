const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3002;

// Store active users (legacy)
const activeUsers = new Map();
// Store online users for chat (userId -> socketId)
const onlineUsers = new Map();

// Create HTTP server
const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      users: activeUsers.size,
      onlineUsers: onlineUsers.size,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Socket.IO Server Running\n');
});

// Create Socket.IO server with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // ===== LEGACY EVENTS (for dashboard/home page) =====
  
  // User joined
  socket.on('user_joined', (user) => {
    activeUsers.set(socket.id, user);
    console.log('👤 User joined:', user.name);
    
    // Broadcast updated user list to all clients
    io.emit('active_users', Array.from(activeUsers.values()));
    
    // Notify others about new user
    socket.broadcast.emit('user_joined', user);
  });

  // Data sync (counter, etc.)
  socket.on('data_sync', (data) => {
    console.log('🔄 Data sync:', data);
    socket.broadcast.emit('data_sync', data);
  });

  // New message
  socket.on('new_message', (message) => {
    console.log('💬 Message from', message.senderName + ':', message.content);
    
    // Broadcast message to all clients
    io.emit('new_message', message);
  });

  // ===== NEW CHAT SYSTEM EVENTS =====

  // User authentication for chat
  socket.on('authenticate', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.data.userId = userId;
    io.emit('user:online', userId);
    console.log(`✅ User ${userId} authenticated for chat`);
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
    console.log(`📨 Private message from ${data.senderId} to ${data.receiverId}`);
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
    console.log(`👋 User ${userId} left group: group-${groupId}`);
  });

  socket.on('group:message', (data) => {
    io.to(`group-${data.groupId}`).emit('group:message', data);
    console.log(`📨 Group message in ${data.groupId} from ${data.senderId}`);
  });

  socket.on('group:typing', ({ groupId, userId, isTyping }) => {
    socket.to(`group-${groupId}`).emit('group:typing', { userId, isTyping });
  });

  // ===== DISCONNECT =====
  
  socket.on('disconnect', () => {
    // Handle chat user disconnect
    const userId = socket.data.userId;
    if (userId) {
      onlineUsers.delete(userId);
      io.emit('user:offline', userId);
      console.log(`❌ Chat user ${userId} disconnected`);
    }

    // Handle legacy user disconnect
    const user = activeUsers.get(socket.id);
    if (user) {
      console.log('👋 User left:', user.name);
      activeUsers.delete(socket.id);
      
      // Broadcast updated user list
      io.emit('active_users', Array.from(activeUsers.values()));
      
      // Notify about user leaving
      io.emit('user_left', socket.id);
    }
    console.log('🔌 Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Socket.IO server running on port ${PORT}`);
  console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || 'Not set (allowing all origins)'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});
