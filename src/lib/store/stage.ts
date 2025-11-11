import { create } from "zustand";

export type Stage = "research" | "reasoning" | "coding" | "final";

type StageState = {
  current: Stage;
  setStage: (s: Stage) => void;
  sessionId: string;
  newSession: () => void;
  prompt: string;
  setPrompt: (p: string) => void;
  enabled: Record<Stage, boolean>;
  setStageEnabled: (s: Stage, v: boolean) => void;
};

const makeSessionId = () => Math.random().toString(36).slice(2);

export const useStage = create<StageState>((set) => ({
  current: "research",
  // Avoid SSR/client mismatch by initializing empty and generating on mount.
  sessionId: "",
  setStage: (s) => set({ current: s }),
  newSession: () => set({ sessionId: makeSessionId() }),
  prompt: "",
  setPrompt: (p) => set({ prompt: p }),
  enabled: { research: true, reasoning: true, coding: true, final: true },
  setStageEnabled: (s, v) => set((state) => ({ enabled: { ...state.enabled, [s]: v } })),
}));