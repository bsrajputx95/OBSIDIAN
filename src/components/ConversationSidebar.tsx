"use client";
import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStage } from "@/lib/store/stage";
import { useAuth } from "@/lib/store/auth";

type ConversationType = {
  id: string;
  title: string;
  prompt: string;
  createdAt: string;
  stageOutputs: Record<string, { master: string }>;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function SidebarContent({
  conversations,
  search,
  setSearch,
  loading,
  error,
  onDelete,
  onSelect,
  onNew,
}: {
  conversations: ConversationType[];
  search: string;
  setSearch: (v: string) => void;
  loading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
  onSelect: (conv: ConversationType) => void;
  onNew: () => void;
}) {
  const { user } = useAuth();
  const { stageOrder } = useStage();

  const filtered = conversations.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.prompt?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">History</h2>
          <Button size="sm" onClick={onNew} className="bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 text-xs">
            + New
          </Button>
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="h-8 text-sm bg-card/60 border-border"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading && <div className="text-xs text-on-surface-variant p-2">Loading history...</div>}
        {error && <div className="text-[10px] text-secondary/80 bg-secondary/10 px-3 py-1.5 rounded-md border border-secondary/20 m-2 flex items-center gap-2 tracking-wide uppercase"><span className="material-symbols-outlined text-sm">cloud_off</span> {error === "No database configured" ? "Local Mode (No DB)" : error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-xs text-muted-foreground p-2">No conversations found.</div>
        )}
        {filtered.map((conv) => (
          <div
            key={conv.id}
            className="group flex flex-col gap-1 p-2 rounded-md hover:bg-card/60 cursor-pointer mb-1"
            onClick={() => onSelect(conv)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground truncate flex-1">{conv.title || "Untitled"}</span>
              <button
                className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Delete this conversation?")) {
                    onDelete(conv.id);
                  }
                }}
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{timeAgo(conv.createdAt)}</span>
              <div className="flex gap-0.5 ml-auto">
                {stageOrder.map((s) => (
                  <div
                    key={s}
                    className={`w-1.5 h-1.5 rounded-full ${conv.stageOutputs?.[s]?.master ? "bg-green-500" : "bg-slate-600"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-outline-variant/30 text-xs text-on-surface-variant flex items-center gap-2">
        <span className="material-symbols-outlined text-base">person</span>
        {user ? (
          <span className="font-bold tracking-wide">{user.email || user.username || "User"}</span>
        ) : (
          <span className="font-bold tracking-wide">Analyst (Guest)</span>
        )}
      </div>
    </div>
  );
}

export function ConversationSidebar({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const { setPrompt, setStageOutput, setCurrentStageStatus, stageOrder, clearConversation } = useStage();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("/api/conversations")
      .then((res) => {
        if (!res.ok) throw new Error("No database configured");
        return res.json();
      })
      .then((data) => {
        setConversations(data.conversations || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load conversations");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSelect = async (conv: ConversationType) => {
    const res = await fetch(`/api/conversations/${conv.id}`);
    if (!res.ok) return;
    const data = await res.json();
    setPrompt(data.prompt || "");
    if (data.stageOutputs) {
      for (const [stage, workers] of Object.entries(data.stageOutputs)) {
        for (const [worker, content] of Object.entries(workers as Record<string, string>)) {
          setStageOutput(stage as "research" | "reasoning" | "coding" | "final", worker as "worker1" | "worker2" | "worker3" | "master", content);
        }
      }
    }
    for (const stage of stageOrder) {
      const output = data.stageOutputs?.[stage]?.master;
      if (output) {
        setCurrentStageStatus(stage, "complete");
      }
    }
    if (!isDesktop) onOpenChange?.(false);
  };

  const handleNew = () => {
    clearConversation();
    if (!isDesktop) onOpenChange?.(false);
  };

  if (isDesktop) {
    return (
      <div className="fixed left-0 top-0 bottom-0 z-40 w-72 bg-surface-container-low/95 backdrop-blur-2xl border-r border-outline-variant/20 pt-20 h-full hidden xl:flex flex-col">
        <SidebarContent
          conversations={conversations}
          search={search}
          setSearch={setSearch}
          loading={loading}
          error={error}
          onDelete={handleDelete}
          onSelect={handleSelect}
          onNew={handleNew}
        />
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] p-0">
        <SidebarContent
          conversations={conversations}
          search={search}
          setSearch={setSearch}
          loading={loading}
          error={error}
          onDelete={handleDelete}
          onSelect={handleSelect}
          onNew={handleNew}
        />
      </SheetContent>
    </Sheet>
  );
}