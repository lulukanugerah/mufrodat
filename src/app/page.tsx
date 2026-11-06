import Link from "next/link";
import { ArrowRight, BookOpen, Gamepad2, Headphones, Sparkles, Star } from "lucide-react";
import { getActivities, getCategories } from "@/lib/data";

export default async function HomePage() {
  const [categories, activities] = await Promise.all([getCategories(), getActivities()]);

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-kicker"><Sparkles size={16} /> BELAJAR BAHASA ARAB LEBIH MENYENANGKAN</div>
            <h1>Petualangan seru mengenal <span>mufrodat!</span></h1>
            <p>Kenali kosakata Bahasa Arab lewat gambar lucu, suara, dan permainan yang bikin kamu semangat belajar.</p>
            <div className="hero-actions">
              <Link href="/materi" className="button button-primary">Mulai belajar <ArrowRight size={18} /></Link>
              <Link href="/permainan" className="button button-white"><Gamepad2 size={18} /> Main permainan</Link>
            </div>
            <div className="hero-proof"><span><Star size={15} fill="currentColor" /> Mudah dipahami</span><span><Headphones size={15} /> Ada audio</span><span><Gamepad2 size={15} /> Belajar sambil bermain</span></div>
          </div>
          <div className="hero-illustration" aria-label="Ilustrasi buku dan perlengkapan belajar">
            <div className="hero-sun" />
            <div className="floating-note note-one">اَلْعَرَبِيَّةُ</div>
            <div className="floating-note note-two">⭐ Hebat!</div>
            <div className="hero-book"><span>م</span><strong>مُفْرَدَات</strong><small>Belajar itu seru!</small></div>
            <div className="hero-pencil">✏️</div><div className="hero-apple">🍎</div><div className="hero-star">🌟</div>
            <div className="hero-caption">Ayo belajar bersama!</div>
          </div>
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading">
          <div><div className="eyebrow">MULAI DARI SINI</div><h2>Pilih tema belajarmu</h2><p>Belajar sedikit demi sedikit, lalu coba permainan serunya.</p></div>
          <Link href="/materi" className="inline-link">Lihat semua materi <ArrowRight size={16} /></Link>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link href={`/materi/${category.slug}`} className={`category-card tone-${category.color || "yellow"}`} key={category.id}>
              <div className="category-art"><span>{category.emoji}</span><i>✦</i></div>
              <div className="category-card-copy"><h3>{category.title}</h3><p>{category.description}</p><div className="category-meta"><span>{category.vocabulary_count ?? 0} kosakata</span><span className="round-arrow"><ArrowRight size={16} /></span></div></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="feature-band">
        <div className="container feature-grid">
          <div className="feature-copy"><div className="eyebrow">BELAJAR AKTIF</div><h2>Sudah belajar? Sekarang waktunya bermain!</h2><p>Uji ingatanmu dengan mencocokkan gambar dan kosakata Arab. Setiap jawaban benar membawamu selangkah lebih dekat menjadi jago mufrodat.</p><Link href="/permainan" className="button button-primary">Lihat permainan <ArrowRight size={18} /></Link></div>
          <div className="feature-tiles"><div className="feature-tile tile-yellow"><BookOpen size={25} /><strong>Kenali</strong><span>Lihat gambar dan arti</span></div><div className="feature-tile tile-blue"><Headphones size={25} /><strong>Dengarkan</strong><span>Latih pelafalan kata</span></div><div className="feature-tile tile-pink"><Gamepad2 size={25} /><strong>Pasangkan</strong><span>Uji ingatanmu</span></div><div className="feature-tile tile-green"><Star size={25} /><strong>Kumpulkan</strong><span>Raih skor terbaik</span></div></div>
        </div>
      </section>

      <section className="container section-block games-preview">
        <div className="section-heading"><div><div className="eyebrow">TANTANGAN MUFRODAT</div><h2>Permainan pilihan</h2><p>Pasangkan gambar dengan kata Arab yang tepat.</p></div><Link href="/permainan" className="inline-link">Semua permainan <ArrowRight size={16} /></Link></div>
        <div className="activity-grid">
          {activities.slice(0, 3).map((activity) => (
            <Link href={`/permainan/${activity.slug}`} className="activity-card" key={activity.id}>
              <div className="activity-icon">🧩</div><div className="activity-info"><span className="activity-label">MATCHING GAME</span><h3>{activity.title}</h3><p>{activity.description}</p><span className="activity-cta">Main sekarang <ArrowRight size={15} /></span></div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
