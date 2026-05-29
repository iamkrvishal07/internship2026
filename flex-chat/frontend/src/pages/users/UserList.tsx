import { useEffect, useRef } from "react";

import { HiSearch } from "react-icons/hi";
import { MdOutlineClear } from "react-icons/md";

import UserCard from "../../components/users/UserCard";

import type { User } from "../../types/user";

interface UserListProps {
  list: User[];
  searchKey: string;
  selectedUserId: number | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  handleSearchKeyChange: (value: string) => void;
  handleUserSelect: (userId: number) => void;
}

const UserList = ({
  list = [],
  searchKey = "",
  selectedUserId,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  handleSearchKeyChange,
  handleUserSelect,
}: UserListProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (
          first.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          onLoadMore();
        }
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
  ]);

  return (
    <div className="w-[360px] h-full shrink-0 flex flex-col border-r border-gray-200 bg-white">
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Users
          </h1>

          <p className="text-xs text-gray-400 mt-0.5">
            {list.length} users loaded
          </p>
        </div>

        <div className="relative mt-4">
          <HiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={15}
          />

          <input
            type="text"
            placeholder="Search users..."
            value={searchKey}
            onChange={(e) =>
              handleSearchKeyChange(
                e.target.value,
              )
            }
            className="w-full pl-10 pr-10 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
          />

          {searchKey && (
            <button
              onClick={() =>
                handleSearchKeyChange("")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <MdOutlineClear size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-gray-500">
              {searchKey
                ? `No results for "${searchKey}"`
                : "No users found"}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {list.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                isSelected={
                  u.id === selectedUserId
                }
                onClick={() =>
                  handleUserSelect(u.id)
                }
              />
            ))}

            <div
              ref={sentinelRef}
              className="h-1"
            />

            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {!hasNextPage &&
              list.length > 0 && (
                <p className="text-center text-xs text-gray-400 py-3">
                  All users loaded
                </p>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;