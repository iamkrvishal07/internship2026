import { useState } from "react";

import { HiSearch } from "react-icons/hi";

import { getDefaultAvatar } from "../../constants/defaults";
import UserCard from "../chat/ConversationCard";

const Sidebar = ({ onSelectUser }: { onSelectUser?: (user: any) => void }) => {
  const [search, setSearch] = useState("");

  const me = { name: "Guest", avatar: null as string | null };

  const users: any[] = [];

  const filtered = users.filter((u: any) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-85 h-full flex flex-col bg-[#151528] border-r border-[#2a2a40]">

      <div className="p-5 border-b border-[#2a2a40] bg-[#1f1f35]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={
                me.avatar ||
                getDefaultAvatar(me.name)
              }
              alt={me.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#151528]" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-white font-semibold text-sm">{me.name}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-[#2a2a40]">
        <div className="flex items-center gap-2 bg-[#1f1f35] rounded-lg px-3 py-2">
          <HiSearch className="text-gray-400 shrink-0" size={16} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-1 px-3">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-8">
            No users found
          </p>
        ) : (
          filtered.map((u: any) => (
            <UserCard
              key={u._id}
              user={u}
              onClick={() => onSelectUser?.(u)}
            />
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;