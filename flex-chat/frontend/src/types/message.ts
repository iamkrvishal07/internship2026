export type Receipt = {
  deliveredUserIds: number[];
  readUserIds: number[];
  deliveredAt?: string;
  readAt?: string;
};

export type Message = {
  id: number;
  chatId: number;
  senderId: number;
  senderName: string;
  senderAvatarUrl: string;
  content: string;
  contentType: string;
  createdAt: string;
  isDeleted: boolean;
  isEdited: boolean;
  editedAt?: string;
  receipt?: Receipt;
  parentId?: number | null;
  parentPreview?: {
    id: number;
    senderId: number;
    senderName: string;
    content: string;
    contentType: string;
    isDeleted: boolean;
  } | null;
  status?: "sending" | "sent" | "delivered" | "read";
  reactions?: Reaction[];
};

export type Reaction = {
  emojiCode: string;
  count: number;
  userIds: number[];
};
