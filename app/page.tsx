'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useStore } from '@/lib/store';
import { useCollabStore } from '@/lib/store/collabStore';
import { ActivityIndicator } from '@/components/ActivityIndicator';
import { DashboardPreview } from '@/components/DashboardPreview';
import { UserMenu } from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const [messageInput, setMessageInput] = useState('');
  const { sendMessage, emitCustomEvent } = useSocket();
  const { count, setCount } = useStore();
  const { messages } = useCollabStore();

  // Listen for counter sync from other clients
  useEffect(() => {
    const handleCounterSync = (event: any) => {
      setCount(event.detail);
    };

    window.addEventListener('counter-sync', handleCounterSync);
    return () => window.removeEventListener('counter-sync', handleCounterSync);
  }, [setCount]);

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    emitCustomEvent('data_sync', { count: newCount });
  };

  const handleDecrement = () => {
    const newCount = count - 1;
    setCount(newCount);
    emitCustomEvent('data_sync', { count: newCount });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessage(messageInput);
    setMessageInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <nav className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Real-Time Dashboard
          </h1>
          <ActivityIndicator />
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/chats'}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
          >
            💬 Chats
          </motion.button>
          <ThemeToggle />
          <UserMenu />
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          
          {/* Counter Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">
              Shared Counter
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Changes sync across all connected clients
            </p>
            
            <div className="text-center">
              <motion.div
                key={count}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-7xl font-bold text-indigo-600 dark:text-indigo-400 mb-8"
              >
                {count}
              </motion.div>

              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDecrement}
                  className="px-8 py-3 bg-red-500 text-white rounded-lg font-semibold 
                           hover:bg-red-600 transition shadow-md"
                >
                  −
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleIncrement}
                  className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold 
                           hover:bg-green-600 transition shadow-md"
                >
                  +
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Messages Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">
              Live Chat
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Messages broadcast to all users
            </p>

            {/* Messages List */}
            <div className="mb-4 h-64 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center text-sm py-8">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                        {msg.senderName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-white text-sm">{msg.content}</p>
                  </motion.div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-800 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="px-6 py-2 bg-indigo-500 text-white rounded-lg font-semibold 
                         hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </motion.button>
            </div>
          </motion.div>

        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                🚀 Real-Time Collaboration Engine
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Open this page in multiple tabs or devices to see real-time synchronization in action. 
                The counter and messages update instantly across all connected clients using Socket.IO + Zustand.
              </p>
            </div>
            <motion.a
              href="/dashboard"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
                       rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
            >
              Go to Dashboard →
            </motion.a>
          </div>
        </motion.div>

        <DashboardPreview />
      </main>
    </div>
  );
}
