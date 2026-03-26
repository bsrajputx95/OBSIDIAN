import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Stage = "research" | "reasoning" | "coding" | "final";
export type Worker = "worker1" | "worker2" | "worker3" | "master";

type WorkerOutputs = {
  worker1: string;
  worker2: string;
  worker3: string;
  master: string;
};

type StageStatus = "idle" | "workers_streaming" | "master_streaming" | "complete";

type StageState = {
  current: Stage;
  setStage: (s: Stage) => void;
  sessionId: string;
  newSession: () => void;
  prompt: string;
  setPrompt: (p: string) => void;
  enabled: Record<Stage, boolean>;
  setStageEnabled: (s: Stage, v: boolean) => void;
  stageOrder: readonly [Stage, Stage, Stage, Stage];
  stageOutputs: Record<Stage, WorkerOutputs>;
  setStageOutput: (stage: Stage, worker: keyof WorkerOutputs, content: string) => void;
  clearStageOutputs: (stage: Stage) => void;
  clearConversation: () => void;
  currentStageStatus: Record<Stage, StageStatus>;
  setCurrentStageStatus: (stage: Stage, status: StageStatus) => void;
  advanceToNextStage: () => void;
  autoRun: boolean;
  toggleAutoRun: () => void;
  pipelineRunning: boolean;
  setPipelineRunning: (v: boolean) => void;
  abortControllers: AbortController[];
  registerAbortController: (ac: AbortController) => void;
  cancelPipeline: () => void;
};

const makeSessionId = () => Math.random().toString(36).slice(2);

const emptyWorkerOutputs = (): WorkerOutputs => ({
  worker1: "",
  worker2: "",
  worker3: "",
  master: "",
});

export const useStage = create<StageState>()(
  persist(
    (set, get) => ({
      current: "research",
      sessionId: "",
      setStage: (s) => set({ current: s }),
      newSession: () => set({ sessionId: makeSessionId() }),
      prompt: "",
      setPrompt: (p) => set({ prompt: p }),
      enabled: { research: true, reasoning: true, coding: true, final: true },
      setStageEnabled: (s, v) => set((state) => ({ enabled: { ...state.enabled, [s]: v } })),
      stageOrder: ["research", "reasoning", "coding", "final"] as const,
      stageOutputs: {
        research: emptyWorkerOutputs(),
        reasoning: emptyWorkerOutputs(),
        coding: emptyWorkerOutputs(),
        final: emptyWorkerOutputs(),
      },
      setStageOutput: (stage, worker, content) =>
        set((state) => ({
          stageOutputs: {
            ...state.stageOutputs,
            [stage]: { ...state.stageOutputs[stage], [worker]: content },
          },
        })),
      clearStageOutputs: (stage) =>
        set((state) => ({
          stageOutputs: {
            ...state.stageOutputs,
            [stage]: emptyWorkerOutputs(),
          },
        })),
      clearConversation: () =>
        set({
          prompt: "",
          stageOutputs: {
            research: emptyWorkerOutputs(),
            reasoning: emptyWorkerOutputs(),
            coding: emptyWorkerOutputs(),
            final: emptyWorkerOutputs(),
          },
          currentStageStatus: {
            research: "idle",
            reasoning: "idle",
            coding: "idle",
            final: "idle",
          },
          current: "research",
          sessionId: makeSessionId(),
        }),
      currentStageStatus: {
        research: "idle",
        reasoning: "idle",
        coding: "idle",
        final: "idle",
      },
      setCurrentStageStatus: (stage, status) =>
        set((state) => ({
          currentStageStatus: { ...state.currentStageStatus, [stage]: status },
        })),
      advanceToNextStage: () => {
        const { current, stageOrder } = get();
        const idx = stageOrder.indexOf(current);
        if (idx < stageOrder.length - 1) {
          set({ current: stageOrder[idx + 1] });
        }
      },
      autoRun: true,
      toggleAutoRun: () => set((state) => ({ autoRun: !state.autoRun })),
      pipelineRunning: false,
      setPipelineRunning: (v: boolean) => set({ pipelineRunning: v }),
      abortControllers: [],
      registerAbortController: (ac: AbortController) =>
        set((state) => ({ abortControllers: [...state.abortControllers, ac] })),
      cancelPipeline: () => {
        const { abortControllers } = get();
        abortControllers.forEach((ac) => ac.abort());
        set((state) => ({
          abortControllers: [],
          pipelineRunning: false,
          currentStageStatus: Object.fromEntries(
            Object.entries(state.currentStageStatus).map(([k, v]) => [
              k,
              v !== "complete" ? "idle" : v,
            ])
          ) as Record<Stage, StageStatus>,
        }));
      },
    }),
    {
      name: "obsidian-conversation",
      partialize: (state) => ({
        prompt: state.prompt,
        stageOutputs: state.stageOutputs,
        currentStageStatus: state.currentStageStatus,
        autoRun: state.autoRun,
      }),
    }
  )
);