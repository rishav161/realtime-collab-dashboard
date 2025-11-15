'use client';

import { useEffect, useRef, useState, use } from 'react';
import { useUser } from '@clerk/nextjs';
import { useGroupStore } from '@/hooks/useGroupStore';
import { useSocket } from '@/hooks/useSocket';
import MessageBubble from '@/components/MessageBubble';
import TypingIndicator from '@/components/TypingIndicator';
import { motion } from 'framer-motion';

export default function GroupChatPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const { user } = useUser();
  const [input, setInput] = useState('');
  const [group, setGroup] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    groupMessages,
    setGroupMessages,
    addGroupMessage,
    groupMembers,
    setGroupMembers,
    typingUsers,
    onlineUsers,
    setActiveGroupId,
  } = useGroupStore();

  const { socket } = useSocket();

  useEffect(() => {
    setActiveGroupId(groupId);
    loadGroup();
    loadMessages();

    return () => {
      setActiveGroupId(null);
    };
  }, [groupId]);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('group:join', { groupId, userId: user.id });

    socket.on('group:message', (data) => {
      addGroupMessage({
        id: Date.now().toString(),
        groupId: data.groupId,
        senderId: data.senderId,
        content: data.content,
        timestamp: data.timestamp,
      });
    });

    return () => {
      socket.emit('group:leave', { groupId, userId: user.id });
      socket.off('group:message');
    };
  }, [socket, user, groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages]);

  const loadGroup = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();
      if (data.group) {
        setGroup(data.group);
        setGroupMembers(data.group.members);
      }
    } catch (error) {
      console.error('Error loading group:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/groups/messages?groupId=${groupId}`);
      const data = await res.json();
      if (data.messages) {
        setGroupMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const content = input.trim();
    setInput('');

    try {
      const res = await fetch('/api/groups/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, content }),
      });

      const data = await res.json();
      if (data.message && socket) {
        socket.emit('group:message', {
          groupId,
          senderId: user.id,
          content,
          timestamp: data.message.timestamp,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (!socket || !user) return;

    socket.emit('group:typing', { groupId, userId: user.id, isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('group:typing', { groupId, userId: user.id, isTyping: false });
    }, 2000);
  };

  const getSenderInfo = (senderId: string) => {
    const message = groupMessages.find((m) => m.senderId === senderId);
    const member = groupMembers.find((m) => m.userId === senderId);
    return member?.user;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Members */}
      <div className="w-64 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">{group?.name}</h2>
          <p className="text-sm text-gray-500">{groupMembers.length} members</p>
        </div>
        <div className="p-2">
          {groupMembers.map((member) => {
            const isOnline = onlineUsers.has(member.userId);
            const isAdmin = member.userId === group?.adminId;
            return (
              <div
                key={member.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-50"
              >
                <div className="relative">
                  {member.user.imageUrl ? (
                    <img
                      src={member.user.imageUrl}
                      alt={member.user.firstName || member.user.email}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold">
                      {member.user.firstName?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.user.firstName || member.user.email}
                  </p>
                  {isAdmin && (
                    <span className="text-xs text-blue-600">Admin</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <h1 className="font-semibold text-lg">{group?.name}</h1>
          <p className="text-sm text-gray-500">Group Chat</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {groupMessages.map((msg) => {
            const sender = getSenderInfo(msg.senderId);
            return (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                timestamp={msg.timestamp}
                isOwn={msg.senderId === user?.id}
                senderName={sender?.firstName || sender?.email}
                senderImage={sender?.imageUrl}
              />
            );
          })}
          {typingUsers.size > 0 && (
            <div className="mb-4">
              <TypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t px-6 py-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600"
            >
              Send
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
