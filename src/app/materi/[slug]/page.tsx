import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Gamepad2, Sparkles } from "lucide-react";
import { getCategoryBySlug } from "@/lib/data";
import { VocabularyCard } from "@/components/vocabulary-card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryBySlug(slug);
  return { title: data?.category.title ?? "Materi Mufrodat" };
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCategoryBySlug(slug);
  if (!data) notFound();

  return (
    <section className="container page-section">
      <Link href="/materi" className="back-link"><ArrowLeft size={16} /> Semua materi</Link>
      <div className="detail-hero">
        <div className="detail-emoji">{data.category.emoji}</div>
        <div><div className="eyebrow">MATERI MUFRODAT</div><h1>{data.category.title}</h1><p>{data.category.description}</p><span className="detail-count">{data.vocabulary.length} kosakata untuk dipelajari</span></div>
      </div>
      <div className="section-heading compact-heading"><div><h2>Kenali kosakatanya</h2><p>Baca tulisan Arab, ingat artinya, lalu dengarkan pelafalannya.</p></div><span className="learning-tip"><Sparkles size={16} /> Ayo baca dengan suara lantang!</span></div>
      <div className="vocabulary-grid">
        {data.vocabulary.map((item) => <VocabularyCard item={item} key={item.id} />)}
      </div>
      <div className="practice-banner"><div><strong>Sudah hafal semuanya?</strong><p>Uji ingatanmu lewat permainan menjodohkan.</p></div><Link href="/permainan" className="button button-primary"><Gamepad2 size={17} /> Mulai permainan</Link></div>
    </section>
  );
}
