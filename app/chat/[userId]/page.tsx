'use client';

import { useEffect, useRef, useState, use } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/hooks/useChatStore';
import { useSocket } from '@/hooks/useSocket';
import MessageBubble from '@/components/MessageBubble';
import TypingIndicator from '@/components/TypingIndicator';
import { motion } from 'framer-motion';

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
    if (!socket || !currentUser) return;

    socket.emit('private:join', { userId: currentUser.id, otherUserId });

    const handlePrivateMessage = (data: any) => {
      if (data.senderId !== currentUser.id) {
        addMessage({
          id: data.id || Date.now().toString(),
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
          timestamp: data.timestamp,
        });
      }
    };

    socket.on('private:message', handlePrivateMessage);

    return () => {
      socket.off('private:message', handlePrivateMessage);
    };
  }, [socket, currentUser, otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadCurrentUser = async () => {
    try {
      const res = await fetch('/api/users/me');
      const data = await res.json();
      if (data.user) setCurrentUser(data.user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/chat/messages?userId=${otherUserId}`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadOtherUser = async () => {
    try {
      const res = await fetch(`/api/users/${otherUserId}`);
      const data = await res.json();
      if (data.user) setOtherUser(data.user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !currentUser) return;

    const content = input.trim();
    const tempId = `temp-${Date.now()}`;
    setInput('');

    const optimisticMessage = {
      id: tempId,
      senderId: currentUser.id,
      receiverId: otherUserId,
      content,
      timestamp: new Date().toISOString(),
    };
    addMessage(optimisticMessage);

    try {
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
        
        socket.emit('private:message', messageData);
      }
    } catch (error) {
      console.error('Error sending message:', error);
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

  const isOnline = onlineUsers.has(otherUserId);
  const isTyping = typingUsers.has(otherUserId);

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-6">
          <button
            onClick={() => router.push('/chats')}
            className="mr-4 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              {otherUser?.imageUrl ? (
                <img
                  src={otherUser.imageUrl}
                  alt={otherUser.firstName}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-semibold">
                  {otherUser?.firstName?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900" />
              )}
            </div>

            <div>
              <h2 className="font-semibold text-neutral-900 dark:text-white">
                {otherUser?.firstName} {otherUser?.lastName}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-neutral-400 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 font-medium">No messages yet</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
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
                  senderName={msg.senderId === currentUser?.id ? undefined : otherUser?.firstName}
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

        {/* Input */}
        <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
