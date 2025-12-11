import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  console.log('[tRPC] Base URL from env:', url);
  
  if (!url) {
    console.error('[tRPC] ERROR: EXPO_PUBLIC_RORK_API_BASE_URL is not set!');
    throw new Error('API URL not configured. Please set EXPO_PUBLIC_RORK_API_BASE_URL');
  }
  
  return url;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: (input, init?) => {
        console.log('[tRPC] Fetching:', input);
        return fetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            'Content-Type': 'application/json',
          },
        }).then(async (res) => {
          console.log('[tRPC] Response status:', res.status);
          console.log('[tRPC] Response headers:', Object.fromEntries(res.headers.entries()));
          const text = await res.text();
          console.log('[tRPC] Response body (first 200 chars):', text.substring(0, 200));
          
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}, body: ${text.substring(0, 200)}`);
          }
          
          return new Response(text, {
            status: res.status,
            statusText: res.statusText,
            headers: res.headers,
          });
        }).catch((error) => {
          console.error('[tRPC] Fetch error:', error);
          console.error('[tRPC] URL was:', input);
          console.error('[tRPC] Full error:', JSON.stringify(error, null, 2));
          throw error;
        });
      },
    }),
  ],
});
