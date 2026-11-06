import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getActivityBySlug } from "@/lib/data";
import { hasSupabaseServerConfig } from "@/lib/config";
import { MatchingGame } from "@/components/matching-game";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  return { title: activity?.title ?? "Permainan Mufrodat" };
}

export default async function MatchingGamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  if (!activity) notFound();

  return (
    <section className="container page-section game-page">
      <Link href="/permainan" className="back-link"><ArrowLeft size={16} /> Kembali ke permainan</Link>
      {!hasSupabaseServerConfig() && <div className="demo-notice">Mode demo aktif. Hasil permainan tersimpan di browser ini. Hubungkan Supabase untuk penyimpanan terpusat.</div>}
      <MatchingGame activity={activity} persistent={hasSupabaseServerConfig()} />
    </section>
  );
}
