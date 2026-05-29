import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import * as signalR from "@microsoft/signalr";
import EmojiPicker from "emoji-picker-react";
import { HiArrowLeft, HiChat, HiDotsVertical, HiPaperAirplane } from "react-icons/hi";
import { CiSettings } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Loader from "../../components/common/Loader";
import routes from "../../constants/routes/routes";
import MessageInfoModal from "../../components/message/MessageInfoModal";
import MessageItem from "../../components/message/MessageItem";
import {
  getDefaultAvatar,
  getDefaultGroupAvatar,
  TYPING_STOP_DELAY,
} from "../../constants/defaults";
import {
  chatKeys,
  useGetChatById,
  useGetMessages,
} from "../../hooks/tanstackQuery/useChatApi";
import { useGetChatPreference } from "../../hooks/tanstackQuery/useChatPreferenceApi";
import { useGetUsers } from "../../hooks/tanstackQuery/useUserApi";
import { useChatRoom } from "../../hooks/signalR/useChatRoom";
import { useCurrentUserId } from "../../hooks/useCurrentUserId";
import useFuncDebounce from "../../hooks/useDebounce";
import useQueryParams from "../../hooks/useQueryParams";
import {
  acknowledgeDelivery,
  deleteMessageViaSignalR,
  editMessageViaSignalR,
  getConnection,
  markMessagesRead,
  sendMessageViaSignalR,
  sendTypingIndicator,
} from "../../services/signalRService";
import { usePendingMessagesStore } from "../../stores/pendingMessageStore";
import { usePresenceStore } from "../../stores/presenceStore";
import { useTypingStore } from "../../stores/typingStore";
import { updateMessagesCacheTyped } from "../../utils/messageCacheUtils";
import { queryClient } from "../../utils/queryClient";
import GroupProfilePanel from "./GroupProfilePanel";
import ChatPreferenceMenu from "../../components/chat/ChatPreferenceMenu";
import { ChatType } from "../../constants/app/appConstants";

import type { Message } from "../../types/message";
import type { EmojiClickData } from "emoji-picker-react";
import { useGetAllThemes, useGetThemePropertyTypes, useGetPropertyTypeConstants } from "../../hooks/tanstackQuery/useThemeApi";

const ChatPage = () => {
  const { chatId } = useQueryParams<{ chatId: string }>();
    useChatRoom(chatId ? parseInt(chatId) : null);
  const typingUser = useTypingStore(
    (s) => s.typingByChatId[chatId ? parseInt(chatId) : 0] ?? null
  );
  const pendingCount = usePendingMessagesStore(
    (s) => s.pending.filter((m) => m.chatId === parseInt(chatId ?? "0")).length,
  );
 
const navigate = useNavigate();
  const currentUserId = useCurrentUserId();
  const currentUserName = "user";

  const [messageText, setMessageText] = useState("");
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [showPreferenceMenu, setShowPreferenceMenu] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const pickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);
  const prevScrollHeightRef = useRef<number>(0);
  const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const { data: chat, isLoading: chatLoading } = useGetChatById(
    chatId ? parseInt(chatId) : null,
  );
  const isGroup = chat?.type?.toLowerCase() === ChatType.group.toLowerCase();
  const otherMember = !isGroup
    ? chat?.members?.find((m: any) => m.userId !== currentUserId)
    : null;

  const otherMemberId = otherMember?.userId;
  const isOtherOnline = usePresenceStore(
  (s) => otherMemberId ? s.onlineUserIds.has(otherMemberId) : false
); 
  const chatName = isGroup
    ? chat.name || "Unnamed Group"
    : otherMember?.fullName || "Unknown User";

  const chatAvatar = isGroup
    ? chat.imageUrl || getDefaultGroupAvatar(chatName)
    : otherMember?.avatarUrl || getDefaultAvatar(otherMember?.fullName);
  const { data: chatPreferences, isLoading: isChatPreferencesLoading } = useGetChatPreference(chatId ? parseInt(chatId) : null);
  const { data: propertyTypes, isLoading: isPropertyTypesLoading } = useGetThemePropertyTypes();

  

  useEffect(() => {
    if (!chatPreferences?.fontName) return;

    const fontName = chatPreferences.fontName;
    const encoded = encodeURIComponent(fontName);
    const linkId = `google-font-${encoded}`;

    if (document.getElementById(linkId)) return;

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encoded}&display=swap`;
    document.head.appendChild(link);
  }, [chatPreferences?.fontName]);

  const themeStyle = useMemo<React.CSSProperties>(() => {
    if (!propertyTypes || !chatPreferences?.theme?.properties) return {};

    const props = chatPreferences.theme.properties;
    const style: Record<string, string> = {};

    propertyTypes.forEach((pt) => {
      const rawValue = props[String(pt.id)] ?? pt.defaultValue ?? '';
      const kebab = pt.key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      style[`--${kebab}`] = pt.propertyType === 'number' ? `${rawValue}px` : rawValue;
    });

    if (chatPreferences.fontName) {
      style['--font-family'] = chatPreferences.fontName;
    }

    return style as React.CSSProperties;
  }, [propertyTypes, chatPreferences]);

  const {
    data: messagesData,
    isLoading: messagesLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetMessages(chatId ? parseInt(chatId) : null);

  const { data: allUsersRaw = [] } = useGetUsers();

  const messages = useMemo(() => {
    return (messagesData?.pages ?? [])
      .slice()
      .reverse()
      .flatMap((p) => p.messages);
  }, [messagesData]);

  const allUsers = Array.isArray(allUsersRaw)
    ? allUsersRaw
    : ((allUsersRaw as any).items ?? (allUsersRaw as any).data ?? []);

  const mine = chat?.members?.find((m: any) => m.userId === currentUserId);
  const mineAvatar = mine?.avatarUrl || getDefaultAvatar(currentUserId!);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!messages.length) return;
    const container = containerRef.current;
    if (!container) return;

    if (isFirstLoad.current) {
      container.scrollTop = container.scrollHeight;
      isFirstLoad.current = false;
      return;
    }

    if (prevScrollHeightRef.current > 0) {
      const diff = container.scrollHeight - prevScrollHeightRef.current;
      container.scrollTop += diff;
      prevScrollHeightRef.current = 0;
      return;
    }

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      120;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  useEffect(() => {
    if (!messages?.length) return;

    messages.forEach((message) => {
      const alreadyDelivered =
        message.receipt?.deliveredUserIds?.includes(currentUserId);
      const isIncoming = message.senderId !== currentUserId;
      if (isIncoming && !alreadyDelivered) {
        acknowledgeDelivery(message.id);
      }
    });

    const others = messages.filter((m) => m.senderId !== currentUserId);
    if (others.length === 0) return;

    const lastReadMessageId = Math.max(...others.map((m) => m.id));
    markMessagesRead(parseInt(chatId!), lastReadMessageId);

    queryClient.setQueryData<any[]>(
      chatKeys.list(),
      (old) =>
        old?.map((c) =>
          c.id === parseInt(chatId!) ? { ...c, unreadCount: 0 } : c,
        ) ?? old,
    );
  }, [messagesData]);

  useEffect(() => {
    isFirstLoad.current = true;
    prevScrollHeightRef.current = 0;
    setShowGroupPanel(false);
  }, [chatId]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          prevScrollHeightRef.current = container.scrollHeight;
          fetchNextPage();
        }
      },
      { root: container, threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleContainerScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const distFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollDown(distFromBottom > 300);
  };

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    const native = emojiData.emoji;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText =
        messageText.slice(0, start) + native + messageText.slice(end);
      setMessageText(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + native.length,
          start + native.length
        );
      }, 0);
    } else {
      setMessageText((prev) => prev + native);
    }
  };

  const handleOpenInfo = useCallback((message: Message) => {
    setSelectedMessage(message);
    setInfoModalOpen(true);
  }, []);

  const stopTypingDebounced = useFuncDebounce(() => {
    if (!chatId) return;
    sendTypingIndicator(parseInt(chatId), currentUserName, false);
  }, TYPING_STOP_DELAY);

  const handleTyping = (value: string) => {
    setMessageText(value);
    if (!chatId || !chat) return;
    sendTypingIndicator(parseInt(chatId), currentUserName, true);
    stopTypingDebounced();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !chatId) return;

    const tempId = -Date.now();
    const optimisticMessage: Message = {
      id: tempId,
      chatId: parseInt(chatId),
      senderId: currentUserId!,
      senderName: currentUserName,
      senderAvatarUrl: mineAvatar,
      content: messageText.trim(),
      contentType: "text",
      createdAt: new Date().toISOString(),
      isDeleted: false,
      isEdited: false,
      status: "sending",
      receipt: { deliveredUserIds: [], readUserIds: [] },
      parentId: replyingTo?.id ?? null,
      parentPreview: replyingTo
        ? {
            id: replyingTo.id,
            senderId: replyingTo.senderId,
            senderName: replyingTo.senderName,
            content: replyingTo.content,
            contentType: replyingTo.contentType,
            isDeleted: replyingTo.isDeleted,
          }
        : null,
    };

    updateMessagesCacheTyped(parseInt(chatId), (msgs) => [
      ...msgs,
      optimisticMessage,
    ]);

    setMessageText("");

    const conn = getConnection();
    const isOffline =
      !conn || conn.state !== signalR.HubConnectionState.Connected;

    if (isOffline) {
      usePendingMessagesStore.getState().addPending({
        tempId,
        chatId: parseInt(chatId),
        content: optimisticMessage.content,
        contentType: "text",
        createdAt: optimisticMessage.createdAt,
      });
      toast.warn("You're offline. Message will be sent when reconnected.", {
        toastId: "offline-warning",
      });
      return;
    }

    try {
      await sendMessageViaSignalR(
        parseInt(chatId),
        optimisticMessage.content,
        "text",
        replyingTo?.id,
      );
      setReplyingTo(null);
    } catch {
      updateMessagesCacheTyped(parseInt(chatId), (msgs) =>
        msgs.filter((m) => m.id !== tempId),
      );
      usePendingMessagesStore.getState().addPending({
        tempId,
        chatId: parseInt(chatId),
        content: optimisticMessage.content,
        contentType: "text",
        createdAt: optimisticMessage.createdAt,
      });
      toast.error("Failed to send. Will retry when connected.", {
        toastId: "sending-failed",
      });
    }
  };

  const handleEdit = useCallback(
    async (message: Message, newContent: string) => {
      updateMessagesCacheTyped(parseInt(chatId!), (msgs) =>
        msgs.map((m) =>
          m.id === message.id
            ? {
              ...m,
              content: newContent,
              isEdited: true,
              editedAt: new Date().toISOString(),
            }
            : m,
        ),
      );

      try {
        await editMessageViaSignalR(message.id, newContent);
      } catch {
        updateMessagesCacheTyped(parseInt(chatId!), (msgs) =>
          msgs.map((m) => (m.id === message.id ? message : m)),
        );
        toast.error("Failed to edit message");
      }
    },
    [chatId],
  );

  const handleDelete = useCallback(
    async (message: Message) => {
      updateMessagesCacheTyped(parseInt(chatId!), (msgs) =>
        msgs.map((m) => (m.id === message.id ? { ...m, isDeleted: true } : m)),
      );

      try {
        await deleteMessageViaSignalR(message.id);
      } catch {
        updateMessagesCacheTyped(parseInt(chatId!), (msgs) =>
          msgs.map((m) => (m.id === message.id ? message : m)),
        );
        toast.error("Failed to delete message");
      }
    },
    [chatId],
  );

  const handleReply = useCallback((message: Message) => {
    setReplyingTo(message);
    textareaRef.current?.focus();
  }, []);

  const handleScrollToMessage = useCallback((messageId: number) => {
    const el = messageRefs.current.get(messageId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-yellow-50");
      setTimeout(() => el.classList.remove("bg-yellow-50"), 1500);
    }
  }, []);

  const pageStyle = useMemo<React.CSSProperties>(() => ({
    ...themeStyle,
    ...(chatPreferences?.fontName
      ? {
          fontFamily: `${chatPreferences.fontName}, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`,
        }
      : {}),
  }), [themeStyle, chatPreferences?.fontName]);

  if (chatLoading || messagesLoading) return <Loader />;
  if (chatLoading || messagesLoading || isChatPreferencesLoading || isPropertyTypesLoading) return <Loader />;

  if (!chatId || !chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiChat size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-700 font-medium text-sm">No chat selected</p>
          <p className="text-gray-400 text-xs mt-1">Choose a conversation to start messaging</p>
        </div>
      </div>
    );
  }



  return (
    <div className="flex h-screen overflow-hidden" style={pageStyle}>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0" style={{ backgroundColor: `var(--header-color, #ffffff)`, color: `var(--header-text-color, #111827)` }}>
          <button
            onClick={() => navigate(routes.chats)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <HiArrowLeft size={20} />
          </button>

          <img
            src={chatAvatar}
            alt={chatName}
            className="w-10 h-10 rounded-full object-cover"
          />

          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-semibold text-gray-900 truncate">
              {chatPreferences?.nickname??chatName}
            </h2>
            {isGroup ? (
              <p className="text-xs text-gray-400 mt-0.5">
                {chat.members?.filter((m: any) => m.leftAt === null).length} members
              </p>
            ) : (
              <p
                className={`text-xs font-medium mt-0.5 ${isOtherOnline ? "text-green-500" : "text-gray-400"
                  }`}
              >
                {isOtherOnline ? "Online" : "Offline"}
              </p>
            )}
          </div>

          <button
            onClick={() => setShowPreferenceMenu((v) => !v)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${showPreferenceMenu
                ? "bg-black text-white"
                : "bg-gray-900 text-white hover:bg-black"
              }`}
          >
            <CiSettings size={20} />
          </button>

          {isGroup && (
            <button
              onClick={() => setShowGroupPanel((v) => !v)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${showGroupPanel
                ? "bg-indigo-50 text-indigo-500"
                : "text-gray-400 hover:bg-gray-100"
                }`}
            >
              <HiDotsVertical size={20} />
            </button>
          )}
        </div>

        <div
          ref={containerRef}
          onScroll={handleContainerScroll}
          className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1 bg-gray-50"
          style={{ backgroundColor: `var(--chat-background-color, #f9fafb)`, color: `var(--chat-background-text-color, #111827)` }}
        >
          <div ref={sentinelRef} className="h-1" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {!hasNextPage && messages.length > 0 && (
            <p className="text-center text-xs text-gray-400 py-2">
              Start of conversation
            </p>
          )}

          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                ref={(el) => {
                  if (el) messageRefs.current.set(message.id, el);
                  else messageRefs.current.delete(message.id);
                }}
              >
                <MessageItem
                  message={message}
                  currentUserId={currentUserId!}
                  isOwn={message.senderId === currentUserId}
                  totalMembers={
                    isGroup
                      ? (chat.members?.filter((m: any) => m.leftAt === null)
                          .length ?? 1)
                      : undefined
                  }
                  onInfoClick={handleOpenInfo}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReply={handleReply}
                  onScrollToMessage={handleScrollToMessage}
                />
              </div>
            ))
          )}

          <div ref={messagesEndRef} />
        </div>
        {showScrollDown && (
          <button
            onClick={() =>
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="absolute bottom-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-md text-gray-500 hover:bg-gray-50 transition-all z-10"
            aria-label="Scroll to bottom"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
        {typingUser && (
          <div className="flex items-center gap-2 px-5 py-2 bg-white border-t border-gray-100 text-xs text-gray-400 italic">
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
            {isGroup ? `${typingUser ?? "Someone"} is typing` : "typing..."}
          </div>
        )}

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 border-t border-amber-100 text-xs text-amber-600">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
            </svg>
            {pendingCount} message{pendingCount > 1 ? "s" : ""} pending — will
            send when reconnected
          </div>
        )}
        {replyingTo && (
          <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 border-t border-indigo-100">
            <div className="flex-1 min-w-0 border-l-2 border-indigo-400 pl-2">
              <p className="text-[11px] font-semibold text-indigo-600 truncate">
                {replyingTo.senderId === currentUserId
                  ? "You"
                  : replyingTo.senderName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {replyingTo.content}
              </p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-indigo-100 transition-colors flex-shrink-0"
            >
              <svg
                width="12"
                height="12"
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
        )}
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-100 shrink-0"
        >
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          <div className="flex-1 relative flex items-center">
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type a message..."
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (messageText.trim()) {
                    handleSendMessage(e as any);
                  }
                }
              }}
              className="w-full max-h-32 min-h-[40px] pl-4 pr-10 py-2 text-sm placeholder-gray-400 border-none outline-none resize-none transition-colors overflow-y-auto"
              style={{ backgroundColor: `var(--message-input-bg-color, #ffffff)`, color: `var(--message-input-text-color, #111827)`, borderRadius: `var(--message-input-radius, 6px)` }}
            />

            <button
              type="button"
              onClick={() => setShowEmojiPicker((p) => !p)}
              className="absolute right-2 text-gray-400 hover:text-yellow-500 transition-colors"
              aria-label="Emoji picker"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </button>

            {showEmojiPicker && (
              <div
                ref={pickerRef}
                className="absolute bottom-[calc(100%+6px)] right-0 z-50 shadow-xl rounded-2xl overflow-hidden"
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiSelect}
                  skinTonesDisabled
                  previewConfig={{ showPreview: false }}
                  height={380}
                  width={320}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!messageText.trim()}
            className="w-10 h-10 flex items-center justify-center active:scale-95 transition-all disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
            style={{
              backgroundColor: messageText.trim() ? `var(--send-button-bg-color, #4f46e5)` : '#d1d5db',
              color: messageText.trim() ? `var(--send-button-arrow-color, #ffffff)` : '#9ca3af',
              borderRadius: `var(--send-button-radius, 6px)`,
            }}
          >
            <HiPaperAirplane size={18} />
          </button>
        </form>
      </div>

      {showPreferenceMenu && chatId && (
        <ChatPreferenceMenu
          chatId={parseInt(chatId)}
          isOpen={showPreferenceMenu}
          onClose={() => setShowPreferenceMenu(false)}
        />
      )}

      {isGroup && showGroupPanel && (
        <GroupProfilePanel
          chat={chat}
          currentUserId={currentUserId}
          onClose={() => setShowGroupPanel(false)}
          allUsers={allUsers}
        />
      )}

      {infoModalOpen && selectedMessage && (
        <MessageInfoModal
          message={selectedMessage}
          members={chat?.members
            .map((m: any) => ({
              userId: m.userId,
              fullName: m.fullName,
              avatarUrl: m.avatarUrl,
            }))}
          currentUserId={currentUserId!}
          onClose={() => {
            setInfoModalOpen(false);
            setSelectedMessage(null);
          }}
        />
      )}
    </div>
  );
};

export default ChatPage;