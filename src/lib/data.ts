import type { Entry, SpecialDate } from "@/lib/types";
import { demoEntries, demoSpecialDates } from "@/lib/demo-data";
import { loadMemoriasFromJson, loadSpecialDatesFromJson } from "@/lib/local-memorias";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super("Supabase não configurado");
    this.name = "SupabaseNotConfiguredError";
  }
}

async function getPublicClient() {
  if (!isSupabaseConfigured()) {
    throw new SupabaseNotConfiguredError();
  }
  return createClient();
}

export async function fetchEntries(): Promise<Entry[]> {
  const supabase = await getPublicClient();
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .order("data", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Entry[];
}

export async function fetchEntry(id: string): Promise<Entry | null> {
  const supabase = await getPublicClient();
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Entry | null;
}

export async function fetchSpecialDates(): Promise<SpecialDate[]> {
  const supabase = await getPublicClient();
  const { data, error } = await supabase
    .from("special_dates")
    .select("*")
    .order("data", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SpecialDate[];
}

function resolveLocalSpecialDates(): SpecialDate[] {
  const fromFile = loadSpecialDatesFromJson();
  return fromFile.length > 0 ? fromFile : demoSpecialDates;
}
export async function loadTimelineData(): Promise<{
  entries: Entry[];
  specialDates: SpecialDate[];
  isDemo: boolean;
  source?: "supabase" | "local-json" | "demo";
}> {
  const localEntries = loadMemoriasFromJson();
  if (localEntries.length > 0 && !isSupabaseConfigured()) {
    localEntries.sort((a, b) => a.data.localeCompare(b.data));
    return {
      entries: localEntries,
      specialDates: resolveLocalSpecialDates(),
      isDemo: false,
      source: "local-json",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      entries: demoEntries,
      specialDates: resolveLocalSpecialDates(),
      isDemo: true,
      source: "demo",
    };
  }

  try {
    const [entries, specialDates] = await Promise.all([
      fetchEntries(),
      fetchSpecialDates(),
    ]);
    return { entries, specialDates, isDemo: false, source: "supabase" };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Nosso Diário] Supabase indisponível, usando mock:", err);
      if (localEntries.length > 0) {
        localEntries.sort((a, b) => a.data.localeCompare(b.data));
        return {
          entries: localEntries,
          specialDates: resolveLocalSpecialDates(),
          isDemo: false,
          source: "local-json",
        };
      }
      return {
        entries: demoEntries,
        specialDates: resolveLocalSpecialDates(),
        isDemo: true,
        source: "demo",
      };
    }
    throw err;
  }
}
