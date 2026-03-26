"use client";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useModelConfig, type ModelSlotKey } from "@/lib/store/models";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ModelSearch } from "@/components/ModelSearch";

type StreamingPaneProps = {
  stage: "research" | "reasoning" | "coding" | "final";
  worker: "worker1" | "worker2" | "worker3" | "master";
  sessionId: string;
  autoStart?: boolean;
  prompt?: string;
  enabled?: boolean;
  slotKey: ModelSlotKey;
  startTrigger?: number;
  onComplete?: () => void;
  onContentComplete?: (worker: string, content: string) => void;
  disabled?: boolean;
  extraBody?: Record<string, unknown>;
  roleLabel?: string;
};

export function StreamingPane({ stage, worker, sessionId, autoStart, prompt, enabled = true, slotKey, startTrigger, onComplete, onContentComplete, disabled = false, extraBody, roleLabel }: StreamingPaneProps) {
  const [content, setContent] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const contentRef = useRef("");
  const { options, slots, setSlot, provider } = useModelConfig();
  const [editing, setEditing] = useState(false);
  const [nextModel, setNextModel] = useState<string>("");
  const [modelSearch, setModelSearch] = useState<string>("");
  const startTimeRef = useRef<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const start = async () => {
    if (running || !enabled) return;
    setRunning(true);
    setDone(false);
    setContent("");
    setElapsedMs(null);
    contentRef.current = "";
    startTimeRef.current = Date.now();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`/api/stream/${stage}`, {
        method: "POST",
        signal: controller.signal,
        headers: { 
          "Content-Type": "application/json",
          "x-provider-key": useModelConfig.getState().apiKey || ""
        },
        body: JSON.stringify({
          worker,
          sessionId,
          prompt: prompt?.trim() ?? "",
          model: slots[slotKey] ?? "",
          provider,
          ...extraBody,
        }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "";
      let streamDone = false;

      while (true) {
        const { value, done: doneReading } = await reader.read();
        if (doneReading) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            currentEvent = line.replace("event:", "").trim();
          } else if (line.startsWith("data:")) {
            const payload = line.replace("data:", "").trim();
            if (currentEvent === "message") {
              try {
                const json = JSON.parse(payload);
                if (json?.text) {
                  contentRef.current += json.text;
                  setContent((prev) => prev + json.text);
                } else if (json?.error) {
                  const errText = `\n\nError: ${String(json.error)}`;
                  contentRef.current += errText;
                  setContent((prev) => prev + errText);
                }
              } catch {
              }
            } else if (currentEvent === "done") {
              setDone(true);
              setRunning(false);
              streamDone = true;
              if (startTimeRef.current) {
                setElapsedMs(Date.now() - startTimeRef.current);
              }
              onContentComplete?.(worker, contentRef.current);
              onComplete?.();
              return;
            } else if (currentEvent === "end") {
              setRunning(false);
              streamDone = true;
              onContentComplete?.(worker, contentRef.current);
              onComplete?.();
              return;
            }
          } else if (line.trim() === "") {
            currentEvent = "";
          }
        }
      }

      if (!streamDone) {
        setRunning(false);
        onContentComplete?.(worker, contentRef.current);
        onComplete?.();
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        const errText = `\n\nError: ${String(error)}`;
        contentRef.current += errText;
        setContent((prev) => prev + errText);
      }
      setRunning(false);
    }
  };

  useEffect(() => {
    if (autoStart) start();
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, worker, sessionId]);

  useEffect(() => {
    if (startTrigger && startTrigger > 0 && enabled) {
      setRetryCount(0);
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTrigger]);

  const getStatusBadge = () => {
    if (disabled) {
      return { dot: "bg-slate-500", text: "Waiting..." };
    }
    if (running && !done) {
      return { dot: "bg-primary animate-pulse shadow-[0_0_8px_#ff5c00]", text: "Synthesizing..." };
    }
    if (done) {
      return { dot: "bg-secondary", text: "Done ✓" };
    }
    if (!running && !done && content.includes("\n\nError:")) {
      return { dot: "bg-red-500", text: "Error" };
    }
    return { dot: "bg-surface-container-highest", text: "Idle" };
  };

  const status = getStatusBadge();
  const hasError = !running && !done && content.includes("Error:");

  return (
    <div className={`glass-panel gradient-border hover:border-primary/20 transition-all duration-700 rounded-2xl p-6 relative flex flex-col h-[420px] overflow-hidden group hover:shadow-[0_0_60px_rgba(255,92,0,0.06)] ${!enabled ? "opacity-40 grayscale" : ""}`}>
      <div className="flex items-center justify-between pb-4 border-b border-white/5 text-on-surface mb-2">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{roleLabel || "Worker"}</span>
            <span className="text-xs text-muted-foreground">{slots[slotKey] || "—"}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing((v) => !v)}
            disabled={!enabled || options.length === 0}
            className="px-2 text-muted-foreground hover:text-foreground"
            aria-label="Edit model"
          >
            ✎
          </Button>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          <span className="text-xs text-muted-foreground">{status.text}</span>
          {hasError && retryCount < 3 && (
            <Button variant="ghost" size="sm" onClick={() => { start(); setRetryCount((c) => c + 1); }} className="px-2 text-muted-foreground hover:text-foreground">
              ⟳ Retry
            </Button>
          )}
          {hasError && retryCount >= 3 && (
            <span className="text-xs text-muted-foreground/60">Max retries reached</span>
          )}
          {editing && (
            <div className="flex items-center gap-2">
              <Select value={nextModel || undefined} onValueChange={(v) => setNextModel(v)}>
                <SelectTrigger className="w-56 bg-card/40 text-foreground border-border">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <div onPointerDown={(e) => e.preventDefault()}>
                    <ModelSearch value={modelSearch} onChange={setModelSearch} placeholder="Search models..." />
                  </div>
                  {options.filter((opt) => opt.label.toLowerCase().includes(modelSearch.toLowerCase()) || opt.id.toLowerCase().includes(modelSearch.toLowerCase())).map((opt) => (
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
                className="bg-card/40 text-foreground border-border"
              >
                Apply
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={!content}
            onClick={() => {
              navigator.clipboard.writeText(content);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-2 text-muted-foreground hover:text-foreground"
            aria-label="Copy to clipboard"
          >
            {copied ? "Copied!" : "📋"}
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 h-full w-full pr-4">
        <div className="text-sm leading-relaxed">
          {disabled ? (
            <div className="text-muted-foreground/60 italic py-2">⏳ Waiting for workers…</div>
          ) : content ? (
            <MarkdownRenderer content={content} />
          ) : running ? (
            <div className="space-y-2 py-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <span className="text-muted-foreground/40 italic">No output yet.</span>
          )}
          {done && elapsedMs !== null && (
            <div className="text-muted-foreground/60 text-xs mt-2">
              Completed in {(elapsedMs / 1000).toFixed(1)}s
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}