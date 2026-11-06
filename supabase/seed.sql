-- Demo learning content for Mufrodat Kids.
-- Run after the initial migration.

insert into public.categories (slug, title, description, emoji, color, sort_order, is_published)
values
  ('peralatan-sekolah', 'Peralatan Sekolah', 'Kenali benda-benda yang sering kamu gunakan di sekolah.', '🎒', 'yellow', 1, true),
  ('hewan', 'Hewan', 'Belajar nama hewan dalam bahasa Arab.', '🦁', 'green', 2, true),
  ('buah-buahan', 'Buah-buahan', 'Ayo kenali nama buah yang enak dan menyehatkan.', '🍉', 'pink', 3, true)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  emoji = excluded.emoji,
  color = excluded.color,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

insert into public.vocabulary (category_id, arabic, transliteration, meaning, image_emoji, sort_order, is_published)
select c.id, v.arabic, v.transliteration, v.meaning, v.image_emoji, v.sort_order, true
from (values
  ('peralatan-sekolah', 'كِتَابٌ', 'kitābun', 'Buku', '📘', 1),
  ('peralatan-sekolah', 'قَلَمٌ', 'qalamun', 'Pulpen', '🖊️', 2),
  ('peralatan-sekolah', 'مِمْحَاةٌ', 'mimḥātun', 'Penghapus', '🧽', 3),
  ('peralatan-sekolah', 'مِسْطَرَةٌ', 'misṭaratun', 'Penggaris', '📏', 4),
  ('peralatan-sekolah', 'حَقِيبَةٌ', 'ḥaqībatun', 'Tas', '🎒', 5),
  ('peralatan-sekolah', 'قَلَمُ رَصَاصٍ', 'qalamu raṣāṣin', 'Pensil', '✏️', 6),
  ('hewan', 'قِطَّةٌ', 'qiṭṭatun', 'Kucing', '🐱', 1),
  ('hewan', 'كَلْبٌ', 'kalbun', 'Anjing', '🐶', 2),
  ('hewan', 'أَسَدٌ', 'asadun', 'Singa', '🦁', 3),
  ('hewan', 'فِيلٌ', 'fīlun', 'Gajah', '🐘', 4),
  ('hewan', 'طَائِرٌ', 'ṭā''irun', 'Burung', '🐦', 5),
  ('hewan', 'سَمَكَةٌ', 'samakatun', 'Ikan', '🐟', 6),
  ('buah-buahan', 'تُفَّاحَةٌ', 'tuffāḥatun', 'Apel', '🍎', 1),
  ('buah-buahan', 'مَوْزٌ', 'mawzun', 'Pisang', '🍌', 2),
  ('buah-buahan', 'بُرْتُقَالٌ', 'burtuqālun', 'Jeruk', '🍊', 3),
  ('buah-buahan', 'عِنَبٌ', 'inabun', 'Anggur', '🍇', 4),
  ('buah-buahan', 'بَطِّيخٌ', 'baṭṭīkhun', 'Semangka', '🍉', 5),
  ('buah-buahan', 'فَرَاوِلَةٌ', 'farāwilah', 'Stroberi', '🍓', 6)
) as v(category_slug, arabic, transliteration, meaning, image_emoji, sort_order)
join public.categories c on c.slug = v.category_slug
on conflict (category_id, arabic) do update set
  transliteration = excluded.transliteration,
  meaning = excluded.meaning,
  image_emoji = excluded.image_emoji,
  sort_order = excluded.sort_order,
  is_published = true;

insert into public.activities (category_id, slug, title, description, game_type, is_published)
select c.id,
       'pasangkan-' || c.slug,
       'Pasangkan ' || c.title,
       'Cocokkan gambar dengan kosakata bahasa Arab tentang ' || lower(c.title) || '.',
       'matching',
       true
from public.categories c
where c.slug in ('peralatan-sekolah', 'hewan', 'buah-buahan')
on conflict (slug) do update set
  category_id = excluded.category_id,
  title = excluded.title,
  description = excluded.description,
  is_published = true;

insert into public.activity_items (activity_id, vocabulary_id, points, sort_order)
select a.id, v.id, 10, v.sort_order
from public.activities a
join public.vocabulary v on v.category_id = a.category_id and v.is_published = true
where a.slug in ('pasangkan-peralatan-sekolah', 'pasangkan-hewan', 'pasangkan-buah-buahan')
on conflict (activity_id, vocabulary_id) do update set
  points = excluded.points,
  sort_order = excluded.sort_order;
