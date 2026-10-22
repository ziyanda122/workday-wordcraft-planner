import { createFileRoute } from "@tanstack/react-router";
import { handleAssist } from "@/lib/assistant.server";

export const Route = createFileRoute("/api/assist")({
  server: { handlers: { POST: ({ request }) => handleAssist(request) } },
});
