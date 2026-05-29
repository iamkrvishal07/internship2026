import { useEffect, useRef, useState } from "react";

import {
  HiCheck,
  HiPhotograph,
  HiSearch,
  HiUserGroup,
  HiX,
} from "react-icons/hi";

import { SEARCH_DEBOUNCE_DELAY } from "../../constants/defaults";
import { colorFor, initials } from "../../constants/avatarColors";
import { useCreateGroupChat } from "../../hooks/tanstackQuery/useGroupChat";
import { useFetchUsers } from "../../hooks/tanstackQuery/useUserApi";
import useFuncDebounce from "../../hooks/useDebounce";

import type { User } from "../../types/user";

function Avatar({
  user,
  size = "md",
}: {
  user: {
    id: number;
    fullName?: string;
    username: string;
    avatarUrl?: string | null;
  };
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg"
      ? "w-20 h-20 text-2xl"
      : size === "sm"
        ? "w-7 h-7 text-[10px]"
        : "w-9 h-9 text-xs";

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.fullName || user.username}
        className={`${dim} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <span
      className={`${dim} rounded-full flex items-center justify-center font-semibold shrink-0 ${colorFor(user.id)}`}
    >
      {initials(user.fullName || user.username)}
    </span>
  );
}

interface Props {
  onClose: () => void;
  currentUserId: number | null;
}

export default function CreateGroupModal({ onClose, currentUserId }: Props) {
  const [step, setStep] = useState<"select" | "details">("select");

  const [search, setSearch] = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");

  const [selected, setSelected] = useState<User[]>([]);

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");

  const [nameError, setNameError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useFetchUsers(debounceSearch);

  const { mutate: createGroup, isPending } = useCreateGroupChat();

  const users: User[] = (data?.pages ?? [])
    .flatMap((p) => p.items ?? [])
    .map((u: any) => ({
      id: u.id ?? u.userId,
      fullName: u.fullName ?? u.name ?? u.username ?? "Unknown",
      avatarUrl: u.avatarUrl ?? u.avatar ?? "",
      username: u.username ?? "",
    }))
    .filter((u) => u.id !== currentUserId);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = listRef.current;

    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: container,
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleDebounceSearchTermChange = useFuncDebounce(
    (searchValue: string) => {
      setDebounceSearch(searchValue);
    },
    SEARCH_DEBOUNCE_DELAY,
  );

  const toggle = (user: User) => {
    setSelected((prev) =>
      prev.find((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user],
    );
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      setNameError("Group name is required.");
      return;
    }

    setNameError("");

    createGroup(
      {
        name: groupName.trim(),
        description: description.trim(),
        memberIds: selected.map((u) => u.id),
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            {step === "details" && (
              <button
                onClick={() => setStep("select")}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors mr-1"
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            <HiUserGroup className="text-gray-700" size={18} />

            <h2 className="text-[15px] font-semibold text-gray-900">
              {step === "select" ? "Add Members" : "Group Details"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <HiX size={16} />
          </button>
        </div>

        <div className="flex gap-1 px-5 pt-3 flex-shrink-0">
          {["select", "details"].map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                (step === "select" && i === 0) || step === "details"
                  ? "bg-black"
                  : "bg-gray-100"
              }`}
            />
          ))}
        </div>

        {step === "select" && (
          <>
            {selected.length > 0 && (
              <div className="flex gap-2 overflow-x-auto px-5 py-3 border-b border-gray-50 scrollbar-thin flex-shrink-0">
                {selected.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => toggle(u)}
                    className="shrink-0 flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-full pl-1 pr-2.5 py-1 group transition-colors hover:bg-gray-200"
                  >
                    <Avatar user={u} size="sm" />

                    <span className="text-xs font-medium text-indigo-700 max-w-[80px] truncate">
                      {u.fullName.split(" ")[0]}
                    </span>

                    <HiX
                      size={10}
                      className="text-gray-400 group-hover:text-gray-600 ml-0.5 shrink-0"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="px-4 py-3 flex-shrink-0">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                <HiSearch className="text-gray-400 shrink-0" size={15} />

                <input
                  autoFocus
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);

                    handleDebounceSearchTermChange(e.target.value);
                  }}
                  className="bg-transparent text-sm text-gray-800 placeholder-gray-400 flex-1 outline-none"
                />

                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setDebounceSearch("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <HiX size={13} />
                  </button>
                )}
              </div>
            </div>

            <div
              ref={listRef}
              className="flex-1 overflow-y-auto px-2 pb-2"
              style={{ maxHeight: 340 }}
            >
              {isLoading && users.length === 0 ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">
                  {search
                    ? `No users matching "${search}"`
                    : "No users available"}
                </p>
              ) : (
                <>
                  {users.map((user) => {
                    const isSelected = !!selected.find((u) => u.id === user.id);

                    return (
                      <button
                        key={user.id}
                        onClick={() => toggle(user)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                          isSelected ? "bg-indigo-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <Avatar user={user} />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.fullName}
                          </p>

                          {user.username && (
                            <p className="text-xs text-gray-400 truncate">
                              @{user.username}
                            </p>
                          )}
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "bg-indigo-500 border-indigo-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <HiCheck size={11} className="text-white" />
                          )}
                        </div>
                      </button>
                    );
                  })}

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

                  {!hasNextPage && users.length > 0 && (
                    <p className="text-center text-xs text-gray-400 py-2">
                      All users loaded
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
              <span className="text-xs text-gray-400">
                {selected.length === 0
                  ? "Select at least 1 member"
                  : `${selected.length} member${
                      selected.length > 1 ? "s" : ""
                    } selected`}
              </span>

              <button
                onClick={() => setStep("details")}
                disabled={selected.length === 0}
                className="px-5 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </>
        )}

        {step === "details" && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <div className="flex flex-col items-center gap-2 pt-1">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="relative w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-500 overflow-hidden transition-colors group"
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      className="w-full h-full object-cover"
                      alt="group avatar"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-1 text-gray-400 group-hover:text-gray-600 transition-colors">
                      <HiPhotograph size={22} />

                      <span className="text-[10px] font-medium">Photo</span>
                    </div>
                  )}
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFile}
                />

                <p className="text-xs text-gray-400">Optional group photo</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Group Name <span className="text-red-400">*</span>
                </label>

                <input
                  autoFocus
                  type="text"
                  value={groupName}
                  onChange={(e) => {
                    setGroupName(e.target.value);

                    if (nameError) {
                      setNameError("");
                    }
                  }}
                  placeholder="e.g. Project Alpha, Family..."
                  maxLength={80}
                  className={`w-full h-10 px-3.5 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white transition-colors ${
                    nameError
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-gray-400"
                  }`}
                />

                {nameError && (
                  <p className="mt-1 text-xs text-red-500">{nameError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Description{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this group about?"
                  maxLength={200}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-gray-400 transition-colors resize-none"
                />

                <p className="text-right text-[10px] text-gray-400 mt-0.5">
                  {description.length}/200
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Members ({selected.length})
                </p>

                <div className="flex flex-wrap gap-2">
                  {selected.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-1.5 bg-gray-100 rounded-full pl-1 pr-2.5 py-1"
                    >
                      <Avatar user={u} size="sm" />

                      <span className="text-xs text-gray-700 max-w-[90px] truncate">
                        {u.fullName.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setStep("select")}
                className="flex-1 h-10 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Back
              </button>

              <button
                onClick={handleCreate}
                disabled={isPending}
                className="flex-1 h-10 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                      />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <HiUserGroup size={15} />
                    Make Group
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
