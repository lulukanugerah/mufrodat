import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { getActivities } from "@/lib/data";

export const metadata: Metadata = { title: "Permainan Mufrodat" };

export default async function GamesPage() {
  const activities = await getActivities();
  return (
    <section className="container page-section">
      <div className="page-title-block"><div className="eyebrow"><Gamepad2 size={15} /> ARENA PERMAINAN</div><h1>Siap menerima tantangan?</h1><p>Pasangkan gambar dengan kosakata Arab. Coba selesaikan semuanya dan raih skor terbaik!</p></div>
      <div className="activity-grid activity-grid-large">
        {activities.map((activity) => (
          <Link href={`/permainan/${activity.slug}`} className="activity-card" key={activity.id}>
            <div className="activity-icon">🧩</div><div className="activity-info"><span className="activity-label">MATCHING GAME</span><h2>{activity.title}</h2><p>{activity.description}</p><span className="activity-cta">Main sekarang <ArrowRight size={15} /></span></div>
          </Link>
        ))}
      </div>
    </section>
  );
}
