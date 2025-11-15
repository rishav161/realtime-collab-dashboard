import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    // Add https:// if URL doesn't have a protocol
    if (socketUrl && !socketUrl.startsWith('http://') && !socketUrl.startsWith('https://')) {
      socketUrl = `https://${socketUrl}`;
    }
    
    socket = io(socketUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectSocket(userId: string) {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
    socket.emit('authenticate', userId);
  }
  return socket;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
