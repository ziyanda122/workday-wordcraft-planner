import { useRef, useState } from "react";
import { toast } from "sonner";

export function useAssist() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const ctrl = useRef<AbortController | null>(null);

  async function run(mode: string, input: string) {
    if (!input.trim()) {
      toast.error("Please add some details first.");
      return;
    }
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, input }),
        signal: c.signal,
      });
      if (!res.ok || !res.body) {
        toast.error((await res.text()) || "Something went wrong.");
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += dec.decode(value, { stream: true });
        setOutput(text);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return { output, setOutput, loading, run, stop: () => ctrl.current?.abort() };
}
