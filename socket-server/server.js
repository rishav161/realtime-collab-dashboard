const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3002;

// Store active users
const activeUsers = new Map();

// Create HTTP server
const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      users: activeUsers.size,
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

  // Disconnect
  socket.on('disconnect', () => {
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
