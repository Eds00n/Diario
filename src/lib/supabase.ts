/**
 * Cliente Supabase no browser (admin: login, upload, CRUD).
 * No servidor, prefira `@/lib/supabase/server`.
 */
export { createClient } from "@/lib/supabase/client";
export {
  getSupabaseUrl,
  getSupabaseAnonKey,
  isSupabaseConfigured,
  supabaseProjectHost,
} from "@/lib/supabase/env";
