import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getAdminUser } from "@/lib/supabase/server";

export async function getTimelineContext() {
  if (!isSupabaseConfigured()) {
    return { isAdmin: false };
  }
  const user = await getAdminUser();
  return { isAdmin: !!user };
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}
