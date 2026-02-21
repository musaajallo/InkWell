-- ============================================================
-- InkWell Database Schema
-- Migration: 00001_initial_schema
-- Date: 2026-02-21
--
-- Creates all tables, enums, indexes, RLS policies,
-- functions, and triggers for the InkWell poetry app.
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- ─── Enable Required Extensions ──────────────────────────────

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- Trigram index for full-text search

-- ─── Custom Enum Types ──────────────────────────────────────

create type poem_status as enum ('draft', 'complete');
create type poem_source_type as enum ('original', 'imported', 'dictated', 'poetrydb');
create type import_method as enum ('text', 'file', 'clipboard', 'ocr', 'poetrydb', 'url');
create type review_tone as enum ('academic', 'casual', 'encouraging');
create type recitation_pace as enum ('slow', 'normal', 'dramatic');
create type prompt_category as enum ('emotion', 'nature', 'memory', 'abstract', 'story', 'observation');
create type poetry_form_slug as enum (
  'haiku', 'tanka', 'sonnet-shakespearean', 'sonnet-petrarchan',
  'limerick', 'villanelle', 'ghazal', 'free-verse',
  'acrostic', 'ballad', 'ode', 'elegy', 'couplet'
);

-- ─── Helper: Auto-update updated_at ─────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url  text,
  is_premium  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- POEMS
-- ============================================================

create table poems (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  title           text not null default '',
  body            text not null default '',
  tags            text[] not null default '{}',
  form_type       poetry_form_slug,            -- null = free verse
  status          poem_status not null default 'draft',
  is_favorite     boolean not null default false,
  word_count      integer not null default 0,
  line_count      integer not null default 0,
  prompt_id       uuid,                         -- FK set after writing_prompts table
  -- Source fields (flattened from union type)
  source_type     poem_source_type not null default 'original',
  import_method   import_method,                -- only when source_type = 'imported'
  source_author   text,                         -- imported poem author
  source_url      text,                         -- imported source URL
  source_book     text,                         -- imported source book
  imported_at     timestamptz,                  -- when the import happened
  poetrydb_id     text,                         -- PoetryDB identifier
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger poems_updated_at
  before update on poems
  for each row execute function update_updated_at();

-- Indexes
create index poems_user_id_idx on poems(user_id);
create index poems_status_idx on poems(user_id, status);
create index poems_is_favorite_idx on poems(user_id, is_favorite) where is_favorite = true;
create index poems_created_at_idx on poems(user_id, created_at desc);
create index poems_updated_at_idx on poems(user_id, updated_at desc);
create index poems_form_type_idx on poems(form_type) where form_type is not null;
-- Trigram index for full-text search on title and body
create index poems_title_trgm_idx on poems using gin (title gin_trgm_ops);
create index poems_body_trgm_idx on poems using gin (body gin_trgm_ops);
-- GIN index for tags array
create index poems_tags_idx on poems using gin (tags);

-- ============================================================
-- COLLECTIONS
-- ============================================================

create table collections (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  description     text not null default '',
  cover_color     text not null default '#0F3460',
  icon_name       text not null default 'folder',
  is_default      boolean not null default false,
  is_anthology    boolean not null default false,
  poem_order      uuid[] not null default '{}',       -- ordered poem IDs
  -- Anthology metadata (only populated when is_anthology = true)
  anthology_subtitle      text,
  anthology_author_bio    text,
  anthology_dedication    text,
  anthology_foreword      text,
  anthology_cover_image   text,      -- Storage path or URL
  anthology_include_reviews boolean not null default false,
  anthology_published_at  timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger collections_updated_at
  before update on collections
  for each row execute function update_updated_at();

create index collections_user_id_idx on collections(user_id);
create index collections_is_anthology_idx on collections(user_id, is_anthology) where is_anthology = true;

-- ============================================================
-- POEM_COLLECTIONS (many-to-many join table)
-- ============================================================

create table poem_collections (
  poem_id       uuid not null references poems(id) on delete cascade,
  collection_id uuid not null references collections(id) on delete cascade,
  added_at      timestamptz not null default now(),
  primary key (poem_id, collection_id)
);

create index poem_collections_collection_idx on poem_collections(collection_id);
create index poem_collections_poem_idx on poem_collections(poem_id);

-- ============================================================
-- SECTION DIVIDERS (anthology chapter headings)
-- ============================================================

create table section_dividers (
  id              uuid primary key default gen_random_uuid(),
  collection_id   uuid not null references collections(id) on delete cascade,
  after_poem_id   uuid not null references poems(id) on delete cascade,
  heading         text not null,
  subtitle        text,
  created_at      timestamptz not null default now(),
  -- Unique: one divider per poem per collection
  unique (collection_id, after_poem_id)
);

create index section_dividers_collection_idx on section_dividers(collection_id);

-- ============================================================
-- POEM REVIEWS (AI-generated analysis)
-- ============================================================

create table poem_reviews (
  id                  uuid primary key default gen_random_uuid(),
  poem_id             uuid not null references poems(id) on delete cascade,
  user_id             uuid not null references auth.users(id) on delete cascade,
  summary             text not null default '',
  themes              jsonb not null default '[]',     -- ReviewTheme[]
  literary_devices    jsonb not null default '[]',     -- LiteraryDevice[]
  structure_analysis  text not null default '',
  interpretation      text not null default '',
  tone                review_tone not null default 'encouraging',
  personal_notes      text not null default '',
  poem_body_hash      text not null default '',        -- detect changes
  generated_at        timestamptz not null default now()
);

-- One active review per poem (latest wins; old ones kept for history)
create index poem_reviews_poem_id_idx on poem_reviews(poem_id);
create index poem_reviews_user_id_idx on poem_reviews(user_id);

-- ============================================================
-- AUDIO RECITATIONS
-- ============================================================

create table audio_recitations (
  id                uuid primary key default gen_random_uuid(),
  poem_id           uuid not null references poems(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  file_uri          text not null,                -- local file path or storage URL
  video_uri         text,                         -- MP4 path (nullable)
  voice_id          text not null,
  voice_name        text not null,
  pace              recitation_pace not null default 'normal',
  background_track  text,                         -- ambient track ID
  duration_seconds  real not null default 0,
  file_size_bytes   integer not null default 0,
  generated_at      timestamptz not null default now()
);

create index audio_recitations_poem_id_idx on audio_recitations(poem_id);
create index audio_recitations_user_id_idx on audio_recitations(user_id);

-- ============================================================
-- WRITING PROMPTS (global, seeded by admin)
-- ============================================================

create table writing_prompts (
  id          uuid primary key default gen_random_uuid(),
  text        text not null,
  category    prompt_category not null
);

create index writing_prompts_category_idx on writing_prompts(category);

-- ============================================================
-- USER PROMPT STATE (per-user favorites & used tracking)
-- ============================================================

create table user_prompt_state (
  user_id     uuid not null references auth.users(id) on delete cascade,
  prompt_id   uuid not null references writing_prompts(id) on delete cascade,
  is_favorite boolean not null default false,
  is_used     boolean not null default false,
  primary key (user_id, prompt_id)
);

-- ============================================================
-- POETRY FORMS (global reference data, seeded by admin)
-- ============================================================

create table poetry_forms (
  slug              poetry_form_slug primary key,
  name              text not null,
  origin            text not null default '',
  description       text not null default '',
  rules             text[] not null default '{}',
  rhyme_scheme      text,
  line_count        integer,
  syllable_pattern  integer[],                    -- e.g., {5,7,5} for haiku
  examples          jsonb not null default '[]'   -- PoetryFormExample[]
);

-- ============================================================
-- BUNDLED POEMS (offline fallback for daily poem)
-- ============================================================

create table bundled_poems (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  author      text not null,
  lines       text[] not null,
  line_count  integer not null default 0
);

-- ============================================================
-- DAILY POEM CACHE (per user, one row)
-- ============================================================

create table daily_poem_cache (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  title       text not null,
  author      text not null,
  lines       text[] not null,
  line_count  text not null default '0',
  fetched_at  timestamptz not null default now()
);

-- ============================================================
-- USER SETTINGS (per user, one row)
-- ============================================================

create table user_settings (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  theme                  text not null default 'system'
                           check (theme in ('light', 'dark', 'system')),
  editor_font_family     text not null default 'serif'
                           check (editor_font_family in ('monospace', 'serif')),
  editor_font_size       text not null default 'medium'
                           check (editor_font_size in ('small', 'medium', 'large')),
  show_syllable_counter  boolean not null default true,
  show_line_numbers      boolean not null default true,
  auto_save_interval     integer not null default 30000,
  tts_rate               real not null default 1.0,
  share_watermark        boolean not null default true,
  default_collection_id  uuid,        -- references collections(id), but nullable on first create
  voice_recognition_lang text not null default 'en-US',
  recitation_voice_id    text not null default '',
  recitation_pace        recitation_pace not null default 'normal',
  review_tone            review_tone not null default 'encouraging',
  updated_at             timestamptz not null default now()
);

create trigger user_settings_updated_at
  before update on user_settings
  for each row execute function update_updated_at();

-- Auto-create user_settings row on profile creation
create or replace function handle_new_profile()
returns trigger as $$
begin
  insert into public.user_settings (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on profiles
  for each row execute function handle_new_profile();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all user-owned tables
alter table profiles enable row level security;
alter table poems enable row level security;
alter table collections enable row level security;
alter table poem_collections enable row level security;
alter table section_dividers enable row level security;
alter table poem_reviews enable row level security;
alter table audio_recitations enable row level security;
alter table user_prompt_state enable row level security;
alter table daily_poem_cache enable row level security;
alter table user_settings enable row level security;

-- Global/read-only tables: anyone authenticated can read
alter table writing_prompts enable row level security;
alter table poetry_forms enable row level security;
alter table bundled_poems enable row level security;

-- ─── Profiles ────────────────────────────────────────────────

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- ─── Poems ───────────────────────────────────────────────────

create policy "Users can view own poems"
  on poems for select using (auth.uid() = user_id);

create policy "Users can create own poems"
  on poems for insert with check (auth.uid() = user_id);

create policy "Users can update own poems"
  on poems for update using (auth.uid() = user_id);

create policy "Users can delete own poems"
  on poems for delete using (auth.uid() = user_id);

-- ─── Collections ─────────────────────────────────────────────

create policy "Users can view own collections"
  on collections for select using (auth.uid() = user_id);

create policy "Users can create own collections"
  on collections for insert with check (auth.uid() = user_id);

create policy "Users can update own collections"
  on collections for update using (auth.uid() = user_id);

create policy "Users can delete own collections"
  on collections for delete using (auth.uid() = user_id);

-- ─── Poem Collections (join table) ──────────────────────────

create policy "Users can view own poem-collection links"
  on poem_collections for select
  using (
    exists (
      select 1 from poems where poems.id = poem_collections.poem_id and poems.user_id = auth.uid()
    )
  );

create policy "Users can add poems to collections"
  on poem_collections for insert
  with check (
    exists (
      select 1 from poems where poems.id = poem_collections.poem_id and poems.user_id = auth.uid()
    )
  );

create policy "Users can remove poems from collections"
  on poem_collections for delete
  using (
    exists (
      select 1 from poems where poems.id = poem_collections.poem_id and poems.user_id = auth.uid()
    )
  );

-- ─── Section Dividers ────────────────────────────────────────

create policy "Users can view own section dividers"
  on section_dividers for select
  using (
    exists (
      select 1 from collections where collections.id = section_dividers.collection_id and collections.user_id = auth.uid()
    )
  );

create policy "Users can create section dividers"
  on section_dividers for insert
  with check (
    exists (
      select 1 from collections where collections.id = section_dividers.collection_id and collections.user_id = auth.uid()
    )
  );

create policy "Users can update section dividers"
  on section_dividers for update
  using (
    exists (
      select 1 from collections where collections.id = section_dividers.collection_id and collections.user_id = auth.uid()
    )
  );

create policy "Users can delete section dividers"
  on section_dividers for delete
  using (
    exists (
      select 1 from collections where collections.id = section_dividers.collection_id and collections.user_id = auth.uid()
    )
  );

-- ─── Poem Reviews ────────────────────────────────────────────

create policy "Users can view own reviews"
  on poem_reviews for select using (auth.uid() = user_id);

create policy "Users can create own reviews"
  on poem_reviews for insert with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on poem_reviews for update using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on poem_reviews for delete using (auth.uid() = user_id);

-- ─── Audio Recitations ──────────────────────────────────────

create policy "Users can view own recitations"
  on audio_recitations for select using (auth.uid() = user_id);

create policy "Users can create own recitations"
  on audio_recitations for insert with check (auth.uid() = user_id);

create policy "Users can delete own recitations"
  on audio_recitations for delete using (auth.uid() = user_id);

-- ─── User Prompt State ──────────────────────────────────────

create policy "Users can view own prompt state"
  on user_prompt_state for select using (auth.uid() = user_id);

create policy "Users can upsert own prompt state"
  on user_prompt_state for insert with check (auth.uid() = user_id);

create policy "Users can update own prompt state"
  on user_prompt_state for update using (auth.uid() = user_id);

-- ─── Daily Poem Cache ───────────────────────────────────────

create policy "Users can view own daily cache"
  on daily_poem_cache for select using (auth.uid() = user_id);

create policy "Users can upsert own daily cache"
  on daily_poem_cache for insert with check (auth.uid() = user_id);

create policy "Users can update own daily cache"
  on daily_poem_cache for update using (auth.uid() = user_id);

-- ─── User Settings ──────────────────────────────────────────

create policy "Users can view own settings"
  on user_settings for select using (auth.uid() = user_id);

create policy "Users can upsert own settings"
  on user_settings for insert with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on user_settings for update using (auth.uid() = user_id);

-- ─── Global Read-Only Tables ────────────────────────────────

create policy "Anyone authenticated can read writing prompts"
  on writing_prompts for select using (auth.uid() is not null);

create policy "Anyone authenticated can read poetry forms"
  on poetry_forms for select using (auth.uid() is not null);

create policy "Anyone authenticated can read bundled poems"
  on bundled_poems for select using (auth.uid() is not null);

-- ============================================================
-- UTILITY FUNCTIONS
-- ============================================================

-- Search poems by title, body, or tags for the current user
create or replace function search_poems(search_query text)
returns setof poems as $$
begin
  return query
    select *
    from poems
    where user_id = auth.uid()
      and (
        title ilike '%' || search_query || '%'
        or body ilike '%' || search_query || '%'
        or search_query = any(tags)
      )
    order by updated_at desc;
end;
$$ language plpgsql security definer;

-- Get a random daily poem from bundled_poems
create or replace function get_random_bundled_poem()
returns setof bundled_poems as $$
begin
  return query
    select * from bundled_poems
    order by random()
    limit 1;
end;
$$ language plpgsql security definer;

-- Get a random writing prompt, optionally filtered by category
create or replace function get_random_prompt(cat prompt_category default null)
returns setof writing_prompts as $$
begin
  if cat is null then
    return query select * from writing_prompts order by random() limit 1;
  else
    return query select * from writing_prompts where category = cat order by random() limit 1;
  end if;
end;
$$ language plpgsql security definer;

-- Create default collections for a new user
create or replace function create_default_collections(p_user_id uuid)
returns void as $$
begin
  -- "All Poems" collection
  insert into collections (user_id, name, description, cover_color, icon_name, is_default)
  values (p_user_id, 'All Poems', 'Every poem you have written or imported.', '#1A1A2E', 'book', true);

  -- "Drafts" collection
  insert into collections (user_id, name, description, cover_color, icon_name, is_default)
  values (p_user_id, 'Drafts', 'Poems in progress.', '#F59E0B', 'edit-3', true);
end;
$$ language plpgsql security definer;

-- Auto-create default collections when a profile is created
create or replace function handle_new_profile_collections()
returns trigger as $$
begin
  perform create_default_collections(new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_collections
  after insert on profiles
  for each row execute function handle_new_profile_collections();

-- ============================================================
-- DONE
-- ============================================================
-- After running this migration:
-- 1. Seed writing_prompts (200+ rows)
-- 2. Seed poetry_forms (13 rows)
-- 3. Seed bundled_poems (50+ classic poems)
-- ============================================================
