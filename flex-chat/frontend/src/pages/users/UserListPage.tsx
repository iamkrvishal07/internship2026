import { useState } from "react";
import Loader from "../../components/common/Loader";
import { SEARCH_DEBOUNCE_DELAY } from "../../constants/defaults";
import routes from "../../constants/routes/routes";
import { useFetchUsers } from "../../hooks/tanstackQuery/useUserApi";
import useFuncDebounce from "../../hooks/useDebounce";
import useQueryParams from "../../hooks/useQueryParams";
import { useUpdateUrl } from "../../hooks/useUpdateUrl";
import UserDetails from "./UserDetails";
import UserList from "./UserList";
import type { QueryValue } from "../../types/common";
import type { User } from "../../types/user";

interface UserQuery extends Record<string, QueryValue> {
  searchTerm?: string;
  userId?: number;
}

const UserListPage = () => {
  const updateUrl = useUpdateUrl();
  const { searchTerm = "", userId = null } = useQueryParams<UserQuery>();

  const [searchKey, setSearchKey] = useState(searchTerm);
  const currentUserId = userId ? Number(userId) : null;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useFetchUsers(searchTerm);

  const users: User[] = data?.pages.flatMap((p) => p.items) ?? [];
  const selectedUser = users.find((u) => u.id === currentUserId) ?? null;

  const debouncedUpdate = useFuncDebounce((value: string) => {
    updateUrl(routes.users, { searchTerm: value });
  }, SEARCH_DEBOUNCE_DELAY);

  const handleSearchKeyChange = (value: string) => {
    setSearchKey(value);
    debouncedUpdate(value);
  };

  const handleUserSelect = (id: number) => {
    updateUrl(routes.users, { searchTerm, userId: id });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="h-full flex overflow-hidden bg-[#0f0f1a]">
      <UserList
        list={users}
        searchKey={searchKey}
        selectedUserId={currentUserId}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
        handleSearchKeyChange={handleSearchKeyChange}
        handleUserSelect={handleUserSelect}
      />
      <div className="flex-1 flex flex-col min-w-0 bg-[#0f0f1a]">
        <UserDetails user={selectedUser} />
      </div>
    </div>
  );
};

export default UserListPage;