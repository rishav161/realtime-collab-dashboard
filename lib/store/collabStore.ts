import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

interface CollabState {
  // Users
  users: User[];
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateUserStatus: (userId: string, online: boolean) => void;
  setUsers: (users: User[]) => void;

  // Messages
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;

  // Connection
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

export const useCollabStore = create<CollabState>((set) => ({
  // Users
  users: [],
  
  addUser: (user) =>
    set((state) => ({
      users: [...state.users.filter((u) => u.id !== user.id), user],
    })),

  removeUser: (userId) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    })),

  updateUserStatus: (userId, online) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, online } : u
      ),
    })),

  setUsers: (users) => set({ users }),

  // Messages
  messages: [],

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message].slice(-50), // Keep last 50 messages
    })),

  clearMessages: () => set({ messages: [] }),

  // Connection
  isConnected: false,
  setIsConnected: (connected) => set({ isConnected: connected }),
}));
