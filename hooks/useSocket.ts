import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket/client';
import { Socket } from 'socket.io-client';
import { useChatStore } from './useChatStore';
import { useGroupStore } from './useGroupStore';
import { useCollabStore } from '@/lib/store/collabStore';

export function useSocket() {
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const { setUserOnline, setUserOffline, setTyping } = useChatStore();
  const { 
    setUserOnline: setGroupUserOnline, 
    setUserOffline: setGroupUserOffline,
    setTyping: setGroupTyping 
  } = useGroupStore();
  const { setIsConnected, addMessage, setUsers, addUser, removeUser } = useCollabStore();

  useEffect(() => {
    if (!user) return;

    const socketInstance = getSocket();
    setSocket(socketInstance);

    // Store database user ID
    let dbUserId: string | null = null;

    // Fetch database user ID once
    const fetchDbUserId = async () => {
      try {
        const res = await fetch('/api/users/me');
        const data = await res.json();
        if (data.user) {
          dbUserId = data.user.id;
          console.log('🔐 Got database user ID:', dbUserId);
        }
      } catch (error) {
        console.error('Failed to get user ID:', error);
      }
    };

    // Fetch user ID immediately
    fetchDbUserId();

    // Connection events
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      
      // Emit user_joined for legacy dashboard
      socketInstance.emit('user_joined', {
        id: user.id,
        name: user.firstName || user.emailAddresses[0]?.emailAddress || 'Anonymous',
        avatar: user.imageUrl || '',
      });

      // Authenticate with database user ID if available
      if (dbUserId) {
        console.log('🔐 Authenticating with database user ID:', dbUserId);
        socketInstance.emit('authenticate', dbUserId);
      } else {
        // Retry fetching if not available yet
        fetchDbUserId().then(() => {
          if (dbUserId) {
            socketInstance.emit('authenticate', dbUserId);
          }
        });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    // Legacy events for dashboard/home
    socketInstance.on('active_users', (users: any[]) => {
      setUsers(users.map(u => ({ ...u, online: true })));
    });

    socketInstance.on('user_joined', (newUser: any) => {
      addUser({ ...newUser, online: true });
    });

    socketInstance.on('user_left', (socketId: string) => {
      removeUser(socketId);
    });

    socketInstance.on('new_message', (message: any) => {
      addMessage({
        id: message.id,
        senderId: message.senderId,
        senderName: message.senderName,
        content: message.content,
        timestamp: Date.now(),
      });
    });

    socketInstance.on('data_sync', (data: any) => {
      if (data.count !== undefined) {
        window.dispatchEvent(new CustomEvent('counter-sync', { detail: data.count }));
      }
    });

    // Chat system events
    socketInstance.on('user:online', (userId: string) => {
      console.log('👤 User came online:', userId);
      setUserOnline(userId);
      setGroupUserOnline(userId);
    });

    socketInstance.on('user:offline', (userId: string) => {
      console.log('👤 User went offline:', userId);
      setUserOffline(userId);
      setGroupUserOffline(userId);
    });

    socketInstance.on('private:typing', ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTyping(userId, isTyping);
    });

    socketInstance.on('group:typing', ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setGroupTyping(userId, isTyping);
    });

    // Connect the socket
    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    return () => {
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('active_users');
      socketInstance.off('user_joined');
      socketInstance.off('user_left');
      socketInstance.off('new_message');
      socketInstance.off('data_sync');
      socketInstance.off('user:online');
      socketInstance.off('user:offline');
      socketInstance.off('private:typing');
      socketInstance.off('group:typing');
    };
  }, [user]);

  // Legacy support for old pages (dashboard/home)
  const sendMessage = (content: string) => {
    if (!socket || !user) return;
    
    const message = {
      id: Date.now().toString(),
      content,
      senderName: user.firstName || user.emailAddresses[0]?.emailAddress || 'Anonymous',
      senderId: user.id,
      timestamp: new Date().toISOString(),
    };
    
    socket.emit('new_message', message);
  };

  const emitCustomEvent = (eventName: string, data: any) => {
    if (!socket) return;
    socket.emit(eventName, data);
  };

  return { socket, sendMessage, emitCustomEvent };
}
