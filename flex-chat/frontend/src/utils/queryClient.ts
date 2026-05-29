import { QueryClient } from "@tanstack/react-query";

import { STALE_TIME_1_HOUR } from "../constants/defaults";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_1_HOUR,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});