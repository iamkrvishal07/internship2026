import React, { useEffect, useRef, useState } from "react";

import EmojiPicker from "emoji-picker-react";
import {
  FiEdit2,
  FiInfo,
  FiSmile,
  FiTrash2,
  FiCornerUpLeft,
} from "react-icons/fi";

import { getDefaultAvatar } from "../../constants/defaults";
import { toggleReaction } from "../../services/signalRService";
import { useStreamingStore } from "../../stores/streamingStore";
import { formatLocalDateTime } from "../../utils/dateUtils";
import MarkdownRenderer from "../ui/MarkdownRenderer";
import {
  ActionBtn,
  DoubleTick,
  SendingIcon,
  SingleTick,
  StreamingMessage,
} from "./MessageComponents";

import type { Message } from "../../types/message";
import type { EmojiClickData } from "emoji-picker-react";

type MessageItemProps = {
  message: Message;
  isOwn: boolean;
  currentUserId: number;
  totalMembers: number | undefined;
  onInfoClick: (message: Message) => void;
  onEdit: (message: Message, newContent: string) => void;
  onDelete: (message: Message) => void;
  onReply: (message: Message) => void;
  onScrollToMessage: (messageId: number) => void;
};

const MessageItem = ({
  message,
  isOwn,
  currentUserId,
  totalMembers,
  onInfoClick,
  onEdit,
  onDelete,
  onReply,
  onScrollToMessage,
}: MessageItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const editRef = useRef<HTMLTextAreaElement>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);

  const isStreaming = useStreamingStore((s) => s.streamingIds.has(message.id));
  const removeStreaming = useStreamingStore((s) => s.removeStreaming);

  const deliveredUserIds: number[] = message.receipt?.deliveredUserIds ?? [];
  const readUserIds: number[] = message.receipt?.readUserIds ?? [];
  const otherDelivered = deliveredUserIds.filter(
    (id) => id !== message.senderId,
  );
  const otherRead = readUserIds.filter((id) => id !== message.senderId);
  const otherMembersCount = totalMembers !== undefined ? totalMembers - 1 : 1;
  const delivered = otherDelivered.length >= otherMembersCount;
  const seen = otherRead.length >= otherMembersCount;
  const avatar = message.senderAvatarUrl || getDefaultAvatar(message.senderId);
  const bubbleTextColor = isOwn
    ? `var(--sender-chat-bubble-text-color, #ffffff)`
    : `var(--receiver-chat-bubble-text-color, #111827)`;

  useEffect(() => {
    if (isEditing) {
      editRef.current?.focus();
      const len = editText.length;
      editRef.current?.setSelectionRange(len, len);
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) setEditText(message.content);
  }, [message.content, isEditing]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(e.target as Node)
      ) {
        setShowReactionPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleEditSubmit = () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === message.content) {
      setIsEditing(false);
      return;
    }
    onEdit(message, trimmed);
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    }
    if (e.key === "Escape") {
      setEditText(message.content);
      setIsEditing(false);
    }
  };

  const handleReactionSelect = (emojiData: EmojiClickData) => {
    toggleReaction(message.id, emojiData.emoji);
    setShowReactionPicker(false);
  };

return (
  <div className={`flex gap-2.5 py-0.5 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
    <img
      src={avatar || undefined}
      alt={message.senderName}
      className="w-8 h-8 rounded-full object-cover shrink-0 self-end"
    />

    <div className={`flex flex-col max-w-[65%] ${isOwn ? "items-end" : "items-start"}`}>
      {!message.isDeleted && !isEditing && (
        <div
          className={`hidden group-hover:flex items-center gap-1 mb-1 relative
            ${isOwn ? "flex-row" : "flex-row-reverse"}`}
        >
          {isOwn && (
            <ActionBtn icon={FiInfo} label="Message info" onClick={() => onInfoClick(message)} />
          )}
          {isOwn && (
            <ActionBtn icon={FiEdit2} label="Edit message" onClick={() => setIsEditing(true)} />
          )}
          {isOwn && (
            <ActionBtn icon={FiTrash2} label="Delete message" danger onClick={() => onDelete(message)} />
          )}
          <ActionBtn icon={FiCornerUpLeft} label="Reply" onClick={() => onReply(message)} />
          <div className="relative">
            <ActionBtn
              icon={FiSmile}
              label="React"
              onClick={() => setShowReactionPicker((p) => !p)}
              active={showReactionPicker}
            />
            {showReactionPicker && (
              <div
                ref={reactionPickerRef}
                className={`absolute bottom-[calc(100%+6px)] z-50 shadow-xl rounded-2xl overflow-hidden
                  ${isOwn ? "right-0" : "left-0"}`}
              >
                <EmojiPicker
                  onEmojiClick={handleReactionSelect}
                  skinTonesDisabled
                  previewConfig={{ showPreview: false }}
                  height={340}
                  width={300}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {!isOwn && (
        <span className="text-[11px] font-medium text-gray-400 mb-1 tracking-wide">
          {message.senderName}
        </span>
      )}

      {!message.isDeleted && message.parentPreview && (
        <button
          onClick={() => onScrollToMessage(message.parentPreview!.id)}
          className={`w-full text-left mb-1 px-2.5 py-1.5 rounded-xl border-l-2 transition-colors block
            ${isOwn
              ? "bg-indigo-600/30 border-white/60 hover:bg-indigo-600/50"
              : "bg-black/5 border-gray-400 hover:bg-black/10"
            }`}
        >
          <p className={`text-[10px] font-semibold mb-0.5 truncate
            ${isOwn ? "text-white/80" : "text-gray-500"}`}>
            {message.parentPreview.senderName || "Unknown"}
          </p>
          <p className={`text-xs truncate
            ${isOwn ? "text-white/70" : "text-gray-500"}`}>
            {message.parentPreview.isDeleted ? "Message deleted" : message.parentPreview.content}
          </p>
        </button>
      )}

      {message.isDeleted ? (
        <div className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-[18px] text-sm italic border border-dashed
          ${isOwn
            ? "bg-indigo-50 text-indigo-300 border-indigo-200 rounded-br-sm"
            : "bg-gray-50 text-gray-400 border-gray-200 rounded-bl-sm"
          }`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
          Message deleted
        </div>
      ) : isEditing ? (
        <div className="flex flex-col gap-1.5 w-full">
          <textarea
            ref={editRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleEditKeyDown}
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-[18px] rounded-br-sm text-sm bg-indigo-50 border border-indigo-300 text-gray-900 outline-none resize-none focus:ring-2 focus:ring-indigo-300"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setEditText(message.content); setIsEditing(false); }}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSubmit}
              className="text-xs text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`px-3.5 py-2.5 rounded-[18px] text-sm leading-relaxed ${isOwn ? "rounded-br-sm" : "rounded-bl-sm"}`}
          style={isOwn
            ? { backgroundColor: `var(--sender-chat-bubble-bg-color, #007bff)`, color: `var(--sender-chat-bubble-text-color, #ffffff)`, borderRadius: `var(--sender-chat-bubble-radius, 12px)` }
            : { backgroundColor: `var(--receiver-chat-bubble-bg-color, #e9ecef)`, color: `var(--receiver-chat-bubble-text-color, #111827)`, borderRadius: `var(--receiver-chat-bubble-radius, 12px)` }
          }
        >
          {isStreaming ? (
            <StreamingMessage content={message.content} onDone={() => removeStreaming(message.id)} />
          ) : (
            <MarkdownRenderer content={message.content} isOwn={isOwn} style={{ color: bubbleTextColor }} />
          )}
        </div>
      )}

      {!message.isDeleted && message.reactions && message.reactions.length > 0 && (
        <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
          {message.reactions.map((r) => {
            const hasReacted = r.userIds.includes(currentUserId);
            return (
              <button
                key={r.emojiCode}
                onClick={() => toggleReaction(message.id, r.emojiCode)}
                title={hasReacted ? "Remove reaction" : "Add reaction"}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all
                  ${hasReacted
                    ? "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <span>{r.emojiCode}</span>
                <span className="font-medium">{r.count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="text-[11px] text-gray-400">{formatLocalDateTime(message.createdAt)}</span>
        {message.isEdited && !message.isDeleted && (
          <span className="text-[10px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">edited</span>
        )}
        {isOwn && !message.isDeleted && (
          <div className="flex items-center">
            {message.status === "sending" ? <SendingIcon /> : seen ? <DoubleTick blue /> : delivered ? <DoubleTick blue={false} /> : <SingleTick />}
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default React.memo(MessageItem);
