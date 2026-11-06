-- Mufrodat Kids: initial Supabase schema
-- Run this migration in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  emoji text not null default '📚',
  color text not null default 'yellow',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vocabulary (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  arabic text not null,
  transliteration text not null,
  meaning text not null,
  image_path text,
  audio_path text,
  image_emoji text not null default '🧩',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vocabulary_category_arabic_unique unique (category_id, arabic)
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text,
  game_type text not null default 'matching' check (game_type in ('matching')),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_items (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  vocabulary_id uuid not null references public.vocabulary(id) on delete cascade,
  points integer not null default 10 check (points >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint activity_vocabulary_unique unique (activity_id, vocabulary_id)
);

-- Guest sessions are created by the Next.js server. Only a hash of the session token is stored.
create table if not exists public.guest_sessions (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 1 and 24),
  class_label text,
  session_token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  guest_session_id uuid not null references public.guest_sessions(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  score integer not null default 0 check (score >= 0),
  max_score integer not null default 0 check (max_score >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  total_items integer not null default 0 check (total_items >= 0),
  mistakes integer not null default 0 check (mistakes >= 0),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  activity_item_id uuid not null references public.activity_items(id) on delete cascade,
  selected_vocabulary_id uuid references public.vocabulary(id) on delete set null,
  is_correct boolean not null default false,
  earned_points integer not null default 0,
  created_at timestamptz not null default now(),
  constraint attempt_activity_item_unique unique (attempt_id, activity_item_id)
);

create index if not exists vocabulary_category_sort_idx on public.vocabulary(category_id, sort_order);
create index if not exists activities_category_idx on public.activities(category_id);
create index if not exists activity_items_activity_sort_idx on public.activity_items(activity_id, sort_order);
create index if not exists attempts_guest_created_idx on public.attempts(guest_session_id, created_at desc);
create index if not exists attempts_activity_created_idx on public.attempts(activity_id, created_at desc);
create index if not exists attempt_answers_attempt_idx on public.attempt_answers(attempt_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = auth.uid()
  );
$$;

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger vocabulary_set_updated_at
before update on public.vocabulary
for each row execute function public.set_updated_at();

create trigger activities_set_updated_at
before update on public.activities
for each row execute function public.set_updated_at();

alter table public.admin_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.vocabulary enable row level security;
alter table public.activities enable row level security;
alter table public.activity_items enable row level security;
alter table public.guest_sessions enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;

-- Admin profile: a signed-in admin can read their own profile.
create policy "Admin can read own profile"
on public.admin_profiles for select to authenticated
using (user_id = auth.uid());

-- Published learning content is readable publicly. Admins can manage all content.
create policy "Public can read published categories"
on public.categories for select to anon, authenticated
using (is_published = true or public.is_admin());

create policy "Admins manage categories"
on public.categories for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Public can read published vocabulary"
on public.vocabulary for select to anon, authenticated
using (
  is_published = true
  and exists (
    select 1 from public.categories c
    where c.id = category_id and c.is_published = true
  )
  or public.is_admin()
);

create policy "Admins manage vocabulary"
on public.vocabulary for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Public can read published activities"
on public.activities for select to anon, authenticated
using (is_published = true or public.is_admin());

create policy "Admins manage activities"
on public.activities for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Public can read items in published activities"
on public.activity_items for select to anon, authenticated
using (
  exists (
    select 1 from public.activities a
    where a.id = activity_id and a.is_published = true
  )
  or public.is_admin()
);

create policy "Admins manage activity items"
on public.activity_items for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Guest activity data is private. The Next.js server uses the service-role key
-- after validating the random session token. Admins can read reports.
create policy "Admins can read guest sessions"
on public.guest_sessions for select to authenticated
using (public.is_admin());

create policy "Admins can read attempts"
on public.attempts for select to authenticated
using (public.is_admin());

create policy "Admins can read attempt answers"
on public.attempt_answers for select to authenticated
using (public.is_admin());

-- Public media bucket. Upload and delete are restricted to admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mufrodat-media',
  'mufrodat-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view mufrodat media"
on storage.objects for select to anon, authenticated
using (bucket_id = 'mufrodat-media');

create policy "Admins can upload mufrodat media"
on storage.objects for insert to authenticated
with check (bucket_id = 'mufrodat-media' and public.is_admin());

create policy "Admins can update mufrodat media"
on storage.objects for update to authenticated
using (bucket_id = 'mufrodat-media' and public.is_admin())
with check (bucket_id = 'mufrodat-media' and public.is_admin());

create policy "Admins can delete mufrodat media"
on storage.objects for delete to authenticated
using (bucket_id = 'mufrodat-media' and public.is_admin());

-- Explicit API privileges; RLS policies above still decide which rows are visible.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.categories, public.vocabulary, public.activities, public.activity_items to anon, authenticated;
grant insert, update, delete on public.categories, public.vocabulary, public.activities, public.activity_items to authenticated;
grant select on public.admin_profiles, public.guest_sessions, public.attempts, public.attempt_answers to authenticated;
grant all privileges on public.admin_profiles, public.categories, public.vocabulary, public.activities,
  public.activity_items, public.guest_sessions, public.attempts, public.attempt_answers to service_role;
