import {
  HiUser,
  HiLocationMarker,
  HiChat,
  HiCursorClick,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { getDefaultAvatar } from "../../constants/defaults";
import routes from "../../constants/routes/routes";
import { useGetOrCreateDirectChat } from "../../hooks/tanstackQuery/useChatApi";
import { joinChat, notifyNewChat } from "../../services/signalRService";
import type { User } from "../../types/user";

const EmptyState = () => (
  <div className="flex-1 h-full flex flex-col items-center justify-center text-center px-8 bg-white">
    <HiCursorClick size={32} className="text-gray-400 mb-3" />

    <p className="text-black text-base font-medium">No profile selected</p>

    <p className="text-gray-500 text-sm mt-1">Select a user to view details</p>
  </div>
);

interface RowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const Row = ({ icon, label, value }: RowProps) => (
  <div className="flex items-start gap-3 py-4 border-b border-gray-200 last:border-0">
    <span className="text-gray-500 mt-1">{icon}</span>

    <div className="flex-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>

      <p className="text-sm text-black mt-1 break-words">{value}</p>
    </div>
  </div>
);

interface UserDetailsProps {
  user: User | null;
}

const UserDetails = ({ user }: UserDetailsProps) => {
  const navigate = useNavigate();
  const createChatMutation = useGetOrCreateDirectChat();
  if (!user) return <EmptyState />;
  const { avatarUrl, username, fullName, bio, statusMessage } = user;
  const avatar = avatarUrl || getDefaultAvatar(username);

  const handleSendMessage = async () => {
    try {
      const chat = await createChatMutation.mutateAsync(user.id);

      await joinChat(chat.id);
      await notifyNewChat(chat.id, user.id);

      navigate(`${routes.chats}?chatId=${chat.id}`);
    } catch (err) {
      toast.error("Failed to create chat");
    }
  };
  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto bg-gray-50">
      <div className="min-h-full flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-28 bg-linear-to-r from-gray-100 via-gray-200 to-gray-100" />
          <div className="flex flex-col items-center px-8 -mt-14 pb-6">
            <img
              src={avatar}
              alt={username}
              className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg bg-white"
            />

            <h2 className="mt-4 text-2xl font-bold text-black text-center">
              {fullName || username}
            </h2>

            <p className="text-gray-500 text-sm mt-1">@{username}</p>

            {bio && (
              <p className="mt-4 text-sm text-gray-700 text-center leading-relaxed">
                {bio}
              </p>
            )}

            <div className="flex gap-3 w-full mt-6">
              <button
                onClick={handleSendMessage}
                disabled={createChatMutation.isPending}
                className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 transition disabled:opacity-50"
              >
                {createChatMutation.isPending ? "Opening..." : "Send Message"}
              </button>

              <button className="flex-1 py-3 rounded-xl border border-gray-300 bg-white text-black text-sm font-medium hover:bg-gray-100 transition">
                Add Contact
              </button>
            </div>
          </div>

          <div className="px-8 pb-5 border-t border-gray-200">
            <Row
              icon={<HiUser size={18} />}
              label="Full Name"
              value={fullName || "Not provided"}
            />

            {statusMessage && (
              <Row
                icon={<HiLocationMarker size={18} />}
                label="Status"
                value={statusMessage}
              />
            )}

            <Row
              icon={<HiChat size={18} />}
              label="Bio"
              value={bio || "No bio yet"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
