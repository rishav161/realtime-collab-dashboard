'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { useUserSync } from '@/hooks/useUserSync';

type ChatType = 'all' | 'direct' | 'groups';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
}

export default function ChatsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<ChatType>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Sync user to database
  useUserSync();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [usersRes, groupsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/groups/list')
      ]);

      const usersData = await usersRes.json();
      const groupsData = await groupsRes.json();

      console.log('Users data:', usersData);
      console.log('Groups data:', groupsData);

      // Handle different response formats and filter out current user
      let allUsers: User[] = [];
      if (Array.isArray(usersData)) {
        allUsers = usersData;
      } else if (usersData.users) {
        allUsers = usersData.users;
      }
      
      // Filter out current user from the list
      const filteredUsers = allUsers.filter(u => u.email !== user?.primaryEmailAddress?.emailAddress);
      setUsers(filteredUsers);

      if (groupsData.groups) {
        // Transform groups to include memberCount
        const transformedGroups = groupsData.groups.map((g: any) => ({
          id: g.id,
          name: g.name,
          description: g.description,
          memberCount: g.members?.length || 0
        }));
        setGroups(transformedGroups);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(g =>
    g.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Top Navbar */}
      <div className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Messages</h1>
          <button
            onClick={loadData}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'direct'
                ? 'text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'groups'
                ? 'text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Groups
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-8 h-8 border-4 border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading conversations...</p>
            </div>
          ) : (
            <div className="p-2">
              {/* ALL TAB - Shows both Direct Messages and Groups */}
              {activeTab === 'all' && (
                <>
                  {/* Direct Messages Section */}
                  {filteredUsers.length > 0 && (
                    <>
                      <div className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Direct Messages
                      </div>
                      {filteredUsers.map((u) => (
                        <motion.button
                          key={u.id}
                          onClick={() => router.push(`/chat/${u.id}`)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          {u.imageUrl ? (
                            <img src={u.imageUrl} alt={u.firstName} className="w-12 h-12 rounded-full" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-semibold">
                              {u.firstName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                              {u.firstName} {u.lastName}
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                              {u.email}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </>
                  )}

                  {/* Groups Section */}
                  {filteredGroups.length > 0 && (
                    <>
                      <div className="px-3 py-2 mt-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Groups
                      </div>
                      {filteredGroups.map((g) => (
                        <motion.button
                          key={g.id}
                          onClick={() => router.push(`/groups/${g.id}`)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                            <svg className="w-6 h-6 text-neutral-600 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                              {g.name}
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                              {g.memberCount} members
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </>
                  )}

                  {filteredUsers.length === 0 && filteredGroups.length === 0 && (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400 text-sm">
                      No conversations found
                    </div>
                  )}
                </>
              )}

              {/* DIRECT TAB - Shows only Direct Messages */}
              {activeTab === 'direct' && (
                <>
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400 text-sm">
                      No users found
                    </div>
                  ) : (
                    filteredUsers.map((u) => (
                      <motion.button
                        key={u.id}
                        onClick={() => router.push(`/chat/${u.id}`)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {u.imageUrl ? (
                          <img src={u.imageUrl} alt={u.firstName} className="w-12 h-12 rounded-full" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-semibold">
                            {u.firstName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                            {u.firstName} {u.lastName}
                          </h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                            {u.email}
                          </p>
                        </div>
                      </motion.button>
                    ))
                  )}
                </>
              )}

              {/* GROUPS TAB - Shows only Groups with Create button */}
              {activeTab === 'groups' && (
                <>
                  <motion.button
                    onClick={() => router.push('/groups/create')}
                    className="w-full flex items-center gap-3 p-3 mb-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="font-semibold">Create New Group</span>
                  </motion.button>

                  {filteredGroups.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400 text-sm">
                      No groups yet. Create one to get started!
                    </div>
                  ) : (
                    filteredGroups.map((g) => (
                      <motion.button
                        key={g.id}
                        onClick={() => router.push(`/groups/${g.id}`)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                          <svg className="w-6 h-6 text-neutral-600 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                            {g.name}
                          </h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                            {g.memberCount} members
                          </p>
                        </div>
                      </motion.button>
                    ))
                  )}
                </>
              )}
            </div>
          )}
        </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-400 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Select a conversation
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Choose a chat from the sidebar to start messaging
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
