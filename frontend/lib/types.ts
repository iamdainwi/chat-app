export interface User {
  id: string;
  username: string;
  avatar?: string | null;
}

export interface Room {
  id: string;
  name: string;
  description?: string | null;
  messageCount?: number;
  lastMessage?: Message | null;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  username: string;
  userId?: string | null;
  roomId: string;
  createdAt: string;
  user?: User | null;
  reactions?: Record<string, string[]>; // emoji -> array of usernames
}

export interface RoomUser {
  socketId: string;
  username: string;
  avatar?: string | null;
}

export interface UserStatusEvent {
  type: 'join' | 'leave';
  username: string;
  timestamp: string;
}

export interface UserTypingEvent {
  roomId: string;
  username: string;
  isTyping: boolean;
}
