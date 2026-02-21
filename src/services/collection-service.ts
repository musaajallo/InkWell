/**
 * Collection Service
 *
 * Supabase CRUD operations for collections, anthologies, and section dividers.
 */

import { supabase } from '@/lib/supabase';
import type { Collection, AnthologyMeta, SectionDivider } from '@/types';
import type {
  CollectionRow,
  CollectionInsert,
  CollectionUpdate,
  SectionDividerRow,
} from '@/types/database';

// ─── Row <-> App Type Converters ─────────────────────────────

function rowToCollection(row: CollectionRow, dividers: SectionDivider[]): Collection {
  const anthologyMeta: AnthologyMeta | null = row.is_anthology
    ? {
        subtitle: row.anthology_subtitle ?? '',
        authorBio: row.anthology_author_bio ?? '',
        dedication: row.anthology_dedication ?? '',
        foreword: row.anthology_foreword ?? '',
        coverImageUri: row.anthology_cover_image ?? null,
        includeReviews: row.anthology_include_reviews,
        publishedAt: row.anthology_published_at ?? null,
      }
    : null;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    coverColor: row.cover_color,
    iconName: row.icon_name,
    isDefault: row.is_default,
    isAnthology: row.is_anthology,
    anthologyMeta,
    poemOrder: row.poem_order,
    sectionDividers: dividers,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function dividerRowToAppType(row: SectionDividerRow): SectionDivider {
  return {
    afterPoemId: row.after_poem_id,
    heading: row.heading,
    subtitle: row.subtitle ?? undefined,
  };
}

// ─── Service Functions ───────────────────────────────────────

/** Fetch all collections for the current user. */
export async function fetchCollections(): Promise<Collection[]> {
  const { data: rows, error } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(`fetchCollections: ${error.message}`);
  if (!rows || rows.length === 0) return [];

  // Fetch all section dividers in one query
  const collectionIds = rows.map((r: CollectionRow) => r.id);
  const { data: dividerRows } = await supabase
    .from('section_dividers')
    .select('*')
    .in('collection_id', collectionIds);

  const dividerMap = new Map<string, SectionDivider[]>();
  for (const d of (dividerRows ?? []) as SectionDividerRow[]) {
    const existing = dividerMap.get(d.collection_id) ?? [];
    existing.push(dividerRowToAppType(d));
    dividerMap.set(d.collection_id, existing);
  }

  return rows.map((r: CollectionRow) =>
    rowToCollection(r, dividerMap.get(r.id) ?? [])
  );
}

/** Fetch a single collection by ID. */
export async function fetchCollectionById(id: string): Promise<Collection | null> {
  const { data: row, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`fetchCollectionById: ${error.message}`);
  }

  const { data: dividerRows } = await supabase
    .from('section_dividers')
    .select('*')
    .eq('collection_id', id);

  const dividers = ((dividerRows ?? []) as SectionDividerRow[]).map(dividerRowToAppType);
  return rowToCollection(row as CollectionRow, dividers);
}

/** Create a new collection. Returns the created Collection. */
export async function createCollection(input: {
  userId: string;
  name: string;
  description?: string;
  coverColor?: string;
  iconName?: string;
}): Promise<Collection> {
  const insert: CollectionInsert = {
    user_id: input.userId,
    name: input.name,
    description: input.description ?? '',
    cover_color: input.coverColor ?? '#0F3460',
    icon_name: input.iconName ?? 'folder',
  };

  const { data: row, error } = await supabase
    .from('collections')
    .insert(insert)
    .select()
    .single();

  if (error) throw new Error(`createCollection: ${error.message}`);
  return rowToCollection(row as CollectionRow, []);
}

/** Update a collection. */
export async function updateCollection(
  id: string,
  input: { name?: string; description?: string; coverColor?: string; iconName?: string }
): Promise<void> {
  const update: CollectionUpdate = {};
  if (input.name !== undefined) update.name = input.name;
  if (input.description !== undefined) update.description = input.description;
  if (input.coverColor !== undefined) update.cover_color = input.coverColor;
  if (input.iconName !== undefined) update.icon_name = input.iconName;

  const { error } = await supabase.from('collections').update(update).eq('id', id);
  if (error) throw new Error(`updateCollection: ${error.message}`);
}

/** Delete a non-default collection. Returns false if default. */
export async function deleteCollection(id: string): Promise<boolean> {
  // Check if default first
  const { data: row } = await supabase
    .from('collections')
    .select('is_default')
    .eq('id', id)
    .single();

  if ((row as CollectionRow | null)?.is_default) return false;

  const { error } = await supabase.from('collections').delete().eq('id', id);
  if (error) throw new Error(`deleteCollection: ${error.message}`);
  return true;
}

/** Set the poem order for a collection. */
export async function setPoemOrder(collectionId: string, poemIds: string[]): Promise<void> {
  const { error } = await supabase
    .from('collections')
    .update({ poem_order: poemIds })
    .eq('id', collectionId);
  if (error) throw new Error(`setPoemOrder: ${error.message}`);
}

/** Promote a collection to an anthology. */
export async function promoteToAnthology(
  collectionId: string,
  meta: AnthologyMeta
): Promise<void> {
  const update: CollectionUpdate = {
    is_anthology: true,
    anthology_subtitle: meta.subtitle,
    anthology_author_bio: meta.authorBio,
    anthology_dedication: meta.dedication,
    anthology_foreword: meta.foreword,
    anthology_cover_image: meta.coverImageUri,
    anthology_include_reviews: meta.includeReviews,
    anthology_published_at: meta.publishedAt,
  };

  const { error } = await supabase
    .from('collections')
    .update(update)
    .eq('id', collectionId);
  if (error) throw new Error(`promoteToAnthology: ${error.message}`);
}

/** Update anthology metadata. */
export async function updateAnthologyMeta(
  collectionId: string,
  meta: Partial<AnthologyMeta>
): Promise<void> {
  const update: CollectionUpdate = {};
  if (meta.subtitle !== undefined) update.anthology_subtitle = meta.subtitle;
  if (meta.authorBio !== undefined) update.anthology_author_bio = meta.authorBio;
  if (meta.dedication !== undefined) update.anthology_dedication = meta.dedication;
  if (meta.foreword !== undefined) update.anthology_foreword = meta.foreword;
  if (meta.coverImageUri !== undefined) update.anthology_cover_image = meta.coverImageUri;
  if (meta.includeReviews !== undefined) update.anthology_include_reviews = meta.includeReviews;
  if (meta.publishedAt !== undefined) update.anthology_published_at = meta.publishedAt;

  const { error } = await supabase
    .from('collections')
    .update(update)
    .eq('id', collectionId);
  if (error) throw new Error(`updateAnthologyMeta: ${error.message}`);
}

/** Add or replace a section divider. */
export async function upsertSectionDivider(
  collectionId: string,
  divider: SectionDivider
): Promise<void> {
  const { error } = await supabase
    .from('section_dividers')
    .upsert(
      {
        collection_id: collectionId,
        after_poem_id: divider.afterPoemId,
        heading: divider.heading,
        subtitle: divider.subtitle ?? null,
      },
      { onConflict: 'collection_id,after_poem_id' }
    );
  if (error) throw new Error(`upsertSectionDivider: ${error.message}`);
}

/** Remove a section divider. */
export async function removeSectionDivider(
  collectionId: string,
  afterPoemId: string
): Promise<void> {
  const { error } = await supabase
    .from('section_dividers')
    .delete()
    .eq('collection_id', collectionId)
    .eq('after_poem_id', afterPoemId);
  if (error) throw new Error(`removeSectionDivider: ${error.message}`);
}

/** Get the user's default collections (All Poems, Drafts). */
export async function fetchDefaultCollections(): Promise<Collection[]> {
  const { data: rows, error } = await supabase
    .from('collections')
    .select('*')
    .eq('is_default', true);

  if (error) throw new Error(`fetchDefaultCollections: ${error.message}`);
  return (rows as CollectionRow[]).map((r) => rowToCollection(r, []));
}
