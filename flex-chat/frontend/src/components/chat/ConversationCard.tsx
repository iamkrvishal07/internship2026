import { getDefaultAvatar } from "../../constants/defaults";

import type { UserCardProps } from "../../types/user";

const UserCard = ({ user, onClick }: UserCardProps) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800 rounded-md"
    >
      <div className="relative">
        <img
          src={
            user.avatarUrl ||
            getDefaultAvatar(user.username)
          }
          alt={user.username}
          className="w-10 h-10 rounded-full"
        />
        {user.statusMessage === "online" && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-white text-sm">{user.username}</span>
        <span className="text-gray-400 text-xs">
          {user.lastMessage || "Say hello"}
        </span>
      </div>
      <div className="ml-auto text-gray-400 text-xs">
        <button>this</button>
        </div>
    </div>
  );
};

export default UserCard;