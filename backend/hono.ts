import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { verifyVapiWebhookSignature } from "./utils/security";
import { uploadRecordingToGCS } from "./utils/gcs";
import { db } from "./utils/database";
import type { VapiWebhookPayload } from "@/types";

const app = new Hono();

/**
 * ✅ CORS (obligatoire pour Netlify / Expo)
 */
app.use("*", cors());

/**
 * ✅ tRPC — POINT CRITIQUE
 * ✅ PAS de wildcard
 * ✅ endpoint EXACT = /api/trpc/*
 */
app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  })
);

/**
 * ✅ Health check
 */
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

/**
 * ✅ Webhook Vapi
 */
app.post("/webhooks/vapi/call-completed", async (c) => {
  try {
    console.log("[Webhook] Received Vapi.ai webhook");

    const signature = c.req.header("x-vapi-signature");
    const body = await c.req.text();

    const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Webhook] VAPI_WEBHOOK_SECRET not configured");
      return c.json({ error: "Configuration error" }, 500);
    }

    if (
      !signature ||
      !verifyVapiWebhookSignature(body, signature, webhookSecret)
    ) {
      console.error("[Webhook] Invalid signature");
      return c.json({ error: "Invalid signature" }, 401);
    }

    const payload: VapiWebhookPayload = JSON.parse(body);

    if (
      payload.type !== "call.ended" &&
      payload.type !== "end-of-call-report"
    ) {
      return c.json({ message: "Event ignored" }, 200);
    }

    const vapiPhoneNumber = payload.phoneNumber?.number;
    if (!vapiPhoneNumber) {
      return c.json({ error: "Missing phone number" }, 400);
    }

    const user = await db.users.findByVapiPhoneNumber(vapiPhoneNumber);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const durationSeconds = payload.call.duration || 0;
    const durationMinutes = Math.ceil(durationSeconds / 60);

    const vapiCostPerMinute = 0.17;
    const vapiCost = (durationSeconds / 60) * vapiCostPerMinute;

    let gcsRecordingUrl: string | undefined;

    if (payload.call.recordingUrl) {
      try {
        gcsRecordingUrl = await uploadRecordingToGCS(
          payload.call.recordingUrl,
          payload.call.id,
          user.id
        );
      } catch (error) {
        console.error("[Webhook] Failed to upload recording:", error);
      }
    }

    const call = await db.calls.create({
      userId: user.id,
      vapiCallId: payload.call.id,
      callerName: payload.call.customer?.name || "Unknown",
      callerNumber: payload.call.customer?.number || "Unknown",
      timestamp: payload.call.endedAt || new Date().toISOString(),
      duration: durationMinutes,
      durationSeconds,
      summary: payload.call.summary || "",
      transcription: payload.call.transcript || "",
      audioUrl: gcsRecordingUrl || payload.call.recordingUrl || "",
      gcsRecordingUrl,
      status: "completed",
      vapiCost,
    });

    let minutesRemaining = user.minutesRemaining - durationMinutes;
    let isAgentActive = user.isAgentActive;

    if (minutesRemaining <= 0) {
      minutesRemaining = 0;
      isAgentActive = false;
    }

    await db.users.update(user.id, {
      minutesRemaining,
      minutesConsumed: user.minutesConsumed + durationMinutes,
      isAgentActive,
    });

    return c.json({
      success: true,
      callId: call.id,
      minutesRemaining,
      isAgentActive,
      vapiCost: Number(vapiCost.toFixed(4)),
    });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
