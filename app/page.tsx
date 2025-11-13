'use client';

import { UserButton } from '@clerk/nextjs';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';

export default function Home() {
  const { count, increment, decrement } = useStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <UserButton afterSignOutUrl="/" />
      </nav>

      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
              Zustand Counter Demo
            </h2>
            
            <div className="text-center">
              <motion.div
                key={count}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-6xl font-bold text-indigo-600 dark:text-indigo-400 mb-8"
              >
                {count}
              </motion.div>

              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={decrement}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                >
                  Decrement
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={increment}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  Increment
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
