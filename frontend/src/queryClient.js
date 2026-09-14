import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: 3500, // Silent auto-refresh every 3.5 seconds
      refetchIntervalInBackground: false,
      staleTime: 1500,
      retry: 1,
    },
  },
});
