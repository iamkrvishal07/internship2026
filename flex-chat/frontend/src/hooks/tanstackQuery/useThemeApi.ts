import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify"

import themeApi from "../../api/themeApi";
import { chatPreferenceKeys } from "./useChatPreferenceApi";

import { QUERY_KEYS, STALE_TIME, STALE_TIME_1_DAY } from "../../constants/tanstack/queryKeys";
import { queryClient } from "../../utils/queryClient";
import type { AxiosError } from "axios";
import type { GetPaginatedQueryParams } from "../../types/common";
import type { CreateOrUpdateTheme } from "../../types/theme";

export const useGetAllThemes = (params: GetPaginatedQueryParams) => {
    return useQuery({
        queryKey: [QUERY_KEYS.THEMES, "all", params],
        queryFn: () => themeApi.getAllThemes(params),
        placeholderData: (prev) => prev,
        staleTime: STALE_TIME
    });
}

export const useGetThemesByName = (name: string, params: GetPaginatedQueryParams) => {
    return useQuery({
        queryKey: [QUERY_KEYS.THEMES, name, params],
        queryFn: () => themeApi.getThemesByName(name, params),
        placeholderData: (prev) => prev,
        staleTime: STALE_TIME
    });
}

export const useGetDefaultTheme = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.THEMES, "default"],
        queryFn: themeApi.getDefaultThemeForUser,
        placeholderData: (prev) => prev,
        staleTime: STALE_TIME
    });
}

export const useCreateTheme = () => {
    return useMutation({
        mutationFn: (params: CreateOrUpdateTheme) => themeApi.createTheme(params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.THEMES],
                exact: false
            })

            queryClient.invalidateQueries({
                queryKey: chatPreferenceKeys.all,
                exact: false,
            })

            toast.success("Theme created successfully!")
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error?.response?.data?.message || "Couldn't create theme! Try again later!");
        }
    })
}

export const useUpdateTheme = () => {
    return useMutation({
        mutationFn: ({ id, params }: { id: number; params: CreateOrUpdateTheme }) => themeApi.updateThemeById(id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.THEMES],
                exact: false
            })

            queryClient.invalidateQueries({
                queryKey: chatPreferenceKeys.all,
                exact: false,
            })

            toast.success("Theme updated successfully!")
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error?.response?.data?.message || "Couldn't update theme! Try again later!");
        }
    })
}

export const useDeleteTheme = () => {
    return useMutation({
        mutationFn: (id: number) => themeApi.deleteThemeById(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.THEMES],
                exact: false
            })

            queryClient.invalidateQueries({
                queryKey: chatPreferenceKeys.all,
                exact: false,
            })

            toast.success("Theme deleted successfully!")
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error?.response?.data?.message || "Couldn't delete theme! Try again later!");
        }
    })
}

export const useGetThemeById = (id: number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.THEMES, id],
        queryFn: () => themeApi.getThemeById(id),
        placeholderData: (prev) => prev,
        staleTime: STALE_TIME
    });
}

export const useGetThemePropertyTypes = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.THEMES, "property-types"],
        queryFn: themeApi.getThemePropertyTypes,
        staleTime: STALE_TIME_1_DAY
    });
}

export const useGetPropertyTypeConstants = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.THEMES, "property-constants"],
        queryFn: themeApi.getElementPropertyTypeValidationConstants,
        staleTime: STALE_TIME_1_DAY
    });
}

export const useSetThemeAsDefault = () => {
    return useMutation({
        mutationFn: (id: number) => themeApi.setThemeAsDefault(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.THEMES],
                exact: false
            })

            queryClient.invalidateQueries({
                queryKey: chatPreferenceKeys.all,
                exact: false,
            })

            toast.success("Theme set as default!")
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error?.response?.data?.message || "Couldn't set theme as default! Try again later!");
        }
    })
}