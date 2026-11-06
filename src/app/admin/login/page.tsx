import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/admin-login-form";
import { hasSupabasePublicConfig } from "@/lib/config";

export const metadata = { title: "Login Guru" };

export default function AdminLoginPage() {
  return (
    <section className="container admin-auth-page">
      <div className="admin-auth-card">
        <div className="admin-auth-icon"><ShieldCheck size={30} /></div>
        <div className="eyebrow">AREA PENGELOLA</div>
        <h1>Selamat datang, Guru!</h1>
        <p>Masuk untuk mengelola materi dan melihat aktivitas belajar siswa.</p>
        {hasSupabasePublicConfig() ? (
          <Suspense fallback={<div className="loading-note">Memuat formulir login...</div>}><AdminLoginForm /></Suspense>
        ) : (
          <div className="setup-warning"><strong>Supabase belum dikonfigurasi.</strong><p>Salin <code>.env.example</code> menjadi <code>.env.local</code>, isi URL dan publishable key Supabase, lalu jalankan ulang server.</p></div>
        )}
        <Link href="/" className="back-link auth-back"><ArrowLeft size={16} /> Kembali ke beranda</Link>
      </div>
    </section>
  );
}
