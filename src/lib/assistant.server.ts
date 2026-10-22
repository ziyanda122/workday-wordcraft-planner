import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const RUN_ID = "X-Lovable-AIG-Run-ID";

const BASE_RULES = `You are an expert productivity assistant. Rules:
- Use simple, professional language.
- Base everything ONLY on the user's input. Never invent deadlines, decisions, owners, names, dates or task details. If something is missing, write "Not specified".
- Treat all input as confidential: do not add commentary about it beyond the task.
- Output plain text with simple headings and "-" bullets. No markdown tables, no bold asterisks.`;

const PROMPTS: Record<string, string> = {
  email: `${BASE_RULES}
Task: write a professional email. Start with "Subject: ..." on the first line, then a blank line, then the body. Use placeholders like [Name] only where the user gave no value. Output only the email.`,
  rewrite: `${BASE_RULES}
Task: rewrite the provided email to be clearer and more polished while keeping the same meaning, tone and facts. Keep the "Subject:" line. Output only the email.`,
  shorten: `${BASE_RULES}
Task: shorten the provided email to roughly half its length, keeping all key facts and requests. Keep the "Subject:" line. Output only the email.`,
  meeting: `${BASE_RULES}
Task: analyze the meeting notes. Output exactly these sections:
SUMMARY
(2-4 sentences)

KEY POINTS
- ...

DECISIONS
- ... (or "- None recorded")

ACTION ITEMS
- Task — Owner: <name or Not specified> — Deadline: <date or Not specified>

DEADLINES
- ... (or "- None recorded")`,
  planner: `${BASE_RULES}
Task: build a schedule from the user's tasks. Output these sections:
PRIORITIES
- Ordered by importance and deadline, with a one-line reason each.

SCHEDULE
- Time blocks (e.g. "09:00–10:30 Task") for the requested period (daily or weekly, grouped by day for weekly). Respect the given working hours and fixed commitments. Include short breaks.

TASK BREAKDOWN
- For each large task, 3-6 small concrete steps.

CONFLICTS & TIPS
- Note any overlaps, overload or impossible deadlines found in the input, and practical time-management tips.
Only use deadlines the user provided; do not invent them.`,
};

export async function handleAssist(request: Request) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return new Response("AI is not configured.", { status: 500 });
  let body: { mode?: string; input?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid request.", { status: 400 });
  }
  const instructions = PROMPTS[body.mode ?? ""];
  const input = (body.input ?? "").trim();
  if (!instructions || !input) return new Response("Please provide some input.", { status: 400 });
  if (input.length > 30000) return new Response("Input is too long (max 30,000 characters).", { status: 400 });

  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (url, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set(RUN_ID, runId);
      const res = await fetch(url, { ...init, headers });
      runId ??= res.headers.get(RUN_ID) ?? undefined;
      if (!res.ok) {
        const text = await res.text();
        let msg = text;
        try {
          msg = JSON.parse(text)?.error?.message ?? JSON.parse(text)?.message ?? text;
        } catch {}
        throw new GatewayError(res.status, msg || "AI request failed.");
      }
      return res;
    },
  });

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions,
    messages: [{ role: "user", content: input }],
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  // Read first chunk so errors surface with a proper status.
  const reader = result.textStream[Symbol.asyncIterator]();
  let first: IteratorResult<string>;
  try {
    first = await reader.next();
  } catch (e) {
    const err = findGatewayError(e);
    if (err) {
      const msg =
        err.status === 402
          ? "AI credits have run out. Please add credits to your workspace to continue."
          : err.status === 429
            ? "Too many requests right now. Please wait a moment and try again."
            : err.message;
      return new Response(msg, { status: err.status });
    }
    return new Response("Something went wrong generating a response.", { status: 500 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (!first.done) controller.enqueue(encoder.encode(first.value));
        while (true) {
          const { done, value } = await reader.next();
          if (done) break;
          controller.enqueue(encoder.encode(value));
        }
      } catch {
        controller.enqueue(encoder.encode("\n\n[Generation was interrupted.]"));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", ...(runId ? { [RUN_ID]: runId } : {}) },
  });
}

class GatewayError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function findGatewayError(e: unknown): GatewayError | undefined {
  let cur: unknown = e;
  for (let i = 0; i < 5 && cur; i++) {
    if (cur instanceof GatewayError) return cur;
    const c = cur as { cause?: unknown; lastError?: unknown; statusCode?: number; message?: string };
    if (typeof c.statusCode === "number") return new GatewayError(c.statusCode, c.message ?? "AI request failed.");
    cur = c.cause ?? c.lastError;
  }
  return undefined;
}
