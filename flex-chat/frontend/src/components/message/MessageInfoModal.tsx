import { useEffect, useRef } from "react";

import { getDefaultAvatar } from "../../constants/defaults";
import { formatLocalDateTime, formatLocalTime } from "../../utils/dateUtils";

import type { Message } from "../../types/message";

type Props = {
  message: Message;
  onClose: () => void;
  members?: Array<{
    userId: number;
    fullName: string;
    avatarUrl: string;
  }> | null;
  currentUserId?: number;
};

const MessageInfoModal = ({
  message,
  onClose,
  members,
  currentUserId,
}: Props) => {
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const isGroup = members && members.length > 0;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20"
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-900">
            Message info
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2 break-words">
            {message.isDeleted ? (
              <em className="text-gray-400">Message deleted</em>
            ) : (
              message.content
            )}
          </p>
        </div>

        {!isGroup && (
          <div className="px-4 py-2">
            {[
              {
                icon: "ti-send",
                iconColor: "#6366f1",
                label: "Sent",
                value: formatLocalDateTime(message.createdAt),
                valueColor: "#111827",
              },
              {
                icon: "ti-check",
                iconColor: "#9ca3af",
                label: "Delivered",
                value: formatLocalDateTime(message.receipt?.deliveredAt),
                valueColor: message.receipt?.deliveredAt
                  ? "#111827"
                  : "#9ca3af",
              },
              {
                icon: "ti-checks",
                iconColor: message.receipt?.readAt ? "#3b82f6" : "#9ca3af",
                label: "Read",
                value: formatLocalDateTime(message.receipt?.readAt),
                valueColor: message.receipt?.readAt ? "#3b82f6" : "#9ca3af",
              },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className={`flex items-center gap-3 py-3 ${
                  i < arr.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <i
                  className={`ti ${row.icon}`}
                  style={{ fontSize: 16, color: row.iconColor, flexShrink: 0 }}
                  aria-hidden="true"
                />
                <span className="text-sm text-gray-400 w-20 shrink-0">
                  {row.label}
                </span>
                <span
                  className="text-sm font-medium ml-auto"
                  style={{ color: row.valueColor }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {isGroup && (
          <div className="px-4 py-2 max-h-72 overflow-y-auto">
            <div className="flex items-center gap-3 py-3 border-b border-gray-100">
              <i
                className="ti ti-send"
                style={{ fontSize: 16, color: "#6366f1", flexShrink: 0 }}
                aria-hidden="true"
              />
              <span className="text-sm text-gray-400 w-20 shrink-0">
                Sent
              </span>
              <span className="text-sm font-medium ml-auto text-gray-900">
                {formatLocalDateTime(message.createdAt)}
              </span>
            </div>

            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mt-3 mb-1">
              Read by
            </p>
            {members
              .filter((m) => message.receipt?.readUserIds?.includes(m.userId))
              .map((m) => (
                <div key={m.userId} className="flex items-center gap-3 py-2">
                  <img
                    src={
                      m.avatarUrl ||
                      getDefaultAvatar(m.userId)
                    }
                    alt={m.fullName}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <span className="text-sm text-gray-900 flex-1">
                    {m.fullName}
                  </span>
                  <span className="text-xs text-blue-500">
                    {formatLocalTime(message.receipt?.readAt)}
                  </span>
                </div>
              ))}
            {message.receipt?.readUserIds?.length === 0 && (
              <p className="text-xs text-gray-400 py-2">
                No one has read this yet
              </p>
            )}

            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mt-3 mb-1">
              Delivered to
            </p>
            {members
              .filter((m) =>
                message.receipt?.deliveredUserIds?.includes(m.userId),
              )
              .map((m) => (
                <div key={m.userId} className="flex items-center gap-3 py-2">
                  <img
                    src={
                      m.avatarUrl ||
                      getDefaultAvatar(m.userId)
                    }
                    alt={m.fullName}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <span className="text-sm text-gray-900 flex-1">
                    {m.fullName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatLocalTime(message.receipt?.deliveredAt)}
                  </span>
                </div>
              ))}
            {message.receipt?.deliveredUserIds?.length === 0 && (
              <p className="text-xs text-gray-400 py-2">Not delivered yet</p>
            )}
          </div>
        )}

        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
            Reactions
          </p>

          {!message.reactions || message.reactions.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-1">
              No reactions yet
            </p>
          ) : (
            <div className="space-y-2">
              {message.reactions.map((reaction) => (
                <div
                  key={reaction.emojiCode}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center gap-1.5 w-14 shrink-0">
                    <span className="text-lg leading-none">
                      {reaction.emojiCode}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {reaction.count}
                    </span>
                  </div>

                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex -space-x-2">
                      {reaction.userIds.slice(0, 5).map((userId) => {
                        const member = members?.find(
                          (m) => m.userId == userId,
                        );
                        return (
                          <img
                            key={userId}
                            src={
                              member?.avatarUrl ||
                              getDefaultAvatar(userId)
                            }
                            alt={member?.fullName ?? String(userId)}
                            title={member?.fullName}
                            className="w-6 h-6 rounded-full object-cover border-2 border-white"
                          />
                        );
                      })}
                    </div>

                <span className="text-xs text-gray-500 ml-2 truncate">
  {reaction.userIds
    .slice(0, 2)
    .map((uid) => {
      if (uid == currentUserId) return "You";

      return (
        members?.find((m) => m.userId === uid)?.fullName ??
        `User ${uid}`
      );
    })
    .join(", ")}

  {reaction.userIds.length > 2 &&
    ` +${reaction.userIds.length - 2} more`}
</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInfoModal;
