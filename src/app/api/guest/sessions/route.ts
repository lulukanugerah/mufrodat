import { createHash, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { displayName?: string; classLabel?: string };
    const displayName = body.displayName?.trim().slice(0, 24);
    const classLabel = body.classLabel?.trim().slice(0, 30) || null;

    if (!displayName) {
      return NextResponse.json({ error: "Nama panggilan harus diisi." }, { status: 400 });
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("guest_sessions")
      .insert({ display_name: displayName, class_label: classLabel, session_token_hash: tokenHash })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Sesi belajar gagal dibuat. Coba lagi." }, { status: 500 });
    }

    return NextResponse.json({ id: data.id, token }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server belum siap. Periksa konfigurasi Supabase." }, { status: 500 });
  }
}
