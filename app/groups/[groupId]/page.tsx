'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function GroupDashboard({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const { user } = useUser();
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGroup();
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

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/groups/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, email: inviteEmail.trim() }),
      });

      if (res.ok) {
        setInviteEmail('');
        loadGroup();
      }
    } catch (error) {
      console.error('Error inviting user:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = group?.adminId === user?.id;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{group?.name}</h1>
              <p className="text-gray-500 mt-1">
                Created by {group?.admin?.firstName || group?.admin?.email}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/groups/${groupId}/chat`)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
            >
              Open Chat
            </motion.button>
          </div>

          {/* Members */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Members ({group?.members?.length || 0})
            </h2>
            <div className="space-y-2">
              {group?.members?.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {member.user.imageUrl ? (
                    <img
                      src={member.user.imageUrl}
                      alt={member.user.firstName || member.user.email}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="font-semibold">
                        {member.user.firstName?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">
                      {member.user.firstName || member.user.email}
                    </p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                  {member.user.id === group?.adminId && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Invite (Admin Only) */}
          {isAdmin && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Invite Members</h2>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleInvite}
                  disabled={loading || !inviteEmail.trim()}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Inviting...' : 'Invite'}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
