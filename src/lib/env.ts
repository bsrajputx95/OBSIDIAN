export function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL;
}

export function validateEnv(): void {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "[Obsidian] DATABASE_URL is not set. Database features are disabled. " +
      "Set DATABASE_URL in your environment to enable persistence and authentication."
    );
  }
  if (!process.env.NEXTAUTH_SECRET) {
    console.warn(
      "[Obsidian] NEXTAUTH_SECRET is not set. Set it in your environment for production use. " +
      "Use: openssl rand -base64 32"
    );
  }
}

validateEnv();
