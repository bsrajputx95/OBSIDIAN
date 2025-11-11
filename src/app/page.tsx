import { StagePanel } from "@/components/StagePanel";

export default function Home() {
  return (
    <div className="min-h-screen p-6 sm:p-10">
      <header className="mb-8 flex items-center justify-between rounded-xl bg-black/40 backdrop-blur-md border border-white/20 px-4 py-3 shadow-lg shadow-blue-500/10">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Viber AI – Multi-Model Orchestration</h1>
          <p className="text-sm text-slate-200">Research → Reasoning → Coding → Final with 4 concurrent streams per stage.</p>
        </div>
        <a href="/auth" className="text-sm underline text-slate-200">Login / Register</a>
      </header>
      <StagePanel />
    </div>
  );
}