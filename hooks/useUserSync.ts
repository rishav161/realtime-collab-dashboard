'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export function useUserSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [synced, setSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !isSignedIn || !user || synced) return;

      try {
        const response = await fetch('/api/users/sync', {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to sync user');
        }

        setSynced(true);
        console.log('✅ User synced to database');
      } catch (err) {
        console.error('❌ Error syncing user:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user, synced]);

  return { synced, error };
}
