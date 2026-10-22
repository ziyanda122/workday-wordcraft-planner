import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shell, PageTitle, Panel, ResultPanel, PrivacyNote } from "@/components/Workspace";
import { useAssist } from "@/lib/use-assist";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Clearday" },
      { name: "description", content: "Turn long meeting notes into summaries, decisions, action items and deadlines." },
      { property: "og:title", content: "Meeting Notes Summarizer — Clearday" },
      { property: "og:description", content: "Turn long meeting notes into summaries, decisions, action items and deadlines." },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const a = useAssist();
  return (
    <Shell>
      <PageTitle
        eyebrow="Meeting Notes Summarizer"
        title="From long notes to clear next steps."
        desc="Paste your notes. Get a short summary, key points, decisions, action items with owners, and deadlines — only what's in your notes."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Meeting notes">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[420px]"
            placeholder="Paste raw meeting notes or a transcript here…"
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{notes.length.toLocaleString()} characters</span>
            <Button onClick={() => a.run("meeting", notes)} disabled={a.loading || !notes.trim()}>
              <ListChecks /> Summarize
            </Button>
          </div>
          <PrivacyNote />
        </Panel>
        <ResultPanel {...a} placeholder="Summary, decisions and action items will appear here." />
      </div>
    </Shell>
  );
}
