import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shell, PageTitle, Panel, ResultPanel, PrivacyNote } from "@/components/Workspace";
import { useAssist } from "@/lib/use-assist";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Clearday" },
      { name: "description", content: "Prioritize tasks and build conflict-free daily or weekly schedules." },
      { property: "og:title", content: "AI Task Planner — Clearday" },
      { property: "og:description", content: "Prioritize tasks and build conflict-free daily or weekly schedules." },
    ],
  }),
  component: PlannerPage,
});

type Task = { name: string; deadline: string; hours: string; importance: "High" | "Medium" | "Low" };
const blank: Task = { name: "", deadline: "", hours: "", importance: "Medium" };

function PlannerPage() {
  const [period, setPeriod] = useState<"Daily" | "Weekly">("Daily");
  const [hours, setHours] = useState("08:00–17:00");
  const [fixed, setFixed] = useState("");
  const [tasks, setTasks] = useState<Task[]>([{ ...blank }]);
  const a = useAssist();

  const update = (i: number, patch: Partial<Task>) => setTasks((t) => t.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const valid = tasks.filter((t) => t.name.trim());

  const plan = () =>
    a.run(
      "planner",
      `Plan type: ${period}\nWorking hours: ${hours || "Not specified"}\nFixed commitments:\n${fixed || "None"}\n\nTasks:\n` +
        valid
          .map(
            (t, i) =>
              `${i + 1}. ${t.name} | Importance: ${t.importance} | Deadline: ${t.deadline || "Not specified"} | Estimated time: ${t.hours ? t.hours + " h" : "Not specified"}`,
          )
          .join("\n"),
    );

  return (
    <Shell>
      <PageTitle
        eyebrow="AI Task Planner / Scheduler"
        title="A calmer plan for your day."
        desc="List your tasks. Get priorities, time blocks, step-by-step breakdowns and conflict warnings."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Your tasks">
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <Label>Plan</Label>
                <div className="mt-2 flex gap-2">
                  {(["Daily", "Weekly"] as const).map((p) => (
                    <Button key={p} size="sm" variant={period === p ? "default" : "outline"} onClick={() => setPeriod(p)}>
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="hours">Working hours</Label>
                <Input id="hours" value={hours} onChange={(e) => setHours(e.target.value)} />
              </div>
            </div>
            <div className="space-y-3">
              {tasks.map((t, i) => (
                <div key={i} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex gap-2">
                    <Input placeholder="Task name" value={t.name} onChange={(e) => update(i, { name: e.target.value })} />
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Remove task"
                      disabled={tasks.length === 1}
                      onClick={() => setTasks((x) => x.filter((_, j) => j !== i))}
                    >
                      <X />
                    </Button>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <Input type="date" value={t.deadline} onChange={(e) => update(i, { deadline: e.target.value })} aria-label="Deadline" />
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="Hours"
                      value={t.hours}
                      onChange={(e) => update(i, { hours: e.target.value })}
                    />
                    <select
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      value={t.importance}
                      onChange={(e) => update(i, { importance: e.target.value as Task["importance"] })}
                      aria-label="Importance"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setTasks((t) => [...t, { ...blank }])}>
                <Plus /> Add task
              </Button>
            </div>
            <div>
              <Label htmlFor="fixed">Fixed commitments (optional)</Label>
              <Textarea
                id="fixed"
                value={fixed}
                onChange={(e) => setFixed(e.target.value)}
                placeholder="e.g. Team meeting Mon 10:00–11:00, lunch 13:00–14:00"
              />
            </div>
            <Button className="w-full" onClick={plan} disabled={a.loading || valid.length === 0}>
              <CalendarClock /> Build my plan
            </Button>
          </div>
          <PrivacyNote />
        </Panel>
        <ResultPanel {...a} placeholder="Your priorities and schedule will appear here." />
      </div>
    </Shell>
  );
}
