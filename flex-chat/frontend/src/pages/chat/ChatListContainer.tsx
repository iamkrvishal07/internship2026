import { useMemo,useState } from "react";

import { HiDotsVertical } from "react-icons/hi";

import Loader from "../../components/common/Loader";
import { SEARCH_DEBOUNCE_DELAY } from "../../constants/defaults";
import routes from "../../constants/routes/routes";
import { useTypingListener } from "../../hooks/signalR/useTypingListener";
import { useGetMyChats } from "../../hooks/tanstackQuery/useChatApi";
import { useCurrentUserId } from "../../hooks/useCurrentUserId";
import useFuncDebounce from "../../hooks/useDebounce";
import useQueryParams from "../../hooks/useQueryParams";
import { useUpdateUrl } from "../../hooks/useUpdateUrl";
import ChatList from "./ChatList";
import ChatPage from "./ChatPage";

import type { QueryValue } from "../../types/common";

interface ChatQuery extends Record<string, QueryValue> {
  searchTerm?: string;
  chatId?: number;
}

const ChatsListContainer = () => {
  const updateUrl = useUpdateUrl();
  useTypingListener();
  const currentUserId = useCurrentUserId();
  const { searchTerm = "", chatId = null } = useQueryParams<ChatQuery>();
  const [searchKey, setSearchKey] = useState(searchTerm);
  const { data: conversations = [], isLoading: chatsLoading } = useGetMyChats();

  const debouncedUpdate = useFuncDebounce((value: string) => {
    updateUrl(routes.chats, { searchTerm: value });
  }, SEARCH_DEBOUNCE_DELAY);

  const filteredChats = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    return conversations.filter((chat) => {
      const otherMember = chat.members?.find((m) => m.userId !== currentUserId);
      const name = otherMember?.fullName || chat.name || "";
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [conversations, searchTerm, currentUserId]);

  const handleSearchKeyChange = (value: string) => {
    setSearchKey(value);
    debouncedUpdate(value);
  };

  const handleChatSelect = (currentChatId: number) => {
    updateUrl(routes.chats, { chatId: currentChatId });
  };

  if (chatsLoading) return <Loader />;
  
return (
  <div className="h-full flex overflow-hidden bg-white">
    {/* Chat List */}
    <div
      className={`
        ${
          chatId
            ? "hidden md:flex"
            : "flex"
        }
        h-full
      `}
    >
      <ChatList
        conversations={filteredChats}
        handleChatSelect={handleChatSelect}
        currentUserId={currentUserId}
        chatId={chatId}
        searchKey={searchKey}
        handleSearchKeyChange={
          handleSearchKeyChange
        }
      />
    </div>

    {/* Chat Page */}
    <div
      className={`
        flex-1 flex flex-col min-w-0 h-full
        ${
          chatId
            ? "flex"
            : "hidden md:flex"
        }
      `}
    >
      {chatId ? (
        <ChatPage />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <HiDotsVertical
                size={24}
                className="text-gray-300"
              />
            </div>

            <p className="text-gray-400 text-sm">
              Select a chat to start
              messaging
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
);

};

export default ChatsListContainer;