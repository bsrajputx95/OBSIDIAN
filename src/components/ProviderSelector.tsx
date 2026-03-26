"use client";
import { useModelConfig, type ProviderId } from "@/lib/store/models";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ModelSearch } from "@/components/ModelSearch";

export function ProviderSelector() {
  const { provider, setProvider, apiKey, setApiKey, fetchModels, options, setAllTo } = useModelConfig();
  const [chosenModel, setChosenModel] = useState<string>("");
  const [modelSearch, setModelSearch] = useState<string>("");

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(modelSearch.toLowerCase()) ||
      opt.id.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const groups = filteredOptions.reduce<Record<string, typeof filteredOptions>>((acc, opt) => {
    const prefix = opt.id.includes("/") ? opt.id.split("/")[0] : "Other";
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(opt);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Provider</label>
          <Select value={provider ?? undefined} onValueChange={(v) => setProvider(v as ProviderId)}>
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
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-1">
          <label className="text-sm text-muted-foreground">API Key</label>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter API key"
            className="bg-surface-container-lowest text-on-surface border border-outline-variant/30 focus:border-secondary transition-colors"
          />
        </div>

        <div className="md:col-span-1">
          <Button onClick={() => fetchModels()} disabled={!provider || !apiKey} className="w-full bg-surface-container-high text-on-surface border border-outline-variant/30 hover:bg-surface-container-highest transition-colors">
            Fetch Models
          </Button>
        </div>
      </div>
      {provider === "openrouter" && (
        <p className="text-xs text-muted-foreground">OpenRouter models are pre-listed; defaults applied per stage until changed.</p>
      )}

      {/* Fetched models listing with global selection */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Fetched Models</label>
        <Select value={chosenModel || undefined} onValueChange={(v) => setChosenModel(v)} disabled={options.length === 0}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={options.length ? "Choose a model to apply" : "Fetch models first"} />
          </SelectTrigger>
          <SelectContent>
            <div onPointerDown={(e) => e.preventDefault()}>
              <ModelSearch value={modelSearch} onChange={setModelSearch} placeholder="Search models..." />
            </div>
            {Object.entries(groups).map(([prefix, items]) => (
              <SelectGroup key={prefix}>
                <SelectLabel>{prefix}</SelectLabel>
                {items.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => chosenModel && setAllTo(chosenModel)}
          disabled={!chosenModel}
          className="bg-surface-container-high text-on-surface border border-outline-variant/30 hover:bg-surface-container-highest transition-colors"
        >
          Set All Slots
        </Button>
      </div>
    </div>
  );
}