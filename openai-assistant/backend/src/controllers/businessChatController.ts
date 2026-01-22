import { Request, Response } from "express";
import openai from "../services/openaiService";

interface ChatRequestBody {
  userId: number | string;
  message: string;
}

interface ChatResponse {
  reply?: string;
  attempts?: number;
  runStatus?: string;
  durationMs?: number;
  error?: string;
}

// Simple ping
export const getMessages = async (_req: Request, res: Response) => {
  res.status(200).json({ message: "Business Chat ai" });
};

// Map: userId -> threadId
const userThreads: Record<string, string> = {};

export const businessChatbot = async (
  req: Request<{}, {}, ChatRequestBody>,
  res: Response<ChatResponse>
) => {
  try {
    const { userId, message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const safeUserId = String(userId);

    // 1) Thread holen/erstellen
    if (!userThreads[safeUserId]) {
      const thread = await openai.beta.threads.create();
      userThreads[safeUserId] = thread.id;
      console.log(
        `[thread] created new threadId=${thread.id} for userId=${safeUserId}`
      );
    }
    const threadId = userThreads[safeUserId];

    // 2) User-Message in den Thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    // 3) Run starten (mit deiner Assistant-ID)
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: "asst_aCO64Xu25NYVAJdA0wBxjpYa",
    });
    console.log(
      `[run] started runId=${run.id} threadId=${threadId} status=${run.status}`
    );

    // 4) Polling mit Timeout + Backoff
    const started = Date.now();
    const timeoutMs = 60_000;
    const maxAttempts = 90;
    let attempts = 0;
    let delayMs = 800;
    let currentRun = run;
    let runStatus = run.status;

    while (
      !["completed", "failed", "cancelled", "expired"].includes(runStatus)
    ) {
      if (Date.now() - started > timeoutMs) {
        console.warn(
          `[run] timeout runId=${currentRun.id} after ${attempts} attempts`
        );
        throw new Error("Run timed out");
      }
      if (attempts >= maxAttempts) {
        console.warn(
          `[run] maxAttempts reached runId=${currentRun.id} attempts=${attempts}`
        );
        throw new Error(`Run exceeded max attempts (${maxAttempts})`);
      }

      await new Promise((r) => setTimeout(r, delayMs));
      delayMs = Math.min(Math.floor(delayMs * 1.5), 5000);

      attempts++;
      currentRun = await openai.beta.threads.runs.retrieve(
        threadId,
        currentRun.id
      );
      runStatus = currentRun.status;
      console.log(
        `[run] attempt=${attempts} runId=${currentRun.id} status=${runStatus}`
      );

      if (runStatus === "requires_action") {
        // TODO: Tool-Outputs einspeisen, falls dein Assistant Tools nutzt
        // await openai.beta.threads.runs.submitToolOutputs(threadId, currentRun.id, { tool_outputs: [...] })
      }
    }

    if (runStatus !== "completed") {
      throw new Error(`Run ended with status: ${runStatus}`);
    }

    const durationMs = Date.now() - started;

    // 5) Neueste Assistant-Antworten dieses Runs lesen
    const msgList = await openai.beta.threads.messages.list(threadId, {
      limit: 50,
      // Einige SDK-Versionen unterstützen 'order'. Wenn's meckert, entferne die Zeile:
      order: "desc" as any,
    });
    const messages = msgList.data;
    console.log(
      `[thread] fetched ${messages.length} messages for threadId=${threadId}`
    );

    // Bevorzugt: genau die Assistant-Messages, die von DIESEM Run stammen
    const assistantMsgsForRun = messages.filter(
      (m: any) => m.role === "assistant" && m.run_id === currentRun.id
    );
    // Fallback: generell die neuesten Assistant-Nachrichten
    const assistantMsgs =
      assistantMsgsForRun.length > 0
        ? assistantMsgsForRun
        : messages.filter((m: any) => m.role === "assistant");

    // Alle Textblöcke extrahieren und zusammensetzen
    const textBlocks = assistantMsgs
      .flatMap((m: any) => m.content)
      .filter((c: any) => c.type === "text" && c.text?.value)
      .map((c: any) => c.text.value as string);

    const reply = textBlocks.join("\n\n").trim() || "No response from AI";

    console.log(
      `[thread] reply to userId=${safeUserId} (threadId=${threadId}): ` +
        `${reply.slice(0, 200)}${reply.length > 200 ? "..." : ""}`
    );

    return res.status(200).json({ reply, attempts, runStatus, durationMs });
  } catch (err) {
    console.error("Business Chatbot error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
