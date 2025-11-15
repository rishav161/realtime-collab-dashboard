'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ChatNavigation() {
  const router = useRouter();

  return (
    <div className="flex gap-3">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/chats')}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
      >
        💬 Open Chats
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/groups/create')}
        className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
      >
        👥 Create Group
      </motion.button>
    </div>
  );
}
