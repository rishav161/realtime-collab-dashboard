const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3001;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store active users
const activeUsers = new Map();

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
        : ['http://localhost:3000'],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // User joined
    socket.on('user_joined', (user) => {
      activeUsers.set(socket.id, user);
      console.log('👤 User joined:', user.name);
      
      // Broadcast to all clients including sender
      io.emit('active_users', Array.from(activeUsers.values()));
      
      // Notify others about new user
      socket.broadcast.emit('user_joined', user);
    });

    // New message
    socket.on('new_message', (message) => {
      console.log('💬 Message from', message.senderName + ':', message.content);
      
      // Broadcast message to all clients
      io.emit('new_message', message);
    });

    // Data sync (for counter or other shared state)
    socket.on('data_sync', (data) => {
      console.log('🔄 Data sync:', data);
      socket.broadcast.emit('data_sync', data);
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

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
