export function hasSupabasePublicConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function hasSupabaseServerConfig() {
  return Boolean(
    hasSupabasePublicConfig() && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
