import OnlineDot from "../../components/common/OnlineDot";
import { ChatType } from "../../constants/app/appConstants";
import { useCurrentUserId } from "../../hooks/useCurrentUserId";
import { useTypingStore } from "../../stores/typingStore";
import { formatLocalDateTime } from "../../utils/dateUtils";
import { CHAT_LIST_AVATAR_COLORS } from "../../constants/avatarColors";

import type { Conversation, Member } from "../../types/chat";

function getOtherMember(
  members: Member[],
  currentUserId: number | null,
): Member | undefined {
  return members.find((m) => m.userId !== currentUserId);
}

function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface ChatListItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

function ChatListItem({ conversation, isActive, onClick }: ChatListItemProps) {
  const CURRENT_USER_ID = useCurrentUserId();
  const typingByChatId = useTypingStore((s) => s.typingByChatId);
  const isTyping = conversation.id in typingByChatId;
  const isGroup = conversation.type === ChatType.group;
  const otherMember = !isGroup
    ? getOtherMember(conversation.members, CURRENT_USER_ID)
    : null;

  const displayName = isGroup
    ? conversation.name || "Unnamed Group"
    : otherMember?.fullName || "Unknown User";

  const avatarUrl = isGroup
    ? conversation.imageUrl || ""
    : otherMember?.avatarUrl || "";

  const initials = getInitials(displayName);

  const avatarColorClass =
    CHAT_LIST_AVATAR_COLORS[(isGroup ? conversation.id : otherMember?.userId ?? 0) % CHAT_LIST_AVATAR_COLORS.length];

  const hasUnread = conversation.unreadCount > 0;
  const isSentByMe =
    conversation?.lastMessage?.senderId === CURRENT_USER_ID;

  return (
<button
  onClick={onClick}
  className={`flex w-full items-center gap-4 px-2 py-3 rounded-xl border transition-all duration-150 text-left ${
    isActive
      ? "bg-indigo-50 border-indigo-100"
      : "bg-white border-transparent hover:bg-gray-50"
  }`}
>
      <div className="relative shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold ${
              isActive ? "bg-gray-100 text-gray-700" : avatarColorClass
            }`}
          >
            {initials}
          </div>
        )}

        {!isGroup && (
          <OnlineDot userId={otherMember?.userId ?? 0} showOnlineText={false} />
        )}

        {isGroup && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-gray-600 rounded-full border-2 border-black flex items-center justify-center">
            <svg width="7" height="7" viewBox="0 0 24 24" fill="white">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={`text-sm truncate ${
              hasUnread ? "font-bold text-gray-900" : "font-medium text-gray-800"
            }`}
          >
            {displayName}
          </span>
          <span
            className={`text-xs shrink-0 ml-2 ${
              hasUnread ? "text-green-600 font-semibold" : "text-gray-400"
            }`}
          >
            {formatLocalDateTime(conversation.lastMessage?.createdAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-xs truncate flex-1 ${
              isTyping
                ? "text-green-500 italic"
                : hasUnread
                  ? "text-gray-700 font-medium"
                  : "text-gray-400"
            }`}
          >
            {isTyping ? (
              <span className="flex items-center gap-1.5">
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-green-500 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1 h-1 bg-green-500 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1 h-1 bg-green-500 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
                <span>
                  {isGroup && typingByChatId[conversation.id]} typing...
                </span>
              </span>
            ) : (
              <>
                {isGroup && conversation.lastMessage && !isSentByMe && (
                  <span className="text-gray-500 mr-1">
                    {conversation.lastMessage.senderName?.split(" ")[0]}:
                  </span>
                )}
                {!isGroup && isSentByMe && (
                  <span className="text-gray-400 mr-1">You:</span>
                )}
                {conversation.lastMessage?.isDeleted ? (
                  <em className="text-gray-400">This message was deleted</em>
                ) : (
                  conversation.lastMessage?.content
                )}
              </>
            )}
          </span>

          {hasUnread && (
            <span className="shrink-0 w-5 h-5 bg-green-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default ChatListItem;
