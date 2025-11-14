import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';

/**
 * Get user from database by Clerk ID
 */
export async function getUserFromDb() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  return user;
}

/**
 * Sync Clerk user to database
 */
export async function syncUserToDb() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    throw new Error('User not found');
  }

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      updatedAt: new Date(),
    },
    create: {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
  });

  return user;
}

/**
 * Get all users from database
 */
export async function getAllUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return users;
}
