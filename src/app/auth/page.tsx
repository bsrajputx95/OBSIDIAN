import { AuthForm } from "@/components/AuthForm";
import Link from "next/link";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 w-full max-w-md px-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            Obsidian
          </h1>
          <p className="text-muted-foreground">Multi-Model Orchestration Platform</p>
        </div>
        <AuthForm />
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to App
        </Link>
      </div>
    </div>
  );
}
