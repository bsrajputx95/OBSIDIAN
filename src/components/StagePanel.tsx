"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamingPane } from "@/components/StreamingPane";
import { ProviderSelector } from "@/components/ProviderSelector";
import { StageActions } from "@/components/StageActions";
import { Button } from "@/components/ui/button";
import { useStage, type Stage } from "@/lib/store/stage";
import { WORKER_ROLE_MAP } from "@/lib/worker-roles";
import { type ModelSlotKey } from "@/lib/store/models";
import { useEffect, useState, useRef, useCallback } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function StagePanel() {
  const { current, setStage, sessionId, newSession, prompt, setPrompt, enabled, setStageEnabled, stageOutputs, setStageOutput, clearStageOutputs, setCurrentStageStatus, advanceToNextStage, currentStageStatus, clearConversation } = useStage();
  const [startTrigger, setStartTrigger] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [masterTrigger, setMasterTrigger] = useState(0);
  const workerCompletedCount = useRef(0);
  const workerOutputsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!sessionId) newSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWorkerComplete = useCallback((worker: string, content: string) => {
    workerOutputsRef.current[worker] = content;
    setStageOutput(current, worker as "worker1" | "worker2" | "worker3" | "master", content);
    workerCompletedCount.current++;
    if (workerCompletedCount.current >= 3) {
      setCurrentStageStatus(current, "master_streaming");
      setMasterTrigger(prev => prev + 1);
    }
  }, [current, setStageOutput, setCurrentStageStatus]);

  const handleMasterComplete = useCallback((_worker: string, content: string) => {
    setStageOutput(current, "master", content);
    setCurrentStageStatus(current, "complete");
    setIsProcessing(false);
  }, [current, setStageOutput, setCurrentStageStatus]);

  const handleStartProcessing = () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt before starting processing.");
      return;
    }
    if (!enabled[current]) {
      alert("Please enable the current stage before starting processing.");
      return;
    }
    setIsProcessing(true);
    workerCompletedCount.current = 0;
    workerOutputsRef.current = {};
    setCurrentStageStatus(current, "workers_streaming");
    setStartTrigger((prev) => prev + 1);
  };

  const getExtraBody = useCallback((isMaster: boolean) => {
    const extra: Record<string, unknown> = {};
    if (isMaster) {
      extra.workerOutputs = Object.values(workerOutputsRef.current);
    }
    if (current !== "research") {
      const prevStage = current === "reasoning" ? "research" : current === "coding" ? "reasoning" : "coding";
      const prevMasterOutput = stageOutputs[prevStage]?.master;
      if (prevMasterOutput) {
        extra.previousStageContext = prevMasterOutput;
      }
    }
    return extra;
  }, [current, stageOutputs]);

  const renderStage = (stage: "research" | "reasoning" | "coding" | "final") => {
    const isMasterDisabled = currentStageStatus[stage] !== "master_streaming" && currentStageStatus[stage] !== "complete";
    const stageStatus = currentStageStatus[stage];
    const extraBody = getExtraBody(false);

    return (
      <div className="space-y-6 pb-24">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 w-full">
          <ErrorBoundary><StreamingPane
            slotKey={`${stage}.worker1` as ModelSlotKey}
            stage={stage}
            worker="worker1"
            sessionId={sessionId}
            prompt={prompt}
            enabled={enabled[stage]}
            startTrigger={startTrigger}
            onContentComplete={handleWorkerComplete}
            extraBody={extraBody}
            roleLabel={WORKER_ROLE_MAP[`${stage}.worker1`]}
          /></ErrorBoundary>
          <ErrorBoundary><StreamingPane
            slotKey={`${stage}.worker2` as ModelSlotKey}
            stage={stage}
            worker="worker2"
            sessionId={sessionId}
            prompt={prompt}
            enabled={enabled[stage]}
            startTrigger={startTrigger}
            onContentComplete={handleWorkerComplete}
            extraBody={extraBody}
            roleLabel={WORKER_ROLE_MAP[`${stage}.worker2`]}
          /></ErrorBoundary>
          <ErrorBoundary><StreamingPane
            slotKey={`${stage}.worker3` as ModelSlotKey}
            stage={stage}
            worker="worker3"
            sessionId={sessionId}
            prompt={prompt}
            enabled={enabled[stage]}
            startTrigger={startTrigger}
            onContentComplete={handleWorkerComplete}
            extraBody={extraBody}
            roleLabel={WORKER_ROLE_MAP[`${stage}.worker3`]}
          /></ErrorBoundary>
          <ErrorBoundary><StreamingPane
            slotKey={`${stage}.master` as ModelSlotKey}
            stage={stage}
            worker="master"
            sessionId={sessionId}
            prompt={prompt}
            enabled={enabled[stage]}
            startTrigger={masterTrigger}
            disabled={isMasterDisabled}
            onContentComplete={handleMasterComplete}
            extraBody={getExtraBody(true)}
            roleLabel={WORKER_ROLE_MAP[`${stage}.master`]}
          /></ErrorBoundary>
        </section>
        <StageActions
          stage={stage}
          isComplete={stageStatus === "complete"}
          isFinalStage={stage === "final"}
          onReanalyze={() => {
            clearStageOutputs(stage);
            workerCompletedCount.current = 0;
            workerOutputsRef.current = {};
            setCurrentStageStatus(stage, "idle");
            setIsProcessing(true);
            workerCompletedCount.current = 0;
            workerOutputsRef.current = {};
            setCurrentStageStatus(current, "workers_streaming");
            setStartTrigger(prev => prev + 1);
          }}
          onChatMore={(followUp) => {
            setPrompt(prompt + "\n\nFollow-up: " + followUp);
            setIsProcessing(true);
            workerCompletedCount.current = 0;
            workerOutputsRef.current = {};
            setCurrentStageStatus(current, "workers_streaming");
            setStartTrigger(prev => prev + 1);
          }}
          onSendToNext={advanceToNextStage}
        />
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-32 w-full">
      <div className="glass-panel gradient-border rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold tracking-tight text-white">Configuration</h2>
              <p className="text-xs text-on-surface-variant/50 mt-0.5">Select provider, models, and active stages</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {(["research","reasoning","coding","final"] as const).map((s) => (
              <label key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-xs font-bold uppercase tracking-wider ${
                enabled[s] 
                  ? "border-primary/25 bg-primary/8 text-primary" 
                  : "border-white/5 bg-white/[0.02] text-on-surface-variant/40 hover:border-white/10"
              }`}>
                <input
                  type="checkbox"
                  checked={enabled[s]}
                  onChange={(e) => setStageEnabled(s, e.target.checked)}
                  className="sr-only"
                  aria-label={`Enable ${s} stage`}
                />
                <span className={`w-1.5 h-1.5 rounded-full ${enabled[s] ? "bg-primary" : "bg-white/20"}`} />
                {s}
              </label>
            ))}
          </div>
        </div>
        <ProviderSelector />
      </div>

      <Tabs value={current} onValueChange={(v) => setStage(v as Stage)} className="w-full">
        <TabsList className="mb-8 flex flex-wrap bg-surface/60 backdrop-blur-xl border border-white/[0.06] rounded-xl p-1 h-auto gap-1">
          <TabsTrigger value="research" className="rounded-lg px-5 py-2.5 text-on-surface-variant/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 data-[state=active]:border font-bold uppercase tracking-widest text-[10px] transition-all hover:text-on-surface-variant">Research</TabsTrigger>
          <TabsTrigger value="reasoning" className="rounded-lg px-5 py-2.5 text-on-surface-variant/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 data-[state=active]:border font-bold uppercase tracking-widest text-[10px] transition-all hover:text-on-surface-variant">Reasoning</TabsTrigger>
          <TabsTrigger value="coding" className="rounded-lg px-5 py-2.5 text-on-surface-variant/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 data-[state=active]:border font-bold uppercase tracking-widest text-[10px] transition-all hover:text-on-surface-variant">Coding</TabsTrigger>
          <TabsTrigger value="final" className="rounded-lg px-5 py-2.5 text-on-surface-variant/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 data-[state=active]:border font-bold uppercase tracking-widest text-[10px] transition-all hover:text-on-surface-variant">Synthesis</TabsTrigger>
        </TabsList>
        <TabsContent value="research">{renderStage("research")}</TabsContent>
        <TabsContent value="reasoning">{renderStage("reasoning")}</TabsContent>
        <TabsContent value="coding">{renderStage("coding")}</TabsContent>
        <TabsContent value="final">{renderStage("final")}</TabsContent>
      </Tabs>
      
      {/* Premium Prompt Bar */}
      <footer className="fixed bottom-0 left-0 lg:left-72 right-0 z-50 flex flex-col items-center pb-6 pt-16 px-6 pointer-events-none bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-3xl w-full glass-panel gradient-border rounded-2xl p-1.5 shadow-[0_-8px_60px_rgba(0,0,0,0.4),0_0_40px_rgba(255,92,0,0.04)] flex items-center gap-3 px-5 pointer-events-auto">
          <div className="flex-1 w-full">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 text-white/90 text-sm py-3 h-12 resize-none placeholder:text-on-surface-variant/30 outline-none overflow-hidden font-body"
              placeholder="Enter your prompt... (e.g. Build me an e-commerce plan)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleStartProcessing();
                }
              }}
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button className="p-2 text-on-surface-variant/40 hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-white/[0.04]" onClick={clearConversation} title="Clear">
              <span className="material-symbols-outlined text-lg">delete_sweep</span>
            </button>
            <button
              disabled={isProcessing || !prompt.trim()}
              onClick={handleStartProcessing}
              className="bg-gradient-to-r from-primary to-primary/80 text-white px-5 py-2.5 rounded-xl font-headline font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:shadow-[0_0_20px_rgba(255,92,0,0.3)] transition-all active:scale-95 disabled:opacity-30 disabled:hover:shadow-none"
            >
              {isProcessing ? "Synthesizing..." : `Run ${current.charAt(0).toUpperCase() + current.slice(1)}`}
              <span className="material-symbols-outlined text-sm">play_arrow</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}