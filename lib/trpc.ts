import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../backend/trpc/app-router';
import superjson from 'superjson';
import Constants from 'expo-constants';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const apiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL;
  if (apiUrl) {
    return apiUrl;
  }
  
  if (typeof window !== 'undefined') {
    return '';
  }
  
  return 'http://localhost:3000';
};

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      transformer: superjson,
      headers: () => {
        return {
          'Content-Type': 'application/json',
        };
      },
    }),
  ],
});
