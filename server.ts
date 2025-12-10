import app from "./backend/hono";
import { serve } from "@hono/node-server";

const port = parseInt(process.env.PORT || "3000", 10);

console.log(`[Server] Starting server on port ${port}...`);
console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`[Server] DATABASE_URL configured: ${!!process.env.DATABASE_URL}`);

serve({
  fetch: app.fetch,
  port,
}, (info: { port: number; address: string }) => {
  console.log(`✅ [Server] Server is running on http://localhost:${info.port}`);
});

export default app;
