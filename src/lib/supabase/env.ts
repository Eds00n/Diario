const PLACEHOLDER_HOSTS = ["example.supabase.co", "your-project.supabase.co"];
const PLACEHOLDER_KEYS = [
  "preview-anon-key",
  "your-anon-key",
  "preview-service-role-key",
  "your-service-role-key",
];

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

export function getSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || undefined;
}

/** Credenciais reais (não placeholders do .env.example). */
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  if (!url || !anon) return false;
  try {
    const host = new URL(url).hostname;
    if (PLACEHOLDER_HOSTS.some((h) => host === h)) return false;
  } catch {
    return false;
  }
  if (PLACEHOLDER_KEYS.includes(anon)) return false;
  return true;
}

export function supabaseProjectHost(): string | null {
  const url = getSupabaseUrl();
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
