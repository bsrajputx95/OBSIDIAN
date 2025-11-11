import { create } from "zustand";

export type StageName = "research" | "reasoning" | "coding" | "final";

export type ModelSlotKey =
  | "research.worker1"
  | "research.worker2"
  | "research.worker3"
  | "research.master"
  | "reasoning.worker1"
  | "reasoning.worker2"
  | "reasoning.worker3"
  | "reasoning.master"
  | "coding.worker1"
  | "coding.worker2"
  | "coding.worker3"
  | "coding.master"
  | "final.worker1"
  | "final.worker2"
  | "final.worker3"
  | "final.master";

export type ProviderId =
  | "openrouter"
  | "openai"
  | "anthropic"
  | "gemini"
  | "xai"
  | "mistral"
  | "groq"
  | "cohere"
  | "together"
  | "bedrock";

export type ModelOption = {
  id: string;
  label: string;
  provider: ProviderId;
};

const OPENROUTER_OPTIONS: ModelOption[] = [
  { id: "alibaba/tongyi-deepresearch-30b-a3b", label: "alibaba/tongyi-deepresearch-30b-a3b", provider: "openrouter" },
  { id: "meituan/longcat-flash-chat", label: "meituan/longcat-flash-chat", provider: "openrouter" },
  { id: "nvidia/nemotron-nano-9b-v2", label: "nvidia/nemotron-nano-9b-v2", provider: "openrouter" },
  { id: "deepseek/deepseek-chat-v3.1", label: "deepseek/deepseek-chat-v3.1", provider: "openrouter" },
  { id: "openai/gpt-oss-20b", label: "openai/gpt-oss-20b", provider: "openrouter" },
  { id: "z-ai/glm-4.5-air", label: "z-ai/glm-4.5-air", provider: "openrouter" },
  { id: "qwen/qwen3-coder", label: "qwen/qwen3-coder", provider: "openrouter" },
  { id: "moonshotai/kimi-k2", label: "moonshotai/kimi-k2", provider: "openrouter" },
  { id: "cognitivecomputations/dolphin-mistral-24b-venice-edition", label: "cognitivecomputations/dolphin-mistral-24b-venice-edition", provider: "openrouter" },
  { id: "google/gemma-3n-e2b-it", label: "google/gemma-3n-e2b-it", provider: "openrouter" },
  { id: "tencent/hunyuan-a13b-instruct", label: "tencent/hunyuan-a13b-instruct", provider: "openrouter" },
  { id: "tngtech/deepseek-r1t2-chimera", label: "tngtech/deepseek-r1t2-chimera", provider: "openrouter" },
  { id: "mistralai/mistral-small-3.2-24b-instruct", label: "mistralai/mistral-small-3.2-24b-instruct", provider: "openrouter" },
  { id: "moonshotai/kimi-dev-72b", label: "moonshotai/kimi-dev-72b", provider: "openrouter" },
  { id: "deepseek/deepseek-r1-0528-qwen3-8b", label: "deepseek/deepseek-r1-0528-qwen3-8b", provider: "openrouter" },
  { id: "deepseek/deepseek-r1-0528", label: "deepseek/deepseek-r1-0528", provider: "openrouter" },
  { id: "mistralai/devstral-small-2505", label: "mistralai/devstral-small-2505", provider: "openrouter" },
  { id: "google/gemma-3n-e4b-it", label: "google/gemma-3n-e4b-it", provider: "openrouter" },
  { id: "meta-llama/llama-3.3-8b-instruct", label: "meta-llama/llama-3.3-8b-instruct", provider: "openrouter" },
  { id: "qwen/qwen3-4b", label: "qwen/qwen3-4b", provider: "openrouter" },
  { id: "qwen/qwen3-30b-a3b", label: "qwen/qwen3-30b-a3b", provider: "openrouter" },
  { id: "qwen/qwen3-8b", label: "qwen/qwen3-8b", provider: "openrouter" },
  { id: "qwen/qwen3-14b", label: "qwen/qwen3-14b", provider: "openrouter" },
  { id: "qwen/qwen3-235b-a22b", label: "qwen/qwen3-235b-a22b", provider: "openrouter" },
  { id: "tngtech/deepseek-r1t-chimera", label: "tngtech/deepseek-r1t-chimera", provider: "openrouter" },
  { id: "microsoft/mai-ds-r1", label: "microsoft/mai-ds-r1", provider: "openrouter" },
  { id: "shisa-ai/shisa-v2-llama3.3-70b", label: "shisa-ai/shisa-v2-llama3.3-70b", provider: "openrouter" },
  { id: "arliai/qwq-32b-arliai-rpr-v1", label: "arliai/qwq-32b-arliai-rpr-v1", provider: "openrouter" },
  { id: "agentica-org/deepcoder-14b-preview", label: "agentica-org/deepcoder-14b-preview", provider: "openrouter" },
  { id: "moonshotai/kimi-vl-a3b-thinking", label: "moonshotai/kimi-vl-a3b-thinking", provider: "openrouter" },
  { id: "meta-llama/llama-4-maverick", label: "meta-llama/llama-4-maverick", provider: "openrouter" },
  { id: "meta-llama/llama-4-scout", label: "meta-llama/llama-4-scout", provider: "openrouter" },
  { id: "qwen/qwen2.5-vl-32b-instruct", label: "qwen/qwen2.5-vl-32b-instruct", provider: "openrouter" },
  { id: "deepseek/deepseek-chat-v3-0324", label: "deepseek/deepseek-chat-v3-0324", provider: "openrouter" },
  { id: "mistralai/mistral-small-3.1-24b-instruct", label: "mistralai/mistral-small-3.1-24b-instruct", provider: "openrouter" },
  { id: "google/gemma-3-4b-it", label: "google/gemma-3-4b-it", provider: "openrouter" },
  { id: "google/gemma-3-12b-it", label: "google/gemma-3-12b-it", provider: "openrouter" },
  { id: "google/gemma-3-27b-it", label: "google/gemma-3-27b-it", provider: "openrouter" },
  { id: "nousresearch/deephermes-3-llama-3-8b-preview", label: "nousresearch/deephermes-3-llama-3-8b-preview", provider: "openrouter" },
  { id: "cognitivecomputations/dolphin3.0-r1-mistral-24b", label: "cognitivecomputations/dolphin3.0-r1-mistral-24b", provider: "openrouter" },
  { id: "cognitivecomputations/dolphin3.0-mistral-24b", label: "cognitivecomputations/dolphin3.0-mistral-24b", provider: "openrouter" },
  { id: "qwen/qwen2.5-vl-72b-instruct", label: "qwen/qwen2.5-vl-72b-instruct", provider: "openrouter" },
  { id: "mistralai/mistral-small-24b-instruct-2501", label: "mistralai/mistral-small-24b-instruct-2501", provider: "openrouter" },
  { id: "deepseek/deepseek-r1-distill-llama-70b", label: "deepseek/deepseek-r1-distill-llama-70b", provider: "openrouter" },
  { id: "deepseek/deepseek-r1", label: "deepseek/deepseek-r1", provider: "openrouter" },
  { id: "google/gemini-2.0-flash-exp", label: "google/gemini-2.0-flash-exp", provider: "openrouter" },
  { id: "meta-llama/llama-3.3-70b-instruct", label: "meta-llama/llama-3.3-70b-instruct", provider: "openrouter" },
  { id: "qwen/qwen-2.5-coder-32b-instruct", label: "qwen/qwen-2.5-coder-32b-instruct", provider: "openrouter" },
  { id: "meta-llama/llama-3.2-3b-instruct", label: "meta-llama/llama-3.2-3b-instruct", provider: "openrouter" },
  { id: "qwen/qwen-2.5-72b-instruct", label: "qwen/qwen-2.5-72b-instruct", provider: "openrouter" },
  { id: "mistralai/mistral-nemo", label: "mistralai/mistral-nemo", provider: "openrouter" },
  { id: "google/gemma-2-9b-it", label: "google/gemma-2-9b-it", provider: "openrouter" },
  { id: "mistralai/mistral-7b-instruct", label: "mistralai/mistral-7b-instruct", provider: "openrouter" },
];

const DEFAULT_MODELS: ModelOption[] = [
  { id: "openai/gpt-4o-mini", label: "OpenAI GPT-4o Mini", provider: "openai" },
  { id: "anthropic/claude-3-haiku", label: "Anthropic Claude 3 Haiku", provider: "anthropic" },
  { id: "google/gemini-1.5-flash", label: "Google Gemini 1.5 Flash", provider: "gemini" },
  { id: "xai/grok-2-mini", label: "xAI Grok 2 Mini", provider: "xai" },
  { id: "openrouter/auto", label: "OpenRouter Auto", provider: "openrouter" },
];

type ModelConfigState = {
  provider: ProviderId | null;
  apiKey: string;
  options: ModelOption[];
  slots: Record<ModelSlotKey, string>;
  setProvider: (p: ProviderId) => void;
  setApiKey: (k: string) => void;
  fetchModels: () => Promise<void>;
  setSlot: (key: ModelSlotKey, modelId: string) => void;
  setAllTo: (modelId: string) => void; // single-model mode
};

const initialSlots: Record<ModelSlotKey, string> = {
  "research.worker1": "",
  "research.worker2": "",
  "research.worker3": "",
  "research.master": "",
  "reasoning.worker1": "",
  "reasoning.worker2": "",
  "reasoning.worker3": "",
  "reasoning.master": "",
  "coding.worker1": "",
  "coding.worker2": "",
  "coding.worker3": "",
  "coding.master": "",
  "final.worker1": "",
  "final.worker2": "",
  "final.worker3": "",
  "final.master": "",
};

function applyOpenRouterDefaults(): Record<ModelSlotKey, string> {
  // Based on user's defaults per stage; master same across all
  const master = "meta-llama/llama-4-scout";
  const next: Record<ModelSlotKey, string> = { ...initialSlots };
  next["research.worker1"] = "alibaba/tongyi-deepresearch-30b-a3b";
  next["research.worker2"] = "google/gemma-3-27b-it";
  next["research.worker3"] = "meituan/longcat-flash-chat";
  next["research.master"] = master;

  next["reasoning.worker1"] = "deepseek/deepseek-r1-distill-llama-70b";
  next["reasoning.worker2"] = "deepseek/deepseek-r1";
  next["reasoning.worker3"] = "microsoft/mai-ds-r1";
  next["reasoning.master"] = master;

  next["coding.worker1"] = "qwen/qwen-2.5-coder-32b-instruct";
  next["coding.worker2"] = "qwen/qwen3-coder";
  next["coding.worker3"] = "agentica-org/deepcoder-14b-preview";
  next["coding.master"] = master;

  next["final.worker1"] = master;
  next["final.worker2"] = master;
  next["final.worker3"] = master;
  next["final.master"] = master;
  return next;
}

export const useModelConfig = create<ModelConfigState>((set, get) => ({
  provider: null,
  apiKey: "",
  options: [],
  slots: initialSlots,
  setProvider: (p) => set({ provider: p }),
  setApiKey: (k) => set({ apiKey: k }),
  fetchModels: async () => {
    const p = get().provider;
    const k = get().apiKey;
    if (!p) return;
    if (p === "openrouter") {
      set({ options: OPENROUTER_OPTIONS, slots: applyOpenRouterDefaults() });
      return;
    }
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: p, apiKey: k }),
      });
      if (!res.ok) {
        set({ options: [] });
        return;
      }
      const data = await res.json();
      const ids: string[] = Array.isArray(data?.models) ? data.models : [];
      const opts: ModelOption[] = ids.map((id) => ({ id, label: id, provider: p }));
      set({ options: opts });
    } catch {
      set({ options: [] });
    }
  },
  setSlot: (key, modelId) => set((s) => ({ slots: { ...s.slots, [key]: modelId } })),
  setAllTo: (modelId) =>
    set(() => {
      const next: Record<ModelSlotKey, string> = { ...initialSlots };
      (Object.keys(next) as ModelSlotKey[]).forEach((k) => (next[k] = modelId));
      return { slots: next };
    }),
}));