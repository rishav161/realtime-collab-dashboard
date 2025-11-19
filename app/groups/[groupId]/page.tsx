'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
}

export default function GroupDashboard({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const { user } = useUser();
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGroup();
    loadUsers();
  }, [groupId]);

  const loadGroup = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();
      if (data.group) {
        setGroup(data.group);
      }
    } catch (error) {
      console.error('Error loading group:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      
      let users: User[] = [];
      if (Array.isArray(data)) {
        users = data;
      } else if (data.users) {
        users = data.users;
      }
      
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/groups/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          groupId, 
          userIds: selectedUsers 
        }),
      });

      if (res.ok) {
        setSelectedUsers([]);
        setShowAddModal(false);
        setSearchQuery('');
        loadGroup();
      }
    } catch (error) {
      console.error('Error adding members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if current user is admin - need to get database user ID
  const [currentDbUser, setCurrentDbUser] = useState<any>(null);
  
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const res = await fetch('/api/users/me');
        const data = await res.json();
        if (data.user) {
          setCurrentDbUser(data.user);
        }
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };
    
    if (user) {
      loadCurrentUser();
    }
  }, [user]);
  
  const isAdmin = group?.adminId === currentDbUser?.id;
  
  // Filter users who are not already members
  const existingMemberIds = group?.members?.map((m: any) => m.user.id) || [];
  const availableUsers = allUsers.filter(u => !existingMemberIds.includes(u.id));
  
  const filteredUsers = availableUsers.filter(u =>
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{group?.name}</h1>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                Created by {group?.admin?.firstName || group?.admin?.email}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/groups/${groupId}/chat`)}
              className="px-6 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100"
            >
              Open Chat
            </motion.button>
          </div>

          {/* Members */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Members ({group?.members?.length || 0})
              </h2>
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium text-sm hover:bg-neutral-800 dark:hover:bg-neutral-100 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Members
                </motion.button>
              )}
            </div>
            <div className="space-y-2">
              {group?.members?.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                >
                  {member.user.imageUrl ? (
                    <img
                      src={member.user.imageUrl}
                      alt={member.user.firstName || member.user.email}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-semibold">
                      {member.user.firstName?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {member.user.firstName} {member.user.lastName}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{member.user.email}</p>
                  </div>
                  {member.user.id === group?.adminId && (
                    <span className="px-3 py-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm rounded-full font-medium">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Members Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md border border-neutral-200 dark:border-neutral-800">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Add Members</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                  {/* Search */}
                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 pl-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                    />
                    <svg className="w-5 h-5 absolute left-3 top-2.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Selected Count */}
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                  </p>

                  {/* User List */}
                  <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg max-h-80 overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                        {availableUsers.length === 0 ? 'All users are already members' : 'No users found'}
                      </div>
                    ) : (
                      filteredUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => toggleUser(u.id)}
                          className={`w-full flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-200 dark:border-neutral-700 last:border-b-0 ${
                            selectedUsers.includes(u.id) ? 'bg-neutral-100 dark:bg-neutral-800' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(u.id)}
                            onChange={() => {}}
                            className="w-5 h-5 rounded"
                          />
                          {u.imageUrl ? (
                            <img src={u.imageUrl} alt={u.firstName} className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-semibold text-sm">
                              {u.firstName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-medium text-neutral-900 dark:text-white truncate">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                              {u.email}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 p-6 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMembers}
                    disabled={loading || selectedUsers.length === 0}
                    className="flex-1 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Adding...' : `Add ${selectedUsers.length || ''}`}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
