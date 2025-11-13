'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCollabStore } from '@/lib/store/collabStore';
import { useUser } from '@clerk/nextjs';

const AVATAR_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  
  const { 
    setIsConnected, 
    addUser, 
    removeUser, 
    setUsers,
    addMessage 
  } = useCollabStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user) return;

    // Initialize socket connection
    socketRef.current = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);

      // Emit user_joined event
      socket.emit('user_joined', {
        id: socket.id,
        name: user.firstName || user.username || 'Anonymous',
        avatar: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        online: true,
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    // Listen to user_joined event
    socket.on('user_joined', (newUser: any) => {
      console.log('👤 User joined:', newUser.name);
      addUser(newUser);
    });

    // Listen to user_left event
    socket.on('user_left', (userId: string) => {
      console.log('👋 User left:', userId);
      removeUser(userId);
    });

    // Listen to active_users event (full user list)
    socket.on('active_users', (users: any[]) => {
      console.log('📋 Active users updated:', users.length);
      setUsers(users);
    });

    // Listen to new_message event
    socket.on('new_message', (message: any) => {
      console.log('💬 New message:', message.content);
      addMessage(message);
    });

    // Listen to data_sync event (for counter, etc.)
    socket.on('data_sync', (data: any) => {
      console.log('🔄 Data synced:', data);
      // Emit custom event that can be handled by other components
      if (data.count !== undefined) {
        window.dispatchEvent(new CustomEvent('counter-sync', { detail: data.count }));
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('active_users');
      socket.off('new_message');
      socket.off('data_sync');
      socket.disconnect();
    };
  }, [mounted, user, setIsConnected, addUser, removeUser, setUsers, addMessage]);

  // Helper functions to emit events
  const sendMessage = (content: string) => {
    if (!socketRef.current?.connected || !user) return;

    const message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: socketRef.current.id,
      senderName: user.firstName || user.username || 'Anonymous',
      content,
      timestamp: Date.now(),
    };

    socketRef.current.emit('new_message', message);
  };

  const emitCustomEvent = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    sendMessage,
    emitCustomEvent,
  };
}
