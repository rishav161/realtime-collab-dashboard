'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface Group {
  id: string;
  name: string;
  adminId: string;
  createdAt: string;
  admin: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  members: any[];
  _count: {
    messages: number;
  };
}

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const res = await fetch('/api/groups/list');
      const data = await res.json();
      if (data.groups) {
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Create Group Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push('/groups/create')}
        className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all font-medium"
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">+</span>
          <span>Create New Group</span>
        </div>
      </motion.button>

      {groups.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">No groups yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Create your first group to get started
          </p>
        </div>
      ) : (
        groups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/groups/${group.id}`)}
            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-all border border-transparent hover:border-indigo-500/20 dark:hover:border-indigo-400/20"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700 flex-shrink-0">
              <span className="text-white text-xl font-bold">
                {group.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {group.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {group.members.length} members · {group._count.messages} messages
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Admin: {group.admin.firstName || group.admin.email}
              </p>
            </div>
            <div className="text-gray-400 dark:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
