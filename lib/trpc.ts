import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  console.log('[tRPC] ========================================');
  console.log('[tRPC] Checking environment variables...');
  console.log('[tRPC] EXPO_PUBLIC_RORK_API_BASE_URL:', url);
  console.log('[tRPC] All env vars:', process.env);
  console.log('[tRPC] ========================================');
  
  if (!url) {
    console.error('[tRPC] ❌ ERROR: EXPO_PUBLIC_RORK_API_BASE_URL is not set!');
    alert('Configuration Error: API URL is not configured. Please set EXPO_PUBLIC_RORK_API_BASE_URL in your environment variables.');
    throw new Error('API URL not configured. Please set EXPO_PUBLIC_RORK_API_BASE_URL');
  }
  
  console.log('[tRPC] ✅ Using base URL:', url);
  console.log('[tRPC] ✅ Full tRPC endpoint:', `${url}/api/trpc`);
  
  return url;
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
          
          alert(`Network Error: Cannot reach the API server at ${input}. Please check:
1. Your Railway backend is running
2. EXPO_PUBLIC_RORK_API_BASE_URL is correct
3. Your internet connection`);
          
          throw error;
        });
      },
    }),
  ],
});
