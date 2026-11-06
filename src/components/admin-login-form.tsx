"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, Mail, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(searchParams.get("error") === "unauthorized" ? "Akun ini belum terdaftar sebagai admin." : "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal. Periksa email dan password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={handleSubmit}>
      <label htmlFor="admin-email">Email admin</label>
      <div className="input-with-icon"><Mail size={17} /><input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" autoComplete="username" required /></div>
      <label htmlFor="admin-password">Password</label>
      <div className="input-with-icon"><LockKeyhole size={17} /><input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" autoComplete="current-password" required /></div>
      {error && <p className="form-error">{error}</p>}
      <button className="button button-primary button-wide" type="submit" disabled={loading}>{loading ? "Memeriksa akun..." : <><Sparkles size={17} /> Masuk ke dashboard</>}</button>
    </form>
  );
}
