"use client";
import { useState } from "react";
import { useStage } from "@/lib/store/stage";
import { Button } from "@/components/ui/button";

export function ExportPanel() {
  const { stageOutputs, currentStageStatus } = useStage();
  const [copied, setCopied] = useState(false);

  const hasAnyComplete = Object.values(currentStageStatus).some((s) => s === "complete");
  if (!hasAnyComplete) return null;

  const handleMarkdownExport = () => {
    const stages = ["research", "reasoning", "coding", "final"] as const;
    let md = "";
    for (const stage of stages) {
      md += `## ${stage.charAt(0).toUpperCase() + stage.slice(1)} Stage\n\n`;
      const workers = ["worker1", "worker2", "worker3", "master"] as const;
      for (const worker of workers) {
        const content = stageOutputs[stage][worker];
        md += `### ${worker.charAt(0).toUpperCase() + worker.slice(1)}\n\n${content || "_No output yet_"}\n\n`;
      }
      md += "\n";
    }
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "obsidian-output.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleJsonExport = () => {
    const json = JSON.stringify(stageOutputs, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "obsidian-output.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAllMasters = () => {
    const combined = [
      stageOutputs.research.master,
      stageOutputs.reasoning.master,
      stageOutputs.coding.master,
      stageOutputs.final.master,
    ]
      .filter(Boolean)
      .join("\n\n");
    navigator.clipboard.writeText(combined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-card/80 backdrop-blur-md border border-border">
      <Button variant="outline" onClick={handleMarkdownExport} className="bg-card/40 text-foreground border-border hover:bg-muted/50">
        ⬇ Export Markdown
      </Button>
      <Button variant="outline" onClick={handleJsonExport} className="bg-card/40 text-foreground border-border hover:bg-muted/50">
        ⬇ Export JSON
      </Button>
      <Button variant="outline" onClick={handleCopyAllMasters} className="bg-card/40 text-foreground border-border hover:bg-muted/50">
        {copied ? "✅ Copied!" : "📋 Copy All Masters"}
      </Button>
    </div>
  );
}