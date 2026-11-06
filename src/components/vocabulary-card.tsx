import type { Vocabulary } from "@/lib/types";
import { AudioButton } from "@/components/audio-button";

export function VocabularyCard({ item, compact = false }: { item: Vocabulary; compact?: boolean }) {
  return (
    <article className={`vocab-card ${compact ? "vocab-card-compact" : ""}`}>
      <div className="vocab-image-wrap">
        {item.image_url ? (
          // Uploaded images are stored in the public Supabase media bucket.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.meaning} className="vocab-image" />
        ) : (
          <span className="vocab-emoji" role="img" aria-label={item.meaning}>{item.image_emoji || "🧩"}</span>
        )}
      </div>
      <div className="vocab-details">
        <p className="arabic-word" lang="ar" dir="rtl">{item.arabic}</p>
        <p className="vocab-transliteration">{item.transliteration}</p>
        <p className="vocab-meaning">{item.meaning}</p>
        <AudioButton text={item.arabic} audioUrl={item.audio_url} />
      </div>
    </article>
  );
}
