"use client";
import { useStage } from "@/lib/store/stage";

type StepState = "complete" | "active" | "pending";

const STAGES = ["research", "reasoning", "coding", "final"] as const;

const STAGE_LABELS: Record<(typeof STAGES)[number], string> = {
  research: "Research",
  reasoning: "Reasoning",
  coding: "Coding",
  final: "Synthesis",
};

const STAGE_DESCRIPTIONS: Record<(typeof STAGES)[number], string> = {
  research: "Market & data analysis",
  reasoning: "Logic & architecture",
  coding: "Implementation",
  final: "Master consolidation",
};

const STAGE_ICONS: Record<(typeof STAGES)[number], string> = {
  research: "search",
  reasoning: "psychology",
  coding: "code",
  final: "task_alt",
};

export function PipelineProgress() {
  const { currentStageStatus } = useStage();

  const getStepState = (stage: (typeof STAGES)[number]): StepState => {
    const status = currentStageStatus[stage];
    if (status === "complete") return "complete";
    if (status === "workers_streaming" || status === "master_streaming") return "active";
    return "pending";
  };

  const steps = STAGES.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    description: STAGE_DESCRIPTIONS[stage],
    icon: STAGE_ICONS[stage],
    state: getStepState(stage),
  }));

  const completedCount = steps.filter(s => s.state === "complete").length;
  const isRunning = steps.some(s => s.state === "active");
  const activeLabel = steps.find(s => s.state === "active")?.label || (steps.every(s => s.state === "complete") ? "Complete" : "Idle");

  return (
    <section className="glass-panel gradient-border rounded-2xl p-6 md:p-8 relative overflow-visible">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
          </div>
          <div>
            <h2 className="font-headline text-lg font-bold tracking-tight text-white">Pipeline Orchestrator</h2>
            <p className="text-xs text-on-surface-variant/60 mt-0.5">{completedCount}/{STAGES.length} stages complete</p>
          </div>
        </div>
        {isRunning && (
          <div className="flex items-center gap-2.5 px-4 py-1.5 bg-primary/8 rounded-full border border-primary/15">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[11px] text-primary font-bold uppercase tracking-widest">{activeLabel}</span>
          </div>
        )}
      </div>
      
      {/* Stage Cards */}
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {steps.map((step, idx) => {
          const isComplete = step.state === "complete";
          const isActive = step.state === "active";

          return (
            <div key={step.stage} className="relative">
              {/* Connection Line */}
              {idx < steps.length - 1 && (
                <div className="absolute top-6 left-[calc(50%+24px)] right-[-16px] h-px z-0 hidden md:block">
                  <div className={`h-full transition-all duration-700 ${
                    isComplete ? "bg-gradient-to-r from-primary/60 to-primary/30" : "bg-white/[0.06]"
                  }`} />
                </div>
              )}
              
              <div className={`relative z-10 flex flex-col items-center text-center p-4 rounded-xl transition-all duration-500 cursor-default ${
                isActive 
                  ? "bg-primary/[0.06] border border-primary/20 shadow-[0_0_30px_rgba(255,92,0,0.08)]" 
                  : isComplete 
                    ? "bg-white/[0.02] border border-white/[0.06]" 
                    : "border border-transparent hover:bg-white/[0.02]"
              }`}>
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${
                  isActive 
                    ? "bg-primary/15 border border-primary/40 shadow-[0_0_20px_rgba(255,92,0,0.15)]" 
                    : isComplete 
                      ? "bg-primary/10 border border-primary/25" 
                      : "bg-white/[0.04] border border-white/[0.08]"
                }`}>
                  <span 
                    className={`material-symbols-outlined text-xl transition-colors ${
                      isActive || isComplete ? "text-primary" : "text-on-surface-variant/40"
                    }`}
                    style={{ fontVariationSettings: isComplete ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {isComplete ? "check_circle" : step.icon}
                  </span>
                </div>
                
                {/* Label */}
                <span className={`text-xs font-bold uppercase tracking-widest mb-1 transition-colors ${
                  isActive || isComplete ? "text-primary" : "text-on-surface-variant/50"
                }`}>
                  {step.label}
                </span>
                <span className="text-[10px] text-on-surface-variant/30 hidden sm:block">
                  {step.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}