import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export const dynamic = 'force-dynamic';

let io: SocketIOServer;

export async function GET(req: NextRequest) {
  if (!io) {
    const httpServer = (req as any).socket?.server as HTTPServer;
    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('message', (data) => {
        io.emit('message', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  return new Response('Socket.IO server running', { status: 200 });
}
