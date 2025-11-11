"use client";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useModelConfig, type ModelSlotKey } from "@/lib/store/models";

type StreamingPaneProps = {
  stage: "research" | "reasoning" | "coding" | "final";
  worker: "worker1" | "worker2" | "worker3" | "master";
  sessionId: string;
  autoStart?: boolean;
  prompt?: string;
  enabled?: boolean;
  slotKey: ModelSlotKey;
  startTrigger?: number;
};

export function StreamingPane({ stage, worker, sessionId, autoStart, prompt, enabled = true, slotKey, startTrigger }: StreamingPaneProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const { options, slots, setSlot, provider } = useModelConfig();
  const [editing, setEditing] = useState(false);
  const [nextModel, setNextModel] = useState<string>("");

  const start = () => {
    if (running || !enabled) return;
    setRunning(true);
    setLines([]);
    setDone(false);
    const qp = new URLSearchParams({ worker, sessionId });
    if (prompt && prompt.trim().length > 0) qp.set("prompt", prompt.trim());
    const modelId = slots[slotKey];
    if (modelId && modelId.trim().length > 0) qp.set("model", modelId.trim());
    if (provider) qp.set("provider", provider);
    const url = `/api/stream/${stage}?${qp.toString()}`;
    const es = new EventSource(url);
    esRef.current = es;
    es.addEventListener("message", (ev) => {
      try {
        const payload = JSON.parse((ev as MessageEvent).data);
        if (payload?.text) {
          setLines((prev) => [...prev, payload.text as string]);
        } else if (payload?.error) {
          setLines((prev) => [...prev, `Error: ${String(payload.error)}`]);
        }
      } catch (e) {
        // ignore
      }
    });
    es.addEventListener("done", (ev) => {
      setDone(true);
      es.close();
      setRunning(false);
    });
    es.onerror = () => {
      setLines((prev) => [...prev, "Error: streaming failed or disconnected."]);
      es.close();
      setRunning(false);
    };
  };

  useEffect(() => {
    if (autoStart) start();
    return () => {
      esRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, worker, sessionId]);

  // Respond to external start triggers
  useEffect(() => {
    if (startTrigger && startTrigger > 0 && enabled) {
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTrigger]);

  return (
    <Card className={`flex flex-col h-full bg-black/40 backdrop-blur-md border border-white/20 shadow-xl shadow-blue-500/10 ${!enabled ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/20 text-white">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Model</span>
          <span className="text-white/80 text-sm">{slots[slotKey] || "—"}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing((v) => !v)}
            disabled={!enabled || options.length === 0}
            className="px-2 text-white/70 hover:text-white"
            aria-label="Edit model"
          >
            ✎
          </Button>
        </div>
        {editing && (
          <div className="flex items-center gap-2">
            <Select value={nextModel || undefined} onValueChange={(v) => setNextModel(v)}>
              <SelectTrigger className="w-56 bg-black/30 text-white border-white/30">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              disabled={!nextModel}
              onClick={() => {
                if (nextModel) setSlot(slotKey, nextModel);
                setEditing(false);
              }}
              className="bg-black/30 text-white border-white/30"
            >
              Apply
            </Button>
          </div>
        )}
      </div>
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2 text-sm leading-relaxed text-white">
          <AnimatePresence initial={false}>
            {lines.map((l, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="rounded-md bg-black/30 border border-white/20 px-2 py-1 text-white"
              >
                {l}
              </motion.div>
            ))}
          </AnimatePresence>
          {done && <div className="text-white/80">[Completed]</div>}
        </div>
      </ScrollArea>
    </Card>
  );
}