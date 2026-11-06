import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getCategories } from "@/lib/data";

export const metadata: Metadata = { title: "Materi Mufrodat" };

export default async function MaterialsPage() {
  const categories = await getCategories();
  return (
    <section className="container page-section">
      <div className="page-title-block"><div className="eyebrow"><BookOpen size={15} /> RUANG BELAJAR</div><h1>Yuk, kenali mufrodat!</h1><p>Pilih satu tema. Lihat gambar, baca kata Arab, dan dengarkan cara pengucapannya.</p></div>
      <div className="category-grid category-grid-large">
        {categories.map((category) => (
          <Link href={`/materi/${category.slug}`} className={`category-card tone-${category.color || "yellow"}`} key={category.id}>
            <div className="category-art"><span>{category.emoji}</span><i>✦</i></div>
            <div className="category-card-copy"><h2>{category.title}</h2><p>{category.description}</p><div className="category-meta"><span>{category.vocabulary_count ?? 0} kosakata</span><span className="round-arrow"><ArrowRight size={16} /></span></div></div>
          </Link>
        ))}
      </div>
    </section>
  );
}
