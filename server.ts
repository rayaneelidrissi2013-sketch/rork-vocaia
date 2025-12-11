import app from "./backend/hono";

const port = parseInt(process.env.PORT || "3000", 10);

console.log(`[Server] Starting server on port ${port}...`);
console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`[Server] DATABASE_URL configured: ${!!process.env.DATABASE_URL}`);
console.log(`[Server] Version: 2025-01-11 - All admin routes enabled`);
console.log(`[Server] Auth routes: register, login, sendVerificationCode, verifyCode`);

export default {
  fetch: app.fetch,
  port,
};
