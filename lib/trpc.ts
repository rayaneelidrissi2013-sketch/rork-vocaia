import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const envUrl = 'https://vocaia-backend-clean-production.up.railway.app';
  
  const fallbackUrl = 'https://vocaia-backend-clean-production.up.railway.app';
  
  if (!envUrl) {
    console.warn('[tRPC] ⚠️ EXPO_PUBLIC_RORK_API_BASE_URL is not defined!');
    console.warn('[tRPC] ⚠️ Using fallback URL:', fallbackUrl);
    console.warn('[tRPC] ⚠️ Please configure EXPO_PUBLIC_RORK_API_BASE_URL in Rork settings');
    return fallbackUrl;
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
      headers: () => {
        return {
          'content-type': 'application/json',
        };
      },
      fetch: async (input, init?) => {
        const isDev = __DEV__;
        if (isDev) {
          console.log('[tRPC] 🌐 Fetch:', init?.method || 'GET', input.toString().split('?')[0]);
        }
        
        const timeoutMs = 10000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          if (__DEV__) console.error('[tRPC] ⏱️ Timeout');
          controller.abort();
        }, timeoutMs);

        try {
          const response = await fetch(input, {
            ...init,
            signal: controller.signal,
            headers: {
              ...init?.headers,
              'Content-Type': 'application/json',
            },
          });
          
          clearTimeout(timeoutId);
          
          const text = await response.text();
          
          if (!response.ok) {
            if (__DEV__) {
              console.error('[tRPC] ❌ HTTP Error:', response.status);
              console.error('[tRPC] ❌ Body:', text.substring(0, 200));
            }
            throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
          }
          
          return new Response(text, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        } catch (error: any) {
          clearTimeout(timeoutId);
          
          if (__DEV__) {
            console.error('[tRPC] ❌ Error:', error?.message);
            if (error?.name === 'AbortError') {
              console.error('[tRPC] ❌ Timeout');
            }
          }
          
          throw new Error(`tRPC fetch failed: ${error?.message || 'Unknown error'}`);
        }
      },
    }),
  ],
});
