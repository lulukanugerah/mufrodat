"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, CircleHelp, RotateCcw, Sparkles, Trophy, XCircle } from "lucide-react";
import type { Activity, GuestSession, SubmittedAnswer } from "@/lib/types";

type GameItem = Activity["items"][number];
type GameResult = {
  score: number;
  maxScore: number;
  correctCount: number;
  totalItems: number;
  mistakes: number;
  durationSeconds: number;
  saved: boolean;
};

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function picture(item: GameItem) {
  const vocab = item.vocabulary;
  if (vocab.image_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={vocab.image_url} alt={vocab.meaning} className="matching-photo" />;
  }
  return <span className="matching-emoji" role="img" aria-label={vocab.meaning}>{vocab.image_emoji || "🧩"}</span>;
}

export function MatchingGame({ activity, persistent }: { activity: Activity; persistent: boolean }) {
  const items = useMemo(() => activity.items ?? [], [activity.items]);
  const [screen, setScreen] = useState<"intro" | "play" | "result">("intro");
  const [displayName, setDisplayName] = useState("");
  const [classLabel, setClassLabel] = useState("Kelas 3");
  const [session, setSession] = useState<GuestSession | null>(null);
  const [imageItems, setImageItems] = useState<GameItem[]>(items);
  const [wordItems, setWordItems] = useState<GameItem[]>(items);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [answers, setAnswers] = useState<SubmittedAnswer[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState("Pilih satu gambar, lalu pilih kosakata Arab yang cocok.");
  const [result, setResult] = useState<GameResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    setImageItems(shuffle(items));
    setWordItems(shuffle(items));
  }, [items]);

  async function startGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!displayName.trim()) return;
    setBusy(true);

    try {
      let activeSession: GuestSession;
      if (persistent) {
        const response = await fetch("/api/guest/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName: displayName.trim(), classLabel: classLabel.trim() }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Sesi belajar tidak dapat dibuat.");
        activeSession = { ...payload, displayName: displayName.trim(), classLabel: classLabel.trim(), demo: false };
      } else {
        activeSession = {
          id: crypto.randomUUID(),
          token: "demo-session",
          displayName: displayName.trim(),
          classLabel: classLabel.trim(),
          demo: true,
        };
      }
      localStorage.setItem("mufrodat-guest-session", JSON.stringify(activeSession));
      setSession(activeSession);
      setImageItems(shuffle(items));
      setWordItems(shuffle(items));
      setMatched([]);
      setAnswers([]);
      setMistakes(0);
      setSelectedImage(null);
      setResult(null);
      setStartedAt(Date.now());
      setMessage("Pilih satu gambar, lalu pilih kosakata Arab yang cocok.");
      setScreen("play");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  function chooseImage(item: GameItem) {
    if (matched.includes(item.id)) return;
    setSelectedImage(item.id);
    setMessage(`Sekarang pilih kata Arab untuk gambar ${item.vocabulary.meaning}.`);
  }

  async function chooseWord(item: GameItem) {
    if (!selectedImage || matched.includes(item.id)) return;
    const target = items.find((entry) => entry.id === selectedImage);
    if (!target) return;

    if (target.vocabulary_id === item.vocabulary_id) {
      const nextMatched = [...matched, target.id];
      const nextAnswers = [...answers, {
        activityItemId: target.id,
        selectedVocabularyId: item.vocabulary_id,
      }];
      setMatched(nextMatched);
      setAnswers(nextAnswers);
      setSelectedImage(null);
      setMessage("Tepat sekali! Pasanganmu benar. 🌟");

      if (nextMatched.length === items.length) {
        await finishGame(nextAnswers, mistakes);
      }
    } else {
      setMistakes((current) => current + 1);
      setSelectedImage(null);
      setMessage("Belum cocok. Coba perhatikan gambarnya sekali lagi, ya!");
    }
  }

  async function finishGame(finalAnswers: SubmittedAnswer[], finalMistakes: number) {
    if (!session) return;
    const durationSeconds = Math.max(1, Math.round((Date.now() - (startedAt ?? Date.now())) / 1000));
    const maxScore = items.reduce((total, item) => total + item.points, 0);
    const score = Math.max(0, maxScore - finalMistakes * 2);
    let saved = false;

    if (persistent && !session.demo) {
      try {
        const response = await fetch("/api/guest/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.id,
            token: session.token,
            activityId: activity.id,
            answers: finalAnswers,
            durationSeconds,
            mistakes: finalMistakes,
          }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Skor belum tersimpan.");
        saved = true;
        setResult({ ...payload, mistakes: finalMistakes, durationSeconds, saved: true });
      } catch {
        setResult({ score, maxScore, correctCount: finalAnswers.length, totalItems: items.length, mistakes: finalMistakes, durationSeconds, saved: false });
      }
    } else {
      const previous = JSON.parse(localStorage.getItem("mufrodat-demo-results") || "[]") as unknown[];
      localStorage.setItem("mufrodat-demo-results", JSON.stringify([
        ...previous,
        { activityTitle: activity.title, displayName: session.displayName, score, maxScore, mistakes: finalMistakes, completedAt: new Date().toISOString() },
      ]));
      setResult({ score, maxScore, correctCount: finalAnswers.length, totalItems: items.length, mistakes: finalMistakes, durationSeconds, saved: true });
      saved = true;
    }

    if (!saved) setMessage("Permainan selesai. Hasil tampil, tetapi belum berhasil tersimpan ke server.");
    setScreen("result");
  }

  function restart() {
    setImageItems(shuffle(items));
    setWordItems(shuffle(items));
    setMatched([]);
    setAnswers([]);
    setMistakes(0);
    setSelectedImage(null);
    setResult(null);
    setStartedAt(Date.now());
    setMessage("Pilih satu gambar, lalu pilih kosakata Arab yang cocok.");
    setScreen("play");
  }

  if (items.length === 0) {
    return <div className="empty-state"><CircleHelp size={30} /><h2>Belum ada soal</h2><p>Guru belum menambahkan kosakata ke permainan ini.</p><Link href="/permainan" className="button button-primary">Kembali ke permainan</Link></div>;
  }

  if (screen === "intro") {
    return (
      <section className="game-intro-card">
        <div className="game-intro-art"><span>🧩</span><span>✨</span><span>📚</span></div>
        <div className="eyebrow">PERMAINAN MUFRODAT</div>
        <h1>{activity.title}</h1>
        <p>{activity.description || "Pasangkan gambar dengan kosakata bahasa Arab yang tepat."}</p>
        <div className="game-facts">
          <span>🖼️ {items.length} gambar</span>
          <span>⭐ {items.reduce((total, item) => total + item.points, 0)} poin maksimal</span>
          <span>👆 Klik untuk memasangkan</span>
        </div>
        <form className="guest-form" onSubmit={startGame}>
          <label htmlFor="student-name">Nama panggilan</label>
          <input id="student-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Contoh: Aisyah" maxLength={24} required />
          <label htmlFor="class-label">Kelas (opsional)</label>
          <input id="class-label" value={classLabel} onChange={(event) => setClassLabel(event.target.value)} placeholder="Contoh: 3A" maxLength={30} />
          <button className="button button-primary button-wide" disabled={busy} type="submit">{busy ? "Menyiapkan permainan..." : "Mulai bermain 🚀"}</button>
          {message !== "Pilih satu gambar, lalu pilih kosakata Arab yang cocok." && <p className="form-error">{message}</p>}
        </form>
        <p className="privacy-note">Tidak perlu membuat akun. Gunakan nama panggilan saja.</p>
      </section>
    );
  }

  if (screen === "result" && result) {
    const percentage = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
    return (
      <section className="result-card">
        <div className="result-trophy"><Trophy size={44} /></div>
        <div className="eyebrow">PERMAINAN SELESAI</div>
        <h1>Hebat, {session?.displayName}! 🎉</h1>
        <p>Kamu sudah menyelesaikan {activity.title}.</p>
        <div className="score-circle"><strong>{result.score}</strong><span>/ {result.maxScore} poin</span></div>
        <div className="result-stats">
          <div><strong>{result.correctCount}/{result.totalItems}</strong><span>Pasangan benar</span></div>
          <div><strong>{result.mistakes}</strong><span>Kesalahan</span></div>
          <div><strong>{result.durationSeconds}s</strong><span>Waktu</span></div>
        </div>
        <div className="result-message">{percentage >= 80 ? "Luar biasa! Kamu menguasai mufrodat ini." : percentage >= 60 ? "Bagus! Terus berlatih agar semakin lancar." : "Terus berlatih. Kamu pasti semakin hebat!"}</div>
        <p className={`save-status ${result.saved ? "save-success" : "save-warning"}`}>
          {result.saved ? "✓ Hasil belajar tersimpan." : "Hasil tampil, tetapi belum tersimpan ke server. Periksa koneksi dan konfigurasi Supabase."}
        </p>
        <div className="result-actions">
          <button className="button button-primary" onClick={restart}><RotateCcw size={17} /> Main lagi</button>
          <Link className="button button-secondary" href="/permainan"><ArrowLeft size={17} /> Pilih permainan</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="matching-board">
      <div className="game-topline">
        <div><div className="eyebrow">AYO MENJODOHKAN</div><h1>{activity.title}</h1></div>
        <div className="progress-pill">{matched.length} / {items.length} cocok</div>
      </div>
      <div className="progress-track"><span style={{ width: `${(matched.length / items.length) * 100}%` }} /></div>
      <div className="game-message" role="status"><Sparkles size={18} /> {message}</div>
      <div className="matching-columns">
        <div className="matching-column">
          <h2>1. Pilih gambar</h2>
          <div className="matching-list">
            {imageItems.map((item) => {
              const done = matched.includes(item.id);
              return (
                <button key={item.id} className={`matching-image-option ${selectedImage === item.id ? "is-selected" : ""} ${done ? "is-matched" : ""}`} onClick={() => chooseImage(item)} disabled={done} type="button">
                  {picture(item)}
                  <span>{done ? "Sudah cocok ✓" : "Pilih gambar"}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="matching-column">
          <h2>2. Pilih kosakata Arab</h2>
          <div className="matching-list">
            {wordItems.map((item) => {
              const done = matched.includes(item.id);
              return (
                <button key={item.id} className={`matching-word-option ${done ? "is-matched" : ""}`} onClick={() => void chooseWord(item)} disabled={done} type="button">
                  <span className="arabic-word" lang="ar" dir="rtl">{item.vocabulary.arabic}</span>
                  <small>{done ? "Sudah cocok ✓" : "Pilih kata"}</small>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="game-bottomline">
        <span><CheckCircle2 size={16} /> {matched.length} benar</span>
        <span><XCircle size={16} /> {mistakes} belum tepat</span>
        <button className="text-button" onClick={() => { setScreen("intro"); setMessage("Pilih satu gambar, lalu pilih kosakata Arab yang cocok."); }}>Keluar dari permainan</button>
      </div>
    </section>
  );
}
