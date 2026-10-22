import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, NotebookPen, CalendarClock, ArrowRight } from "lucide-react";
import { Shell } from "@/components/Workspace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clearday — AI Productivity Assistant" },
      { name: "description", content: "Write emails, summarize meetings and plan your tasks with an AI-powered assistant." },
      { property: "og:title", content: "Clearday — AI Productivity Assistant" },
      { property: "og:description", content: "Write emails, summarize meetings and plan your tasks with an AI-powered assistant." },
    ],
  }),
  component: Index,
});

const TOOLS = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", desc: "Formal, friendly or persuasive drafts you can rewrite, shorten and copy." },
  { to: "/meetings", icon: NotebookPen, title: "Meeting Notes Summarizer", desc: "Key points, decisions, action items, owners and deadlines." },
  { to: "/planner", icon: CalendarClock, title: "Task Planner", desc: "Prioritized daily or weekly schedules with step-by-step breakdowns." },
] as const;

function Index() {
  return (
    <Shell>
      <section className="py-10 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">AI Productivity Assistant</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] text-foreground md:text-7xl">
          Less admin. <em className="text-primary">More done.</em>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Three focused tools that turn your rough notes into clear emails, summaries and plans — using only what you
          give them.
        </p>
      </section>
      <div className="grid gap-5 md:grid-cols-3">
        {TOOLS.map(({ to, icon: Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-2xl text-card-foreground">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
