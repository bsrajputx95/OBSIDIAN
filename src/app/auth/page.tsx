import { AuthForm } from "@/components/AuthForm";

export default function AuthPage() {
  return (
    <div className="min-h-screen p-6 sm:p-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="text-sm text-muted-foreground">Login, Register, or try Guest access.</p>
      </header>
      <AuthForm />
    </div>
  );
}