import { create } from 'zustand';

interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

interface GroupMember {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  joinedAt: string;
}

interface GroupStore {
  activeGroupId: string | null;
  groupMessages: GroupMessage[];
  groupMembers: GroupMember[];
  typingUsers: Set<string>;
  onlineUsers: Set<string>;
  
  setActiveGroupId: (groupId: string | null) => void;
  setGroupMessages: (messages: GroupMessage[]) => void;
  addGroupMessage: (message: GroupMessage) => void;
  setGroupMembers: (members: GroupMember[]) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  clearGroupMessages: () => void;
}

export const useGroupStore = create<GroupStore>((set) => ({
  activeGroupId: null,
  groupMessages: [],
  groupMembers: [],
  typingUsers: new Set(),
  onlineUsers: new Set(),

  setActiveGroupId: (groupId) => set({ activeGroupId: groupId }),
  
  setGroupMessages: (messages) => set({ groupMessages: messages }),
  
  addGroupMessage: (message) => set((state) => ({
    groupMessages: [...state.groupMessages, message],
  })),
  
  setGroupMembers: (members) => set({ groupMembers: members }),
  
  setTyping: (userId, isTyping) => set((state) => {
    const newTypingUsers = new Set(state.typingUsers);
    if (isTyping) {
      newTypingUsers.add(userId);
    } else {
      newTypingUsers.delete(userId);
    }
    return { typingUsers: newTypingUsers };
  }),
  
  setUserOnline: (userId) => set((state) => ({
    onlineUsers: new Set(state.onlineUsers).add(userId),
  })),
  
  setUserOffline: (userId) => set((state) => {
    const newOnlineUsers = new Set(state.onlineUsers);
    newOnlineUsers.delete(userId);
    return { onlineUsers: newOnlineUsers };
  }),
  
  clearGroupMessages: () => set({ groupMessages: [] }),
}));
