import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { groupId, email, userIds } = body;

    if (!groupId || (!email && !userIds)) {
      return NextResponse.json({ error: 'groupId and either email or userIds are required' }, { status: 400 });
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get group and verify admin
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (group.adminId !== currentUser.id) {
      return NextResponse.json({ error: 'Only group admin can invite users' }, { status: 403 });
    }

    // Handle multiple user IDs
    if (userIds && Array.isArray(userIds)) {
      const members = [];
      
      for (const userId of userIds) {
        // Check if user exists
        const userExists = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!userExists) continue;

        // Check if already a member
        const existingMember = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId,
              userId,
            },
          },
        });

        if (existingMember) continue;

        // Add user to group
        const member = await prisma.groupMember.create({
          data: {
            groupId,
            userId,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        });

        members.push(member);
      }

      return NextResponse.json({ members, count: members.length });
    }

    // Handle single email (legacy support)
    if (email) {
      const userToInvite = await prisma.user.findUnique({
        where: { email },
      });

      if (!userToInvite) {
        return NextResponse.json({ error: 'User with this email not found' }, { status: 404 });
      }

      // Check if user is already a member
      const existingMember = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: userToInvite.id,
          },
        },
      });

      if (existingMember) {
        return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
      }

      // Add user to group
      const member = await prisma.groupMember.create({
        data: {
          groupId,
          userId: userToInvite.id,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
      });

      return NextResponse.json({ member });
    }

    return NextResponse.json({ error: 'No valid users to add' }, { status: 400 });
  } catch (error) {
    console.error('Error inviting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
