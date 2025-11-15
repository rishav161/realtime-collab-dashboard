'use client';

import { motion } from 'framer-motion';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isOwn: boolean;
  senderName?: string;
  senderImage?: string | null;
}

export default function MessageBubble({
  content,
  timestamp,
  isOwn,
  senderName,
  senderImage,
}: MessageBubbleProps) {
  const formattedTime = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isOwn && (
        <div className="flex-shrink-0">
          {senderImage ? (
            <img
              src={senderImage}
              alt={senderName}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-semibold text-white">
              {senderName?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {!isOwn && senderName && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-2">{senderName}</span>
        )}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-sm'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
          }`}
        >
          <p className="text-sm break-words">{content}</p>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-2">{formattedTime}</span>
      </div>
    </motion.div>
  );
}
