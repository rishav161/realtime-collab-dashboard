'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollabStore } from '@/lib/store/collabStore';

export function ActivityIndicator() {
  const [mounted, setMounted] = useState(false);
  const { users, isConnected } = useCollabStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ scale: isConnected ? [1, 1.2, 1] : 1 }}
          transition={{ repeat: isConnected ? Infinity : 0, duration: 2 }}
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>

      {/* Active Users */}
      {users.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <AnimatePresence>
              {users.slice(0, 5).map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 
                           flex items-center justify-center text-white text-xs font-semibold"
                  style={{ backgroundColor: user.avatar }}
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {users.length} {users.length === 1 ? 'user' : 'users'} online
          </span>
        </div>
      )}
    </div>
  );
}
