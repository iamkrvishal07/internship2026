import { useState } from "react";
import { HiUserAdd } from "react-icons/hi";
import { MdOutlineClear } from "react-icons/md";
import ChatListItem from "./ChatListItem";
import CreateGroupModal from "./CreateGroupModal";
import type { Conversation } from "../../types/chat";

type ChatListProps = {
  conversations: Conversation[];
  handleChatSelect: (chatId: number) => void;
  currentUserId: number | null;
  chatId: number | null;
  searchKey: string;
  handleSearchKeyChange: (value: string) => void;
};

function ChatList({
  conversations,
  handleChatSelect,
  currentUserId,
  chatId,
  searchKey,
  handleSearchKeyChange,
}: ChatListProps) {

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
     <div className="w-[420px] h-full bg-white overflow-hidden shadow-lg border-r border-gray-200 flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 shrink-0">
          <span className="text-xl font-bold text-gray-900">Chats</span>
          <button
            onClick={() => setModalOpen(true)}
            title="New group"
            className="p-1.5 rounded-lg text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <HiUserAdd size={19} />
          </button>
        </div>

        <div className="px-3 py-2.5 shrink-0">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <svg
              width="15"
              height="15"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchKey}
              onChange={(e) => handleSearchKeyChange(e.target.value)}
              className="bg-transparent text-sm text-gray-800 placeholder-gray-400 flex-1 outline-none"
            />
            {searchKey && (
              <button
                onClick={() => handleSearchKeyChange("")}
                className="text-gray-400 text-xs cursor-pointer"
              >
                <MdOutlineClear />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">
              No chats found
            </p>
          ) : (
            conversations.map((conv) => (
              <ChatListItem
                key={conv.id}
                conversation={conv}
                isActive={Number(chatId) === Number(conv.id)}
                onClick={() => handleChatSelect(conv.id)}
              />
            ))
          )}
        </div>
      </div>

      {modalOpen && (
        <CreateGroupModal
          onClose={() => setModalOpen(false)}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}

export default ChatList;
