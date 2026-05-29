import { toast } from "react-toastify";

import { getDefaultAvatar } from "../../constants/defaults";

import type { Message } from "../../types/message";

type ChatToastProps = {
  message: Message;
  avatarUrl?: string;
  onClick: () => void;
}

export const showNewMessageToast = ({
  message,
  avatarUrl,
  onClick,
}: ChatToastProps) => {
  toast.info(
    <div className="flex items-center gap-3 cursor-pointer">
      <img
        src={
          avatarUrl ||
          getDefaultAvatar(message.senderName)
        }
        alt={message.senderName}
        className="w-9 h-9 rounded-full object-cover shrink-0"
      />

      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-gray-900 truncate">
          {message.senderName || "New Message"}
        </span>

        <span className="text-xs text-gray-500 truncate">
          {message.content}
        </span>
      </div>
    </div>,
    {
      position: "top-right",
      autoClose: 4000,
      closeOnClick: true,
      onClick,
    }
  );
};