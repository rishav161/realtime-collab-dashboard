import { create } from 'zustand';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

interface ChatStore {
  activeUserId: string | null;
  messages: Message[];
  typingUsers: Set<string>;
  onlineUsers: Set<string>;
  
  setActiveUserId: (userId: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeUserId: null,
  messages: [],
  typingUsers: new Set(),
  onlineUsers: new Set(),

  setActiveUserId: (userId) => set({ activeUserId: userId }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  
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
  
  clearMessages: () => set({ messages: [] }),
}));
