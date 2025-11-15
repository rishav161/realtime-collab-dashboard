'use client';

import { useEffect, useRef, useState, use } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/hooks/useChatStore';
import { useSocket } from '@/hooks/useSocket';
import MessageBubble from '@/components/MessageBubble';
import TypingIndicator from '@/components/TypingIndicator';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';

export default function ChatPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId: otherUserId } = use(params);
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    messages,
    setMessages,
    addMessage,
    typingUsers,
    onlineUsers,
    setActiveUserId,
  } = useChatStore();

  const { socket } = useSocket();

  useEffect(() => {
    setActiveUserId(otherUserId);
    loadCurrentUser();
    loadMessages();
    loadOtherUser();

    return () => {
      setActiveUserId(null);
    };
  }, [otherUserId]);

  useEffect(() => {
    if (!socket || !currentUser) {
      console.log('⚠️ Socket or currentUser not ready:', { socket: !!socket, currentUser: !!currentUser });
      return;
    }

    const roomName = [currentUser.id, otherUserId].sort().join('-');
    console.log('🔌 Joining private chat room:', { 
      userId: currentUser.id, 
      otherUserId,
      roomName: `dm-${roomName}`,
      socketId: socket.id 
    });
    
    socket.emit('private:join', { userId: currentUser.id, otherUserId });

    // Test listener - listen to ALL private messages
    const handlePrivateMessage = (data: any) => {
      console.log('📨 RAW Received private message:', {
        data,
        currentUserId: currentUser.id,
        isSender: data.senderId === currentUser.id,
        messagesCount: messages.length
      });
      
      // Only add messages from other user (not our own)
      if (data.senderId !== currentUser.id) {
        console.log('✅ Adding message from other user to state');
        addMessage({
          id: data.id || Date.now().toString(),
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
          timestamp: data.timestamp,
        });
      } else {
        console.log('⏭️ Skipping own message (already added optimistically)');
      }
    };

    socket.on('private:message', handlePrivateMessage);

    // Test: Log all socket events
    socket.onAny((eventName, ...args) => {
      console.log('🔔 Socket event received:', eventName, args);
    });

    return () => {
      console.log('🔌 Leaving private chat room');
      socket.off('private:message', handlePrivateMessage);
      socket.offAny();
    };
  }, [socket, currentUser, otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadCurrentUser = async () => {
    try {
      const res = await fetch('/api/users/me');
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/chat/messages?userId=${otherUserId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadOtherUser = async () => {
    try {
      const res = await fetch(`/api/users/${otherUserId}`);
      const data = await res.json();
      if (data.user) {
        setOtherUser(data.user);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !currentUser) return;

    const content = input.trim();
    const tempId = `temp-${Date.now()}`;
    setInput('');

    // Add message to UI immediately (optimistic update)
    const optimisticMessage = {
      id: tempId,
      senderId: currentUser.id,
      receiverId: otherUserId,
      content,
      timestamp: new Date().toISOString(),
    };
    addMessage(optimisticMessage);

    try {
      // Save to database in background
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: otherUserId, content }),
      });

      const data = await res.json();
      if (data.message && socket) {
        const messageData = {
          id: data.message.id,
          senderId: currentUser.id,
          receiverId: otherUserId,
          content,
          timestamp: data.message.timestamp,
        };
        
        console.log('📤 Emitting private message:', {
          ...messageData,
          roomName: `dm-${[currentUser.id, otherUserId].sort().join('-')}`
        });
        console.log('🔌 Socket connected:', socket.connected);
        console.log('🔌 Socket ID:', socket.id);
        
        // Emit to socket for other user
        socket.emit('private:message', messageData);
        
        console.log('✅ Message emitted to socket');
      } else {
        console.error('❌ Socket not available or message save failed');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Could add error handling here to remove optimistic message
    }
  };

  const handleTyping = () => {
    if (!socket || !currentUser) return;

    socket.emit('private:typing', {
      userId: currentUser.id,
      otherUserId,
      isTyping: true,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('private:typing', {
        userId: currentUser.id,
        otherUserId,
        isTyping: false,
      });
    }, 2000);
  };

  // Check online status - onlineUsers from chat store uses database IDs
  const isOnline = onlineUsers.has(otherUserId);
  const isTyping = typingUsers.has(otherUserId);
  
  // Debug online status
  useEffect(() => {
    console.log('👥 Online status check:', {
      otherUserId,
      isOnline,
      onlineUsersSet: Array.from(onlineUsers),
    });
  }, [otherUserId, isOnline, onlineUsers]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/chats')}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              <div className="relative">
                {otherUser?.imageUrl ? (
                  <img
                    src={otherUser.imageUrl}
                    alt={otherUser.firstName || otherUser.email}
                    className="w-12 h-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700">
                    <span className="text-lg font-bold text-white">
                      {otherUser?.firstName?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                {isOnline && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                )}
              </div>

              <div>
                <h1 className="font-bold text-lg text-gray-900 dark:text-white">
                  {otherUser?.firstName || otherUser?.email || 'User'}
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isOnline ? '🟢 Online' : '⚫ Offline'}
                  </p>
                  {socket?.connected && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      • Connected
                    </span>
                  )}
                  {socket && !socket.connected && (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      • Disconnected
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">💬</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No messages yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Start the conversation!
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  content={msg.content}
                  timestamp={msg.timestamp}
                  isOwn={msg.senderId === currentUser?.id}
                  senderName={msg.senderId === currentUser?.id ? undefined : otherUser?.firstName || otherUser?.email}
                  senderImage={msg.senderId === currentUser?.id ? undefined : otherUser?.imageUrl}
                />
              ))}
              {isTyping && (
                <div className="mb-4">
                  <TypingIndicator />
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </motion.button>
        </div>
      </div>
    </div>
  );
}
