import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Copy, Loader2, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const NAV = [
  { to: "/email", label: "Email" },
  { to: "/meetings", label: "Meetings" },
  { to: "/planner", label: "Planner" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-2xl text-foreground">
            Clearday<span className="text-primary">.</span>
          </Link>
          <nav className="flex gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}

export function PageTitle({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{desc}</p>
    </div>
  );
}

export function Panel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function ResultPanel({
  output,
  setOutput,
  loading,
  stop,
  placeholder,
  actions,
}: {
  output: string;
  setOutput: (v: string) => void;
  loading: boolean;
  stop: () => void;
  placeholder: string;
  actions?: ReactNode;
}) {
  return (
    <Panel title="Result — review & edit">
      <Textarea
        value={output}
        onChange={(e) => setOutput(e.target.value)}
        placeholder={loading ? "Working on it…" : placeholder}
        className="min-h-[420px] resize-y bg-background text-[15px] leading-relaxed"
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {loading ? (
          <Button variant="outline" size="sm" onClick={stop}>
            <Square /> Stop
          </Button>
        ) : null}
        {actions}
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          disabled={!output}
          onClick={() => navigator.clipboard.writeText(output).then(() => toast.success("Copied"))}
        >
          <Copy /> Copy
        </Button>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </div>
    </Panel>
  );
}

export function PrivacyNote() {
  return (
    <p className="mt-4 text-xs text-muted-foreground">
      Your text is sent only to generate this result and is not saved by this app. Avoid pasting passwords or highly
      sensitive data.
    </p>
  );
}
