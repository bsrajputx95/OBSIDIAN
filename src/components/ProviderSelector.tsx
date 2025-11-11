"use client";
import { useModelConfig } from "@/lib/store/models";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ProviderSelector() {
  const { provider, setProvider, apiKey, setApiKey, fetchModels, options, setAllTo } = useModelConfig();
  const [chosenModel, setChosenModel] = useState<string>("");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Provider</label>
          <Select value={provider ?? undefined} onValueChange={(v) => setProvider(v as any)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openrouter">OpenRouter</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="gemini">Gemini</SelectItem>
              <SelectItem value="xai">xAI</SelectItem>
              <SelectItem value="mistral">Mistral</SelectItem>
              <SelectItem value="groq">Groq</SelectItem>
              <SelectItem value="cohere">Cohere</SelectItem>
              <SelectItem value="together">Together</SelectItem>
              <SelectItem value="bedrock">AWS Bedrock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-1">
          <label className="text-sm text-muted-foreground">API Key</label>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter API key"
            className="bg-black/50 text-white border border-white/30"
          />
        </div>

        <div className="md:col-span-1">
          <Button onClick={() => fetchModels()} disabled={!provider || !apiKey} className="w-full bg-black/40 text-white border border-white/30">
            Fetch Models
          </Button>
        </div>
      </div>
      {provider === "openrouter" && (
        <p className="text-xs text-slate-300">OpenRouter models are pre-listed; defaults applied per stage until changed.</p>
      )}

      {/* Fetched models listing with global selection */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Fetched Models</label>
        <Select value={chosenModel || undefined} onValueChange={(v) => setChosenModel(v)} disabled={options.length === 0}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={options.length ? "Choose a model to apply" : "Fetch models first"} />
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
          onClick={() => chosenModel && setAllTo(chosenModel)}
          disabled={!chosenModel}
          className="bg-black/40 text-white border border-white/30"
        >
          Set All Slots
        </Button>
      </div>
    </div>
  );
}