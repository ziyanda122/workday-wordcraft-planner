import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, RefreshCw, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shell, PageTitle, Panel, ResultPanel, PrivacyNote } from "@/components/Workspace";
import { useAssist } from "@/lib/use-assist";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Clearday" },
      { name: "description", content: "Write formal, friendly or persuasive professional emails in seconds." },
      { property: "og:title", content: "Smart Email Generator — Clearday" },
      { property: "og:description", content: "Write formal, friendly or persuasive professional emails in seconds." },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;

function EmailPage() {
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [purpose, setPurpose] = useState("");
  const [details, setDetails] = useState("");
  const a = useAssist();

  const generate = () =>
    a.run(
      "email",
      `Tone: ${tone}\nRecipient: ${to || "Not specified"}\nSender: ${from || "Not specified"}\nPurpose: ${purpose}\nKey details:\n${details}`,
    );

  return (
    <Shell>
      <PageTitle
        eyebrow="Smart Email Generator"
        title="Say it well, quickly."
        desc="Describe what you need. Pick a tone. Then edit, rewrite, shorten or copy the draft."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Your details">
          <div className="space-y-4">
            <div>
              <Label>Tone</Label>
              <div className="mt-2 flex gap-2">
                {TONES.map((t) => (
                  <Button key={t} size="sm" variant={tone === t ? "default" : "outline"} onClick={() => setTone(t)}>
                    {t}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="to">Recipient</Label>
                <Input id="to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="e.g. Ms Dlamini, HR Manager" />
              </div>
              <div>
                <Label htmlFor="from">Your name</Label>
                <Input id="from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="e.g. Ziyanda" />
              </div>
            </div>
            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Request a project deadline extension"
              />
            </div>
            <div>
              <Label htmlFor="details">Key details</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="min-h-[160px]"
                placeholder="Facts, dates, requests or points to include…"
              />
            </div>
            <Button onClick={generate} disabled={a.loading || !purpose.trim()} className="w-full">
              <Sparkles /> Generate email
            </Button>
          </div>
          <PrivacyNote />
        </Panel>
        <ResultPanel
          {...a}
          placeholder="Your email draft will appear here."
          actions={
            <>
              <Button size="sm" variant="secondary" disabled={!a.output || a.loading} onClick={() => a.run("rewrite", a.output)}>
                <RefreshCw /> Rewrite
              </Button>
              <Button size="sm" variant="secondary" disabled={!a.output || a.loading} onClick={() => a.run("shorten", a.output)}>
                <Scissors /> Shorten
              </Button>
            </>
          }
        />
      </div>
    </Shell>
  );
}
