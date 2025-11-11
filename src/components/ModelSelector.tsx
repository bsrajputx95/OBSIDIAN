"use client";
import { useModelConfig, type ModelSlotKey } from "@/lib/store/models";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ModelSelector({ slot }: { slot: ModelSlotKey }) {
  const { options, slots, setSlot } = useModelConfig();
  return (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground">Model</label>
      <Select value={slots[slot]} onValueChange={(v) => setSlot(slot, v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}