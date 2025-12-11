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
      fetch: async (input, init?) => {
        console.log('[tRPC] 🌐 ========================================');
        console.log('[tRPC] 🌐 Starting fetch...');
        console.log('[tRPC] 🌐 URL:', input);
        console.log('[tRPC] 🌐 Method:', init?.method || 'GET');
        console.log('[tRPC] 🌐 Headers:', JSON.stringify(init?.headers, null, 2));
        console.log('[tRPC] 🌐 Body (first 100 chars):', typeof init?.body === 'string' ? init.body.substring(0, 100) : init?.body);
        console.log('[tRPC] 🌐 ========================================');
        
        const timeoutMs = 15000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.error('[tRPC] ⏱️ Request timeout after', timeoutMs, 'ms');
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
          
          console.log('[tRPC] ✅ ========================================');
          console.log('[tRPC] ✅ Response received');
          console.log('[tRPC] ✅ Status:', response.status, response.statusText);
          console.log('[tRPC] ✅ Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
          
          const text = await response.text();
          console.log('[tRPC] ✅ Body (first 300 chars):', text.substring(0, 300));
          console.log('[tRPC] ✅ ========================================');
          
          if (!response.ok) {
            console.error('[tRPC] ❌ HTTP Error:', response.status, response.statusText);
            console.error('[tRPC] ❌ Response body:', text);
            throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
          }
          
          return new Response(text, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        } catch (error: any) {
          clearTimeout(timeoutId);
          
          console.error('[tRPC] ❌ ========================================');
          console.error('[tRPC] ❌ FETCH ERROR');
          console.error('[tRPC] ❌ URL:', input);
          console.error('[tRPC] ❌ Error type:', error?.constructor?.name);
          console.error('[tRPC] ❌ Error name:', error?.name);
          console.error('[tRPC] ❌ Error message:', error?.message);
          
          if (error?.name === 'AbortError') {
            console.error('[tRPC] ❌ Request was aborted (timeout)');
          } else if (error?.message?.includes('Network request failed')) {
            console.error('[tRPC] ❌ Network error - Check:');
            console.error('[tRPC] ❌   1. Railway backend is running');
            console.error('[tRPC] ❌   2. URL is correct:', input);
            console.error('[tRPC] ❌   3. CORS is configured');
            console.error('[tRPC] ❌   4. SSL certificate is valid');
          }
          
          console.error('[tRPC] ❌ Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
          console.error('[tRPC] ❌ ========================================');
          
          throw new Error(`tRPC fetch failed: ${error?.message || 'Unknown error'}`);
        }
      },
    }),
  ],
});
