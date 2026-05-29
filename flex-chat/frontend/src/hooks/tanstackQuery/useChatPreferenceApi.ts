import { useMutation, useQuery } from "@tanstack/react-query";

import chatApi from "../../api/chatApi";
import { STALE_TIME_5_MIN } from "../../constants/defaults";
import { queryClient } from "../../utils/queryClient";

import type { UserChatPreference } from "../../types/chat";

export const chatPreferenceKeys = {
	all: ["chatPreferences"] as const,
	detail: (chatId: number) => [...chatPreferenceKeys.all, chatId] as const,
};

export const useGetChatPreference = (chatId: number | null) => {
	return useQuery<UserChatPreference, Error>({
		queryKey: chatPreferenceKeys.detail(chatId ?? -1),
		queryFn: () => chatApi.getChatPreference(chatId!),
		enabled: !!chatId,
		staleTime: STALE_TIME_5_MIN,
	});
};

export const useUpdateChatPreference = () => {
	return useMutation({
		mutationFn: ({
			chatId,
			request,
		}: {
			chatId: number;
			request: UserChatPreference;
		}) => chatApi.updateChatPreference(chatId, request),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: chatPreferenceKeys.all,
				exact: false,
			});
		},
	});
};
