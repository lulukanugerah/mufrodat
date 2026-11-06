"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

const BUCKET = "mufrodat-media";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function uploadMedia(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  file: FormDataEntryValue | null,
  folder: string,
  allowedPrefix: "image/" | "audio/",
) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith(allowedPrefix)) throw new Error(`File harus berformat ${allowedPrefix === "image/" ? "gambar" : "audio"}.`);
  if (file.size > 10 * 1024 * 1024) throw new Error("Ukuran file maksimal 10 MB.");

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || (allowedPrefix === "image/" ? "webp" : "mp3");
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Upload media gagal: ${error.message}`);
  return path;
}

export async function createCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = textValue(formData, "title");
  const description = textValue(formData, "description");
  const emoji = textValue(formData, "emoji") || "📚";
  const color = textValue(formData, "color") || "yellow";
  if (!title) throw new Error("Nama kategori wajib diisi.");

  const { error } = await supabase.from("categories").insert({
    title,
    slug: `${slugify(title)}-${Date.now().toString(36)}`,
    description: description || null,
    emoji,
    color,
    sort_order: Number(formData.get("sort_order") || 0),
    is_published: true,
  });
  if (error) throw new Error(`Kategori gagal dibuat: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/materi");
  revalidatePath("/admin");
}

export async function createVocabulary(formData: FormData) {
  const { supabase } = await requireAdmin();
  const categoryId = textValue(formData, "category_id");
  const arabic = textValue(formData, "arabic");
  const transliteration = textValue(formData, "transliteration");
  const meaning = textValue(formData, "meaning");
  const imageEmoji = textValue(formData, "image_emoji") || "🧩";

  if (!categoryId || !arabic || !transliteration || !meaning) {
    throw new Error("Kategori, tulisan Arab, transliterasi, dan arti wajib diisi.");
  }

  const imagePath = await uploadMedia(supabase, formData.get("image_file"), categoryId, "image/");
  const audioPath = await uploadMedia(supabase, formData.get("audio_file"), categoryId, "audio/");

  const { error } = await supabase.from("vocabulary").insert({
    category_id: categoryId,
    arabic,
    transliteration,
    meaning,
    image_emoji: imageEmoji,
    image_path: imagePath,
    audio_path: audioPath,
    sort_order: Number(formData.get("sort_order") || 0),
    is_published: true,
  });

  if (error) throw new Error(`Kosakata gagal disimpan: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/materi", "layout");
  revalidatePath("/permainan", "layout");
  revalidatePath("/admin");
}

export async function createActivity(formData: FormData) {
  const { supabase } = await requireAdmin();
  const categoryId = textValue(formData, "category_id");
  if (!categoryId) throw new Error("Pilih kategori terlebih dahulu.");

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, slug, title")
    .eq("id", categoryId)
    .single();
  if (categoryError || !category) throw new Error("Kategori tidak ditemukan.");

  const { data: words, error: wordsError } = await supabase
    .from("vocabulary")
    .select("id")
    .eq("category_id", categoryId)
    .eq("is_published", true);
  if (wordsError || !words?.length) throw new Error("Tambahkan minimal satu kosakata sebelum membuat permainan.");

  const slug = `pasangkan-${category.slug}`;
  const { data: activity, error: activityError } = await supabase
    .from("activities")
    .upsert({
      category_id: categoryId,
      slug,
      title: textValue(formData, "title") || `Pasangkan ${category.title}`,
      description: textValue(formData, "description") || `Cocokkan gambar dengan kosakata tentang ${category.title.toLowerCase()}.`,
      game_type: "matching",
      is_published: true,
    }, { onConflict: "slug" })
    .select("id")
    .single();

  if (activityError || !activity) throw new Error(`Permainan gagal dibuat: ${activityError?.message ?? "unknown error"}`);

  await supabase.from("activity_items").delete().eq("activity_id", activity.id);
  const itemRows = words.map((word, index) => ({
    activity_id: activity.id,
    vocabulary_id: word.id,
    points: 10,
    sort_order: index + 1,
  }));
  const { error: itemError } = await supabase.from("activity_items").insert(itemRows);
  if (itemError) throw new Error(`Soal permainan gagal dibuat: ${itemError.message}`);

  revalidatePath("/");
  revalidatePath("/permainan");
  revalidatePath(`/permainan/${slug}`);
  revalidatePath("/admin");
}


export async function updateCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = textValue(formData, "id");
  const title = textValue(formData, "title");
  if (!id || !title) throw new Error("ID dan nama kategori wajib diisi.");
  const { error } = await supabase.from("categories").update({
    title,
    description: textValue(formData, "description") || null,
    emoji: textValue(formData, "emoji") || "📚",
    color: textValue(formData, "color") || "yellow",
    sort_order: Number(formData.get("sort_order") || 0),
  }).eq("id", id);
  if (error) throw new Error(`Kategori gagal diperbarui: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/materi", "layout");
  revalidatePath("/admin");
}

export async function updateVocabulary(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = textValue(formData, "id");
  const arabic = textValue(formData, "arabic");
  const transliteration = textValue(formData, "transliteration");
  const meaning = textValue(formData, "meaning");
  if (!id || !arabic || !transliteration || !meaning) throw new Error("Data kosakata belum lengkap.");

  const { data: oldItem } = await supabase.from("vocabulary").select("category_id, image_path, audio_path").eq("id", id).maybeSingle();
  if (!oldItem) throw new Error("Kosakata tidak ditemukan.");
  const newImagePath = await uploadMedia(supabase, formData.get("image_file"), oldItem.category_id, "image/");
  const newAudioPath = await uploadMedia(supabase, formData.get("audio_file"), oldItem.category_id, "audio/");

  const { error } = await supabase.from("vocabulary").update({
    arabic,
    transliteration,
    meaning,
    image_emoji: textValue(formData, "image_emoji") || "🧩",
    image_path: newImagePath || oldItem.image_path,
    audio_path: newAudioPath || oldItem.audio_path,
    sort_order: Number(formData.get("sort_order") || 0),
  }).eq("id", id);
  if (error) throw new Error(`Kosakata gagal diperbarui: ${error.message}`);

  const replacedPaths = [newImagePath ? oldItem.image_path : null, newAudioPath ? oldItem.audio_path : null].filter((path): path is string => Boolean(path));
  if (replacedPaths.length) await supabase.storage.from(BUCKET).remove(replacedPaths);
  revalidatePath("/");
  revalidatePath("/materi", "layout");
  revalidatePath("/permainan", "layout");
  revalidatePath("/admin");
}

export async function deleteVocabulary(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = textValue(formData, "id");
  const { data: item } = await supabase.from("vocabulary").select("image_path, audio_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("vocabulary").delete().eq("id", id);
  if (error) throw new Error(`Kosakata gagal dihapus: ${error.message}`);

  const paths = [item?.image_path, item?.audio_path].filter((path): path is string => Boolean(path));
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  revalidatePath("/");
  revalidatePath("/materi", "layout");
  revalidatePath("/permainan", "layout");
  revalidatePath("/admin");
}

export async function deleteActivity(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = textValue(formData, "id");
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) throw new Error(`Permainan gagal dihapus: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/permainan");
  revalidatePath("/admin");
}

export async function logoutAdmin() {
  const { supabase } = await requireAdmin();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
