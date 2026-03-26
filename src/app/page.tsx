"use client";
import { useState } from "react";
import { StagePanel } from "@/components/StagePanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PipelineProgress } from "@/components/PipelineProgress";
import { ExportPanel } from "@/components/ExportPanel";
import { ConversationSidebar } from "@/components/ConversationSidebar";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/[0.04] blur-[100px] animate-pulse" style={{ animationDuration: "12s" }} />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-primary/[0.02] blur-[80px] animate-pulse" style={{ animationDuration: "6s" }} />
      </div>

      {/* Top Navigation — Clean, minimal */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-background/60 backdrop-blur-2xl border-b border-white/[0.04] px-6 lg:px-12 py-3">
        <div className="flex items-center gap-3">
          <span 
            className="material-symbols-outlined text-primary text-xl cursor-pointer hover:bg-surface-container-high transition-all duration-300 p-2 rounded-lg lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            menu
          </span>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>memory</span>
            </div>
            <div className="hidden lg:flex flex-col">
              <h1 className="font-headline font-black tracking-[-0.04em] text-white text-base leading-tight">
                OBSIDIAN
              </h1>
              <span className="text-[9px] uppercase tracking-[0.25em] text-primary/60 font-bold">Neural Engine</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-surface-container-highest hover:border-primary/30 transition-colors cursor-pointer">
             <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
          </div>
        </div>
      </header>

      <ConversationSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <main id="main-content" className="pt-20 pb-48 px-6 md:px-12 lg:ml-72 max-w-7xl mx-auto min-h-screen relative z-10 w-full block">
        {/* Hero Section */}
        <div className="flex flex-col items-start mb-12 mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gradient-to-r from-primary to-transparent" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary/80 font-bold font-label">Multi-Agent Orchestration</span>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-[-0.03em] text-white mb-3 leading-[1.1]">
            Neural Synthesis<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary/60">Pipeline</span>
          </h1>
          <p className="max-w-lg text-on-surface-variant/50 text-sm font-body leading-relaxed">
            Deploy multi-model inference across four specialized stages. Each stage runs parallel workers synthesized by a master consolidator.
          </p>
        </div>

        <div className="space-y-10 w-full block">
          <PipelineProgress />
          <StagePanel />
          <ExportPanel />
        </div>
      </main>
    </>
  );
}