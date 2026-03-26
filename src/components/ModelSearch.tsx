"use client";
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function ModelSearch({ value, onChange, placeholder = "Search models..." }: Props) {
  return (
    <div className="sticky top-0 z-10 bg-popover p-2 border-b border-border">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => e.stopPropagation()}
        className="h-8 text-sm"
      />
    </div>
  );
}