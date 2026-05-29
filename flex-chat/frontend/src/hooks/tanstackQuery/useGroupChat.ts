
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import chatApi from "../../api/chatApi";
import { queryClient } from "../../utils/queryClient";
import { chatKeys } from "./useChatApi";
import type { MemberRoleType } from "../../constants/app/appConstants";

interface CreateGroupPayload {
  name: string;
  description: string;
  imageUrl?: string;
  memberIds: number[];
}

export const useCreateGroupChat = () => {
  return useMutation({
    mutationFn: async (payload: CreateGroupPayload) => {
      return await chatApi.createGroupChat(payload);
    },

    onSuccess: (data) => {
      toast.success(`Group "${data.name}" created!`);
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to create group chat"
      );
    },
  });
};

export const useAddGroupMembers = () =>
  useMutation({
    mutationFn: ({
      chatId,
      userIds,
    }: {
      chatId: number;
      userIds: number[];
    }) =>
      chatApi.addGroupMembers(chatId, userIds),

    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.detail(chatId),
      });

      queryClient.invalidateQueries({
        queryKey: chatKeys.list(),
      });

      toast.success("Members added!");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to add members"
      );
    },
  });

export const useRemoveGroupMember = () =>
  useMutation({
    mutationFn: ({
      chatId,
      targetUserId,
    }: {
      chatId: number;
      targetUserId: number;
    }) =>
      chatApi.removeGroupMember(
        chatId,
        targetUserId
      ),

    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.detail(chatId),
      });

      queryClient.invalidateQueries({
        queryKey: chatKeys.list(),
      });

      toast.success("Member removed");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to remove member"
      );
    },
  });

export const useUpdateMemberRole = () =>
  useMutation({
    mutationFn: ({
      chatId,
      targetUserId,
      role,
    }: {
      chatId: number;
      targetUserId: number;
      role: (typeof MemberRoleType)[keyof typeof MemberRoleType];
    }) =>
      chatApi.updateMemberRole(
        chatId,
        targetUserId,
        role
      ),

    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.detail(chatId),
      });

      toast.success("Role updated");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update role"
      );
    },
  });

export const useUpdateGroupChat = () =>
  useMutation({
    mutationFn: ({
      chatId,
      ...body
    }: {
      chatId: number;
      name?: string;
      description?: string;
      imageUrl?: string;
    }) =>
      chatApi.updateGroupChat(chatId, body),

    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.detail(chatId),
      });

      queryClient.invalidateQueries({
        queryKey: chatKeys.list(),
      });

      toast.success("Group updated");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update group"
      );
    },
  });