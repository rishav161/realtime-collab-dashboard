'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SSOCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Sync user to database after OAuth
        await fetch('/api/users/sync', { method: 'POST' });
        console.log('✅ User synced to database');
        
        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('SSO callback error:', error);
        router.push('/sign-in');
      }
    };

    // Small delay to ensure Clerk session is ready
    const timer = setTimeout(handleCallback, 1000);
    return () => clearTimeout(timer);
  }, [router]);

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
