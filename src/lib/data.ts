import { demoActivities, demoCategories, demoVocabulary } from "@/lib/demo-data";
import { hasSupabasePublicConfig } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import type { Activity, Category, Vocabulary } from "@/lib/types";

const MEDIA_BUCKET = "mufrodat-media";

function mediaUrl(supabase: Awaited<ReturnType<typeof createClient>>, path: string | null) {
  if (!path) return null;
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabasePublicConfig()) return demoCategories;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, title, description, emoji, color, sort_order, is_published")
    .eq("is_published", true)
    .order("sort_order");

  if (error) throw new Error(`Gagal mengambil kategori: ${error.message}`);
  const categories = (data ?? []) as Category[];

  const counts = await Promise.all(
    categories.map(async (category) => {
      const { count } = await supabase
        .from("vocabulary")
        .select("id", { count: "exact", head: true })
        .eq("category_id", category.id)
        .eq("is_published", true);
      return { id: category.id, count: count ?? 0 };
    }),
  );

  return categories.map((category) => ({
    ...category,
    vocabulary_count: counts.find((item) => item.id === category.id)?.count ?? 0,
  }));
}

export async function getCategoryBySlug(slug: string) {
  if (!hasSupabasePublicConfig()) {
    const category = demoCategories.find((item) => item.slug === slug);
    if (!category) return null;
    return {
      category,
      vocabulary: demoVocabulary.filter((item) => item.category_id === category.id),
    };
  }

  const supabase = await createClient();
  const { data: category, error } = await supabase
    .from("categories")
    .select("id, slug, title, description, emoji, color, sort_order, is_published")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(`Gagal mengambil kategori: ${error.message}`);
  if (!category) return null;

  const { data: rows, error: vocabularyError } = await supabase
    .from("vocabulary")
    .select("*")
    .eq("category_id", category.id)
    .eq("is_published", true)
    .order("sort_order");

  if (vocabularyError) throw new Error(`Gagal mengambil kosakata: ${vocabularyError.message}`);

  const vocabulary = (rows ?? []).map((item) => ({
    ...item,
    image_url: mediaUrl(supabase, item.image_path),
    audio_url: mediaUrl(supabase, item.audio_path),
  })) as Vocabulary[];

  return { category: category as Category, vocabulary };
}

export async function getActivities(): Promise<Activity[]> {
  if (!hasSupabasePublicConfig()) return demoActivities;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select("id, category_id, slug, title, description, game_type, is_published, category:categories(id, slug, title, emoji)")
    .eq("is_published", true)
    .order("created_at");

  if (error) throw new Error(`Gagal mengambil permainan: ${error.message}`);
  return (data ?? []).map((item) => ({ ...item, items: [] })) as unknown as Activity[];
}

export async function getActivityBySlug(slug: string): Promise<Activity | null> {
  if (!hasSupabasePublicConfig()) {
    return demoActivities.find((item) => item.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select(`
      id, category_id, slug, title, description, game_type, is_published,
      category:categories(id, slug, title, description, emoji, color, sort_order, is_published),
      items:activity_items(
        id, activity_id, vocabulary_id, points, sort_order,
        vocabulary:vocabulary(id, category_id, arabic, transliteration, meaning, image_path, audio_path, image_emoji, sort_order, is_published)
      )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(`Gagal mengambil permainan: ${error.message}`);
  if (!data) return null;

  const raw = data as unknown as Activity;
  return {
    ...raw,
    items: (raw.items ?? [])
      .filter((item) => item.vocabulary?.is_published)
      .map((item) => ({
        ...item,
        vocabulary: {
          ...item.vocabulary,
          image_url: mediaUrl(supabase, item.vocabulary.image_path),
          audio_url: mediaUrl(supabase, item.vocabulary.audio_path),
        },
      }))
      .sort((a, b) => a.sort_order - b.sort_order),
  };
}
