'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="max-w-6xl mx-auto mt-6"
    >
      <Link href="/dashboard">
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 
                   rounded-2xl shadow-2xl border border-gray-700 cursor-pointer group"
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 
                              rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Collaborative Dashboard
                  </h3>
                  <p className="text-sm text-gray-400">
                    Full-featured real-time workspace
                  </p>
                </div>
              </div>
              
              <motion.div
                whileHover={{ x: 5 }}
                className="text-indigo-400 group-hover:text-indigo-300 transition-colors"
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </motion.div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl mb-1">👥</div>
                <p className="text-xs text-gray-400">Active Users</p>
                <p className="text-sm font-semibold text-white mt-1">Live tracking</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl mb-1">💬</div>
                <p className="text-xs text-gray-400">Real-time Chat</p>
                <p className="text-sm font-semibold text-white mt-1">Instant sync</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl mb-1">⚡</div>
                <p className="text-xs text-gray-400">Socket.IO</p>
                <p className="text-sm font-semibold text-white mt-1">WebSocket</p>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
