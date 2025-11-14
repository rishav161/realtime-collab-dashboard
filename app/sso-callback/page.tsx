'use client';

import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleRedirectCallback();
        
        // Sync user to database
        try {
          await fetch('/api/users/sync', { method: 'POST' });
          console.log('✅ User synced to database');
        } catch (syncError) {
          console.error('❌ Failed to sync user:', syncError);
        }
        
        router.push('/dashboard');
      } catch (error) {
        console.error('SSO callback error:', error);
        router.push('/sign-in');
      }
    };

    handleCallback();
  }, [handleRedirectCallback, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-semibold">Completing sign in...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait</p>
      </div>
    </div>
  );
}
