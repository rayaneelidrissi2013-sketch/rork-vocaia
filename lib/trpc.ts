import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (!envUrl) {
    console.error('[tRPC] ❌ EXPO_PUBLIC_RORK_API_BASE_URL is not defined!');
    throw new Error('EXPO_PUBLIC_RORK_API_BASE_URL environment variable is required');
  }
  
  const trimmedUrl = envUrl.trim();
  console.log('[tRPC] ✅ Using base URL:', trimmedUrl);
  console.log('[tRPC] ✅ Full tRPC endpoint:', `${trimmedUrl}/api/trpc`);
  
  return trimmedUrl;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: (input, init?) => {
        console.log('[tRPC] 🌐 Starting fetch...');
        console.log('[tRPC] 🌐 URL:', input);
        console.log('[tRPC] 🌐 Method:', init?.method || 'GET');
        console.log('[tRPC] 🌐 Headers:', init?.headers);
        console.log('[tRPC] 🌐 Body (first 100 chars):', typeof init?.body === 'string' ? init.body.substring(0, 100) : init?.body);
        
        return fetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            'Content-Type': 'application/json',
          },
        }).then(async (res) => {
          console.log('[tRPC] ✅ Response received');
          console.log('[tRPC] ✅ Status:', res.status, res.statusText);
          console.log('[tRPC] ✅ Headers:', Object.fromEntries(res.headers.entries()));
          const text = await res.text();
          console.log('[tRPC] ✅ Body (first 200 chars):', text.substring(0, 200));
          
          if (!res.ok) {
            console.error('[tRPC] ❌ HTTP Error:', res.status);
            throw new Error(`HTTP error! status: ${res.status}, body: ${text.substring(0, 200)}`);
          }
          
          return new Response(text, {
            status: res.status,
            statusText: res.statusText,
            headers: res.headers,
          });
        }).catch((error) => {
          console.error('[tRPC] ❌ ========================================');
          console.error('[tRPC] ❌ FETCH ERROR');
          console.error('[tRPC] ❌ URL:', input);
          console.error('[tRPC] ❌ Error type:', error?.constructor?.name);
          console.error('[tRPC] ❌ Error message:', error?.message);
          console.error('[tRPC] ❌ Error stack:', error?.stack);
          console.error('[tRPC] ❌ Full error object:', error);
          console.error('[tRPC] ❌ ========================================');
          
          throw error;
        });
      },
    }),
  ],
});
