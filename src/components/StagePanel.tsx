"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamingPane } from "@/components/StreamingPane";
import { ProviderSelector } from "@/components/ProviderSelector";
import { Button } from "@/components/ui/button";
import { useStage } from "@/lib/store/stage";
import { useEffect, useState, useRef } from "react";

export function StagePanel() {
  const { current, setStage, sessionId, newSession, prompt, setPrompt, enabled, setStageEnabled } = useStage();
  const [mounted, setMounted] = useState(false);
  const [startTrigger, setStartTrigger] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate session id only on client to avoid hydration mismatch.
    if (!sessionId) newSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartProcessing = () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt before starting processing.");
      return;
    }
    setIsProcessing(true);
    setStartTrigger(prev => prev + 1);
    // Reset processing state after a delay to allow for new starts
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const renderStage = (stage: "research" | "reasoning" | "coding" | "final") => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <StreamingPane slotKey={`${stage}.worker1` as any} stage={stage} worker="worker1" sessionId={sessionId} prompt={prompt} enabled={enabled[stage]} startTrigger={startTrigger} />
      </div>
      <div className="space-y-3">
        <StreamingPane slotKey={`${stage}.worker2` as any} stage={stage} worker="worker2" sessionId={sessionId} prompt={prompt} enabled={enabled[stage]} startTrigger={startTrigger} />
      </div>
      <div className="space-y-3">
        <StreamingPane slotKey={`${stage}.worker3` as any} stage={stage} worker="worker3" sessionId={sessionId} prompt={prompt} enabled={enabled[stage]} startTrigger={startTrigger} />
      </div>
      <div className="space-y-3">
        <StreamingPane slotKey={`${stage}.master` as any} stage={stage} worker="master" sessionId={sessionId} prompt={prompt} enabled={enabled[stage]} startTrigger={startTrigger} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Prompt input area between header and tabs */}
      <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/20 p-4 shadow-lg shadow-blue-500/10">
        <label className="block text-sm font-medium text-slate-200 mb-2">Prompt</label>
        <textarea
          className="w-full h-24 resize-y rounded-md bg-black/50 text-white border border-white/30 px-3 py-2 placeholder:text-slate-400"
          placeholder="Describe what you want the agents to research, reason about, code, and finalize..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-slate-300">Your prompt is shared across all stage workers when you press Start.</p>
          <Button 
            onClick={handleStartProcessing}
            disabled={isProcessing || !prompt.trim()}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-6 py-2"
          >
            {isProcessing ? "Starting..." : "Start Processing"}
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["research","reasoning","coding","final"] as const).map((s) => (
            <label key={s} className="flex items-center gap-2 text-slate-200">
              <input
                type="checkbox"
                checked={enabled[s]}
                onChange={(e) => setStageEnabled(s, e.target.checked)}
                className="h-4 w-4 accent-purple-500"
              />
              <span className="capitalize">{s}</span>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <ProviderSelector />
        </div>
      </div>
      <Tabs value={current} onValueChange={(v) => setStage(v as any)}>
        <TabsList className="flex flex-wrap bg-black/40 backdrop-blur-md border border-white/20">
          <TabsTrigger value="research" className="text-white/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/30 data-[state=active]:to-blue-500/30">Research</TabsTrigger>
          <TabsTrigger value="reasoning" className="text-white/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/30 data-[state=active]:to-blue-500/30">Reasoning</TabsTrigger>
          <TabsTrigger value="coding" className="text-white/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/30 data-[state=active]:to-blue-500/30">Coding</TabsTrigger>
          <TabsTrigger value="final" className="text-white/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/30 data-[state=active]:to-blue-500/30">Final</TabsTrigger>
        </TabsList>
        <TabsContent value="research">{renderStage("research")}</TabsContent>
        <TabsContent value="reasoning">{renderStage("reasoning")}</TabsContent>
        <TabsContent value="coding">{renderStage("coding")}</TabsContent>
        <TabsContent value="final">{renderStage("final")}</TabsContent>
      </Tabs>
    </div>
  );
}