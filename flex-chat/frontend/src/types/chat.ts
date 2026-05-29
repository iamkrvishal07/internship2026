import type { Theme } from "./theme";

export interface LastMessage {
  id: number;
  senderId: number;
  senderName: string;
  contentType: string;
  content: string;
  createdAt: string;
  isDeleted: boolean;
}

export interface Member {
  userId: number;
  fullName: string;
  avatarUrl: string;
  role: string;
  joinedAt: string;
  leftAt: string | null;
}

export interface Conversation {
  id: number;
  type: string;
  name: string;
  imageUrl: string;
  description: string;
  createdBy: number;
  createdAt: string;
  lastMessage: LastMessage;
  unreadCount: number;
  members: Member[];
}
export interface Chat {
  id: number;
  type: string;
  name: string;
  imageUrl?: string;
  description?: string;
  createdBy: number;
  members: Member[];
}

export interface UserChatPreference {
  id: number;
  chatId: number;
  nickname: string | null;
  fontName: string;
  themeId: number | null;
  theme: Theme | null;
  isMuted: boolean;
  isPinned: boolean;
  isArchived: boolean;
}

