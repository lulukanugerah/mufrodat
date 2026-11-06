import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("user_id, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/admin/login?error=unauthorized");

  return { supabase, user, profile };
}
