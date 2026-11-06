export type Category = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  emoji: string;
  color: string;
  sort_order: number;
  is_published: boolean;
  vocabulary_count?: number;
};

export type Vocabulary = {
  id: string;
  category_id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  image_path: string | null;
  audio_path: string | null;
  image_emoji: string;
  sort_order: number;
  is_published: boolean;
  image_url?: string | null;
  audio_url?: string | null;
};

export type ActivityItem = {
  id: string;
  activity_id: string;
  vocabulary_id: string;
  points: number;
  sort_order: number;
  vocabulary: Vocabulary;
};

export type Activity = {
  id: string;
  category_id: string;
  slug: string;
  title: string;
  description: string | null;
  game_type: string;
  is_published: boolean;
  category?: Category;
  items: ActivityItem[];
};

export type GuestSession = {
  id: string;
  token: string;
  displayName: string;
  classLabel?: string;
  demo: boolean;
};

export type SubmittedAnswer = {
  activityItemId: string;
  selectedVocabularyId: string;
};
