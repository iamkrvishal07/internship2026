import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

import chatApi from "../../api/chatApi";
import { STALE_TIME_1_MIN, STALE_TIME_30_SEC } from "../../constants/defaults";
import { queryClient } from "../../utils/queryClient";

import type { Conversation } from "../../types/chat";

export const chatKeys = {
  all: ['chats'] as const,
  lists: () => [...chatKeys.all, 'list'] as const,
  list: () => [...chatKeys.lists()] as const,
  details: () => [...chatKeys.all, 'detail'] as const,
  detail: (id: number) => [...chatKeys.details(), id] as const,
  messages: (chatId: number) => [...chatKeys.all, 'messages', chatId] as const,
};

export const useGetMyChats = () => {
  return useQuery<Conversation[], Error>({  
    queryKey: chatKeys.list(),
    queryFn: chatApi.getMyChats,
    staleTime: STALE_TIME_1_MIN,
  });
};

export const useGetChatById = (chatId: number | null) => {
  return useQuery({
    queryKey: chatKeys.detail(chatId!),
    queryFn: () => chatApi.getChatById(chatId!),
    enabled: !!chatId,
  });
};

export const useGetOrCreateDirectChat = () => {

  return useMutation({
    mutationFn: (targetUserId: number) => chatApi.getOrCreateDirectChat(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.list() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create chat");
    },
  });
};

export const useSendMessage = () => {

  return useMutation({
    mutationFn: ({
      chatId,
      content,
      contentType = 'text',
      parentId,
    }: {
      chatId: number;
      content: string;
      contentType?: string;
      parentId?: number;
    }) => chatApi.sendMessage(chatId, content, contentType, parentId),
    onSuccess: (_, variables) => {

      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.chatId) });

      queryClient.invalidateQueries({ queryKey: chatKeys.list() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send message");
    },
  });
};

export const useGetMessages = (chatId: number | null) => {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(chatId!),
    queryFn: ({ pageParam }) =>
      chatApi.getMessages(chatId!, pageParam as number | undefined),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!chatId,
    staleTime: STALE_TIME_30_SEC,
  });
};

export const useMarkMessagesRead = () => {

  return useMutation({
    mutationFn: ({ chatId, messageIds }: { chatId: number; messageIds: number[] }) =>
      chatApi.markMessagesRead(chatId, messageIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.chatId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.list() });
    },
  });
};

export const useEditMessage = () => {

  return useMutation({
    mutationFn: ({
      chatId,
      messageId,
      newContent,
    }: {
      chatId: number;
      messageId: number;
      newContent: string;
    }) => chatApi.editMessage(chatId, messageId, newContent),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.chatId) });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to edit message");
    },
  });
};

export const useDeleteMessage = () => {

  return useMutation({
    mutationFn: ({ chatId, messageId }: { chatId: number; messageId: number }) =>
      chatApi.deleteMessage(chatId, messageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.chatId) });
      toast.success("Message deleted");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete message");
    },
  });
};