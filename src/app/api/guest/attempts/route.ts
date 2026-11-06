import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

type AnswerInput = {
  activityItemId: string;
  selectedVocabularyId: string;
};

type AttemptBody = {
  sessionId?: string;
  token?: string;
  activityId?: string;
  answers?: AnswerInput[];
  durationSeconds?: number;
  mistakes?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AttemptBody;
    if (!body.sessionId || !body.token || !body.activityId || !Array.isArray(body.answers)) {
      return NextResponse.json({ error: "Data hasil permainan belum lengkap." }, { status: 400 });
    }

    if (body.answers.length < 1 || body.answers.length > 30) {
      return NextResponse.json({ error: "Jumlah jawaban tidak valid." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const tokenHash = createHash("sha256").update(body.token).digest("hex");
    const { data: session } = await supabase
      .from("guest_sessions")
      .select("id")
      .eq("id", body.sessionId)
      .eq("session_token_hash", tokenHash)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ error: "Sesi belajar tidak valid. Mulai permainan kembali." }, { status: 401 });
    }

    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .select("id, is_published")
      .eq("id", body.activityId)
      .eq("is_published", true)
      .maybeSingle();

    if (activityError || !activity) {
      return NextResponse.json({ error: "Permainan tidak ditemukan atau tidak aktif." }, { status: 404 });
    }

    const { data: activityItems, error: itemsError } = await supabase
      .from("activity_items")
      .select("id, vocabulary_id, points")
      .eq("activity_id", body.activityId);

    if (itemsError || !activityItems || activityItems.length !== body.answers.length) {
      return NextResponse.json({ error: "Jawaban belum mencakup semua soal." }, { status: 400 });
    }

    type DbActivityItem = { id: string; vocabulary_id: string; points: number };
    const typedActivityItems = activityItems as DbActivityItem[];
    const itemMap = new Map<string, DbActivityItem>(typedActivityItems.map((item) => [item.id, item]));
    const uniqueAnswerIds = new Set(body.answers.map((answer) => answer.activityItemId));
    if (uniqueAnswerIds.size !== activityItems.length) {
      return NextResponse.json({ error: "Ada jawaban ganda atau soal yang terlewat." }, { status: 400 });
    }

    const normalizedAnswers = body.answers.map((answer) => {
      const item = itemMap.get(answer.activityItemId);
      if (!item || item.vocabulary_id !== answer.selectedVocabularyId) return null;
      return {
        activity_item_id: item.id,
        selected_vocabulary_id: item.vocabulary_id,
        is_correct: true,
        earned_points: item.points,
      };
    });

    if (normalizedAnswers.some((answer) => answer === null)) {
      return NextResponse.json({ error: "Pasangan jawaban tidak sesuai dengan soal." }, { status: 400 });
    }

    const maxScore = typedActivityItems.reduce((sum, item) => sum + item.points, 0);
    const mistakes = Math.max(0, Math.min(500, Math.floor(Number(body.mistakes) || 0)));
    const score = Math.max(0, maxScore - mistakes * 2);
    const durationSeconds = Math.max(0, Math.min(7200, Math.floor(Number(body.durationSeconds) || 0)));

    const { data: attempt, error: attemptError } = await supabase
      .from("attempts")
      .insert({
        guest_session_id: session.id,
        activity_id: activity.id,
        score,
        max_score: maxScore,
        correct_count: typedActivityItems.length,
        total_items: typedActivityItems.length,
        mistakes,
        duration_seconds: durationSeconds,
      })
      .select("id")
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json({ error: "Hasil permainan gagal disimpan." }, { status: 500 });
    }

    const { error: answerError } = await supabase.from("attempt_answers").insert(
      normalizedAnswers.map((answer) => ({ ...answer!, attempt_id: attempt.id })),
    );

    if (answerError) {
      await supabase.from("attempts").delete().eq("id", attempt.id);
      return NextResponse.json({ error: "Detail jawaban gagal disimpan." }, { status: 500 });
    }

    await supabase.from("guest_sessions").update({ last_seen_at: new Date().toISOString() }).eq("id", session.id);

    return NextResponse.json({
      score,
      maxScore,
      correctCount: typedActivityItems.length,
      totalItems: typedActivityItems.length,
    });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan saat menyimpan hasil." }, { status: 500 });
  }
}
