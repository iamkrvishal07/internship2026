import { useState } from "react";

import {
  HiCheck,
  HiDotsVertical,
  HiLogout,
  HiPencil,
  HiShieldCheck,
  HiTrash,
  HiUserAdd,
  HiX,
} from "react-icons/hi";

import {
  useAddGroupMembers,
  useRemoveGroupMember,
  useUpdateGroupChat,
  useUpdateMemberRole,
} from "../../hooks/tanstackQuery/useGroupChat";
import { usePresenceStore } from "../../stores/presenceStore";
import { colorFor, initials } from "../../constants/avatarColors";

import type { Chat, Member } from "../../types/chat";
import { MemberRoleType } from "../../constants/app/appConstants";

function Avatar({
  user,
  size = "md",
}: {
  user: { userId?: number; id?: number; fullName: string; avatarUrl?: string };
  size?: "sm" | "md" | "lg";
}) {
  const id = user.userId ?? user.id ?? 0;
  const dim =
    size === "lg"
      ? "w-16 h-16 text-lg"
      : size === "sm"
        ? "w-7 h-7 text-[10px]"
        : "w-9 h-9 text-xs";

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.fullName}
        className={`${dim} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <span
      className={`${dim} rounded-full flex items-center justify-center font-semibold shrink-0 ${colorFor(id)}`}
    >
      {initials(user.fullName)}
    </span>
  );
}

interface GroupProfilePanelProps {
  chat: Chat;
  currentUserId: number | null;
  onClose: () => void;
  allUsers?: { id: number; fullName: string; avatarUrl?: string }[];
}

export default function GroupProfilePanel({
  chat,
  currentUserId,
  onClose,
  allUsers = [],
}: GroupProfilePanelProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState<number[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(chat.name);

  const { mutate: removeMember, isPending: removing } = useRemoveGroupMember();
  const { mutate: updateRole } = useUpdateMemberRole();
  const { mutate: addMembers, isPending: adding } = useAddGroupMembers();
  const { mutate: updateGroup, isPending: updatingName } = useUpdateGroupChat();
  const isOnline = usePresenceStore((s) => s.isOnline);

  const isAdmin =
    chat.members.find((m) => m.userId === currentUserId)?.role === "admin";
  const activeMembers = chat.members.filter((m) => m.leftAt === null);
  const existingIds = new Set(activeMembers.map((m) => m.userId));

  const candidatesForAdd = allUsers.filter((u) => {
    const fullName = (u.fullName || "").toLowerCase();
    return (
      u.id !== currentUserId &&
      !existingIds.has(u.id) &&
      fullName.includes(addSearch.toLowerCase())
    );
  });

  const handleRemove = (targetUserId: number) => {
    removeMember({ chatId: chat.id, targetUserId });
    setOpenMenuId(null);
  };

  const handleToggleRole = (member: Member) => {
    const newRole: (typeof MemberRoleType)[keyof typeof MemberRoleType] =
      member.role === MemberRoleType.admin
        ? MemberRoleType.member
        : MemberRoleType.admin;

    updateRole({
      chatId: chat.id,
      targetUserId: member.userId,
      role: newRole,
    });

    setOpenMenuId(null);
  };

  const handleAddMembers = () => {
    if (selectedToAdd.length === 0) return;
    addMembers(
      { chatId: chat.id, userIds: selectedToAdd },
      {
        onSuccess: () => {
          setSelectedToAdd([]);
          setShowAddMembers(false);
          setAddSearch("");
        },
      },
    );
  };

  const handleSaveName = () => {
    if (!nameValue.trim() || nameValue === chat.name) {
      setEditingName(false);
      return;
    }
    updateGroup(
      { chatId: chat.id, name: nameValue.trim() },
      { onSuccess: () => setEditingName(false) },
    );
  };

  const handleLeave = () => {
    if (!currentUserId) return;
    removeMember({ chatId: chat.id, targetUserId: currentUserId });
    onClose();
  };

  return (
    <div className="w-80 h-full bg-white border-l border-gray-100 flex flex-col shrink-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <span className="text-[15px] font-semibold text-gray-900">
          Group Info
        </span>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <HiX size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-3 px-4 py-6 border-b border-gray-100">
          {chat.imageUrl ? (
            <img
              src={chat.imageUrl}
              alt={chat.name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${colorFor(chat.id)}`}
            >
              {initials(chat.name || "G")}
            </div>
          )}

          {editingName ? (
            <div className="flex items-center gap-2 w-full px-2">
              <input
                autoFocus
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                className="flex-1 text-center text-[15px] font-semibold border-b-2 border-indigo-400 outline-none bg-transparent pb-0.5"
              />
              <button
                onClick={handleSaveName}
                disabled={updatingName}
                className="text-indigo-500 hover:text-indigo-700"
              >
                <HiCheck size={16} />
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setNameValue(chat.name);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <h2 className="text-[16px] font-semibold text-gray-900">
                {chat.name || "Unnamed Group"}
              </h2>
              {isAdmin && (
                <button
                  onClick={() => setEditingName(true)}
                  className="text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  <HiPencil size={13} />
                </button>
              )}
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            {activeMembers.length} member{activeMembers.length !== 1 ? "s" : ""}
          </p>

          {chat.description && (
            <p className="text-sm text-gray-500 text-center px-2">
              {chat.description}
            </p>
          )}
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Members
            </span>
            {isAdmin && (
              <button
                onClick={() => setShowAddMembers(!showAddMembers)}
                className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
              >
                <HiUserAdd size={13} />
                Add
              </button>
            )}
          </div>

          {showAddMembers && isAdmin && (
            <div className="mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
              <input
                autoFocus
                type="text"
                placeholder="Search users..."
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                className="w-full h-8 px-3 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-indigo-400 mb-2"
              />
              <div className="max-h-36 overflow-y-auto space-y-1">
                {candidatesForAdd.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">
                    No users to add
                  </p>
                ) : (
                  candidatesForAdd.map((u) => {
                    const sel = selectedToAdd.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        onClick={() =>
                          setSelectedToAdd((prev) =>
                            sel
                              ? prev.filter((id) => id !== u.id)
                              : [...prev, u.id],
                          )
                        }
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${sel ? "bg-indigo-50" : "hover:bg-gray-100"}`}
                      >
                        <Avatar
                          user={{
                            id: u.id,
                            fullName: u.fullName,
                            avatarUrl: u.avatarUrl,
                          }}
                          size="sm"
                        />
                        <span className="text-xs text-gray-800 flex-1 truncate">
                          {u.fullName}
                        </span>
                        {sel && (
                          <HiCheck size={12} className="text-indigo-500 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
              {selectedToAdd.length > 0 && (
                <button
                  onClick={handleAddMembers}
                  disabled={adding}
                  className="mt-2 w-full h-8 bg-indigo-500 text-white text-xs font-medium rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
                >
                  {adding
                    ? "Adding..."
                    : `Add ${selectedToAdd.length} member${selectedToAdd.length > 1 ? "s" : ""}`}
                </button>
              )}
            </div>
          )}

          <div className="space-y-0.5">
            {activeMembers.map((member) => {
              const isMe = member.userId === currentUserId;
              const menuOpen = openMenuId === member.userId;

              return (
                <div
                  key={member.userId}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors group relative"
                >
                  <div className="relative shrink-0">
                    <Avatar user={member} />
                    {isOnline(member.userId) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.fullName}
                      {isMe && (
                        <span className="text-gray-400 font-normal"> (you)</span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                      <span>{member.role}</span>
                      <span>·</span>
                      <span className={isOnline(member.userId) ? "text-green-500" : "text-gray-400"}>
                        {isOnline(member.userId) ? "Online" : "Offline"}
                      </span>
                    </p>
                  </div>

                  {member.role === "Admin" && (
                    <span className="shrink-0">
                      <HiShieldCheck size={14} className="text-indigo-400" />
                    </span>
                  )}

                  {isAdmin && !isMe && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(menuOpen ? null : member.userId)}
                        className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <HiDotsVertical size={13} />
                      </button>

                      {menuOpen && (
                        <div className="absolute right-0 top-7 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-44">
                          <button
                            onClick={() => handleToggleRole(member)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <HiShieldCheck size={13} className="text-indigo-400" />
                            {member.role === "Admin" ? "Remove admin" : "Make admin"}
                          </button>
                          <div className="border-t border-gray-100 my-1" />
                          <button
                            onClick={() => handleRemove(member.userId)}
                            disabled={removing}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <HiTrash size={13} />
                            Remove from group
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-t border-gray-100">
        <button
          onClick={handleLeave}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <HiLogout size={15} />
          Leave group
        </button>
      </div>
    </div>
  );
}