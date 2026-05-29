import { getDefaultAvatar } from "../../constants/defaults";

import type { UserCardProps } from "../../types/user";

const UserCard = ({
  user,
  isSelected,
  onClick,
}: UserCardProps) => {
  const displayName =
    user.fullName ?? user.username;

  const avatar =
    user.avatarUrl ||
    getDefaultAvatar(user.username);

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all border
        ${
          isSelected
            ? "bg-indigo-50 border-indigo-100"
            : "bg-white border-transparent hover:bg-gray-50"
        }`}
    >
      <img
        src={avatar}
        alt={displayName}
        className="w-11 h-11 rounded-full object-cover shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate
            ${
              isSelected
                ? "text-indigo-700"
                : "text-gray-900"
            }`}
        >
          {displayName}
        </p>

        {user.statusMessage ? (
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {user.statusMessage}
          </p>
        ) : (
          <p className="text-xs text-gray-400 truncate mt-0.5">
            @{user.username}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserCard;