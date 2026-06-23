import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import process from "node:process";

import { getSupabaseAdmin } from "../supabase-admin.server";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1),
});

const chatInputSchema = z.object({
  accessToken: z.string().min(1),
  messages: z.array(chatMessageSchema).min(1),
});

function getChatConfig() {
  const workerUrl =
    process.env.QAMIND_AI_WORKER_URL ||
    process.env.VITE_QAMIND_AI_WORKER_URL ||
    "http://100.118.124.47:8000";

  const workerKey =
    process.env.QAMIND_AI_WORKER_KEY ||
    process.env.VITE_QAMIND_AI_WORKER_KEY ||
    "qamind-secret-123";

  const ollamaUrl =
    process.env.QAMIND_OLLAMA_URL || "http://100.118.124.47:11434";

  const model =
    process.env.QAMIND_OLLAMA_MODEL ||
    process.env.OLLAMA_MODEL ||
    "qwen2.5:14b-instruct-q4_K_M";

  return { workerUrl: workerUrl.replace(/\/$/, ""), workerKey, ollamaUrl, model };
}

async function verifyUser(accessToken: string) {
  const adminClient = getSupabaseAdmin();
  const {
    data: { user },
    error,
  } = await adminClient.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}

function extractAssistantText(payload: Record<string, unknown>): string {
  const message = payload.message as Record<string, unknown> | undefined;
  if (message && typeof message.content === "string") return message.content;

  const response = payload.response;
  if (typeof response === "string") return response;

  const reply = payload.reply;
  if (typeof reply === "string") return reply;

  const content = payload.content;
  if (typeof content === "string") return content;

  return "";
}

async function callWorkerChat(
  workerUrl: string,
  workerKey: string,
  model: string,
  messages: z.infer<typeof chatMessageSchema>[],
) {
  const response = await fetch(`${workerUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-QAMIND-Internal-Key": workerKey,
    },
    body: JSON.stringify({ model, messages }),
    signal: AbortSignal.timeout(300_000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Worker chat failed (${response.status}): ${body || response.statusText}`);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const text = extractAssistantText(payload);
  if (!text.trim()) {
    throw new Error("Worker returned an empty chat response.");
  }

  return { text, source: "worker" as const };
}

async function callOllamaChat(
  ollamaUrl: string,
  model: string,
  messages: z.infer<typeof chatMessageSchema>[],
) {
  const response = await fetch(`${ollamaUrl.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
    signal: AbortSignal.timeout(300_000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Ollama chat failed (${response.status}): ${body || response.statusText}`);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const text = extractAssistantText(payload);
  if (!text.trim()) {
    throw new Error("Ollama returned an empty chat response.");
  }

  return { text, source: "ollama" as const };
}

export const chatWithLocalLlm = createServerFn({ method: "POST" })
  .inputValidator(chatInputSchema)
  .handler(async ({ data }) => {
    await verifyUser(data.accessToken);

    const { workerUrl, workerKey, ollamaUrl, model } = getChatConfig();

    try {
      return {
        success: true,
        ...(await callWorkerChat(workerUrl, workerKey, model, data.messages)),
        model,
      };
    } catch (workerError) {
      try {
        return {
          success: true,
          ...(await callOllamaChat(ollamaUrl, model, data.messages)),
          model,
          fallback: true,
        };
      } catch (ollamaError) {
        const workerMsg =
          workerError instanceof Error ? workerError.message : "Worker unavailable";
        const ollamaMsg =
          ollamaError instanceof Error ? ollamaError.message : "Ollama unavailable";
        return {
          success: false,
          error: `Could not reach your workstation LLM. Worker: ${workerMsg}. Ollama: ${ollamaMsg}`,
        };
      }
    }
  });
