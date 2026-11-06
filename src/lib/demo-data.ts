import type { Activity, Category, Vocabulary } from "@/lib/types";

export const demoCategories: Category[] = [
  {
    id: "demo-cat-school",
    slug: "peralatan-sekolah",
    title: "Peralatan Sekolah",
    description: "Kenali benda-benda yang sering kamu gunakan di sekolah.",
    emoji: "🎒",
    color: "yellow",
    sort_order: 1,
    is_published: true,
    vocabulary_count: 6,
  },
  {
    id: "demo-cat-animals",
    slug: "hewan",
    title: "Hewan",
    description: "Belajar nama hewan dalam bahasa Arab.",
    emoji: "🦁",
    color: "green",
    sort_order: 2,
    is_published: true,
    vocabulary_count: 6,
  },
  {
    id: "demo-cat-fruits",
    slug: "buah-buahan",
    title: "Buah-buahan",
    description: "Ayo kenali nama buah yang enak dan menyehatkan.",
    emoji: "🍉",
    color: "pink",
    sort_order: 3,
    is_published: true,
    vocabulary_count: 6,
  },
];

export const demoVocabulary: Vocabulary[] = [
  { id: "school-1", category_id: "demo-cat-school", arabic: "كِتَابٌ", transliteration: "kitābun", meaning: "Buku", image_path: null, audio_path: null, image_emoji: "📘", sort_order: 1, is_published: true },
  { id: "school-2", category_id: "demo-cat-school", arabic: "قَلَمٌ", transliteration: "qalamun", meaning: "Pulpen", image_path: null, audio_path: null, image_emoji: "🖊️", sort_order: 2, is_published: true },
  { id: "school-3", category_id: "demo-cat-school", arabic: "مِمْحَاةٌ", transliteration: "mimḥātun", meaning: "Penghapus", image_path: null, audio_path: null, image_emoji: "🧽", sort_order: 3, is_published: true },
  { id: "school-4", category_id: "demo-cat-school", arabic: "مِسْطَرَةٌ", transliteration: "misṭaratun", meaning: "Penggaris", image_path: null, audio_path: null, image_emoji: "📏", sort_order: 4, is_published: true },
  { id: "school-5", category_id: "demo-cat-school", arabic: "حَقِيبَةٌ", transliteration: "ḥaqībatun", meaning: "Tas", image_path: null, audio_path: null, image_emoji: "🎒", sort_order: 5, is_published: true },
  { id: "school-6", category_id: "demo-cat-school", arabic: "قَلَمُ رَصَاصٍ", transliteration: "qalamu raṣāṣin", meaning: "Pensil", image_path: null, audio_path: null, image_emoji: "✏️", sort_order: 6, is_published: true },
  { id: "animal-1", category_id: "demo-cat-animals", arabic: "قِطَّةٌ", transliteration: "qiṭṭatun", meaning: "Kucing", image_path: null, audio_path: null, image_emoji: "🐱", sort_order: 1, is_published: true },
  { id: "animal-2", category_id: "demo-cat-animals", arabic: "كَلْبٌ", transliteration: "kalbun", meaning: "Anjing", image_path: null, audio_path: null, image_emoji: "🐶", sort_order: 2, is_published: true },
  { id: "animal-3", category_id: "demo-cat-animals", arabic: "أَسَدٌ", transliteration: "asadun", meaning: "Singa", image_path: null, audio_path: null, image_emoji: "🦁", sort_order: 3, is_published: true },
  { id: "animal-4", category_id: "demo-cat-animals", arabic: "فِيلٌ", transliteration: "fīlun", meaning: "Gajah", image_path: null, audio_path: null, image_emoji: "🐘", sort_order: 4, is_published: true },
  { id: "animal-5", category_id: "demo-cat-animals", arabic: "طَائِرٌ", transliteration: "ṭā'irun", meaning: "Burung", image_path: null, audio_path: null, image_emoji: "🐦", sort_order: 5, is_published: true },
  { id: "animal-6", category_id: "demo-cat-animals", arabic: "سَمَكَةٌ", transliteration: "samakatun", meaning: "Ikan", image_path: null, audio_path: null, image_emoji: "🐟", sort_order: 6, is_published: true },
  { id: "fruit-1", category_id: "demo-cat-fruits", arabic: "تُفَّاحَةٌ", transliteration: "tuffāḥatun", meaning: "Apel", image_path: null, audio_path: null, image_emoji: "🍎", sort_order: 1, is_published: true },
  { id: "fruit-2", category_id: "demo-cat-fruits", arabic: "مَوْزٌ", transliteration: "mawzun", meaning: "Pisang", image_path: null, audio_path: null, image_emoji: "🍌", sort_order: 2, is_published: true },
  { id: "fruit-3", category_id: "demo-cat-fruits", arabic: "بُرْتُقَالٌ", transliteration: "burtuqālun", meaning: "Jeruk", image_path: null, audio_path: null, image_emoji: "🍊", sort_order: 3, is_published: true },
  { id: "fruit-4", category_id: "demo-cat-fruits", arabic: "عِنَبٌ", transliteration: "inabun", meaning: "Anggur", image_path: null, audio_path: null, image_emoji: "🍇", sort_order: 4, is_published: true },
  { id: "fruit-5", category_id: "demo-cat-fruits", arabic: "بَطِّيخٌ", transliteration: "baṭṭīkhun", meaning: "Semangka", image_path: null, audio_path: null, image_emoji: "🍉", sort_order: 5, is_published: true },
  { id: "fruit-6", category_id: "demo-cat-fruits", arabic: "فَرَاوِلَةٌ", transliteration: "farāwilah", meaning: "Stroberi", image_path: null, audio_path: null, image_emoji: "🍓", sort_order: 6, is_published: true },
];

function makeDemoActivity(category: Category): Activity {
  const items = demoVocabulary
    .filter((item) => item.category_id === category.id)
    .map((vocabulary, index) => ({
      id: `demo-item-${vocabulary.id}`,
      activity_id: `demo-activity-${category.slug}`,
      vocabulary_id: vocabulary.id,
      points: 10,
      sort_order: index + 1,
      vocabulary,
    }));

  return {
    id: `demo-activity-${category.slug}`,
    category_id: category.id,
    slug: `pasangkan-${category.slug}`,
    title: `Pasangkan ${category.title}`,
    description: `Cocokkan gambar dengan kosakata bahasa Arab tentang ${category.title.toLowerCase()}.`,
    game_type: "matching",
    is_published: true,
    category,
    items,
  };
}

export const demoActivities: Activity[] = demoCategories.map(makeDemoActivity);
