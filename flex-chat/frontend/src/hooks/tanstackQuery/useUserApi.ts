import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

import accountApi from "../../api/accountApi";
import userApi from "../../api/userApi";
import { DEFAULT_PAGE_SIZE } from "../../constants/defaults";
import { QUERY_KEYS, STALE_TIME } from "../../constants/tanstack/queryKeys";
import { queryClient } from "../../utils/queryClient";

import type { UserProfileUpdate } from "../../api/userApi";
import type { AxiosError } from "axios";

export const useFetchUsers = (searchTerm: string) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.USERS, searchTerm],
    queryFn: ({ pageParam = 1 }) =>
      userApi.getUsers({ searchTerm, page: pageParam, pageSize: DEFAULT_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    staleTime: STALE_TIME,
  });
};

export const useFetchUserProfile = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE],
    queryFn: () => userApi.getMyProfile(),
    placeholderData: (prev) => prev,
    staleTime: STALE_TIME,
  });
};

export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: (params: UserProfileUpdate) =>
      userApi.updateUserProfile(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_PROFILE]
      })

      toast.success("Profile Updated Successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update profile! Try again later!",
      );
    },
  });
};

export const useCheckUsername = (username: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CHECK_USERNAME, username],
    queryFn: () => accountApi.checkUsername(username),
    enabled: username.trim().length >= 3,
    staleTime: STALE_TIME,
  });
};

export const useCheckEmail = (email: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CHECK_EMAIL, email],
    queryFn: () => accountApi.checkEmail(email),
    enabled: email.trim().length >= 5 && email.includes("@"),
    staleTime: STALE_TIME,
  });
};

export const useGetUsers = (params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: ["users", "list", params],
    queryFn: async () => {
      const data = await userApi.getUsers(params ?? {});
      return Array.isArray(data)
        ? data
        : (data.items ?? data.data ?? data.users ?? []);
    },
    staleTime: STALE_TIME,
  });
};
