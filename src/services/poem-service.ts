/**
 * Poem Service
 *
 * Supabase CRUD operations for poems and the poem_collections join table.
 */

import { supabase } from '@/lib/supabase';
import type {
  Poem,
  PoemSource,
  PoemStatus,
  PoetryFormSlug,
} from '@/types';
import type { PoemRow, PoemInsert, PoemUpdate } from '@/types/database';
import { countWords, countLines } from '@/utils/text-formatter';

// ─── Row <-> App Type Converters ─────────────────────────────

function rowToPoem(row: PoemRow, collectionIds: string[]): Poem {
  let source: PoemSource;
  switch (row.source_type) {
    case 'imported':
      source = {
        type: 'imported',
        method: (row.import_method ?? 'text') as Poem['source'] extends { type: 'imported'; method: infer M } ? M : never,
        author: row.source_author ?? undefined,
        sourceUrl: row.source_url ?? undefined,
        sourceBook: row.source_book ?? undefined,
        importedAt: row.imported_at ?? new Date().toISOString(),
      };
      break;
    case 'dictated':
      source = { type: 'dictated' };
      break;
    case 'poetrydb':
      source = { type: 'poetrydb', poetryDbId: row.poetrydb_id ?? undefined };
      break;
    default:
      source = { type: 'original' };
  }

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    tags: row.tags,
    formType: (row.form_type as PoetryFormSlug) ?? null,
    status: row.status,
    isFavorite: row.is_favorite,
    wordCount: row.word_count,
    lineCount: row.line_count,
    collectionIds,
    promptId: row.prompt_id,
    source,
    review: null, // Reviews loaded separately
    recitationIds: [], // Recitations loaded separately
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function poemToInsert(poem: {
  userId: string;
  title?: string;
  body?: string;
  formType?: PoetryFormSlug | null;
  source?: PoemSource;
  promptId?: string | null;
}): PoemInsert {
  const body = poem.body ?? '';
  const insert: PoemInsert = {
    user_id: poem.userId,
    title: poem.title ?? '',
    body,
    word_count: countWords(body),
    line_count: countLines(body),
    form_type: poem.formType ?? null,
    prompt_id: poem.promptId ?? null,
    source_type: poem.source?.type ?? 'original',
  };

  if (poem.source?.type === 'imported') {
    insert.import_method = poem.source.method;
    insert.source_author = poem.source.author ?? null;
    insert.source_url = poem.source.sourceUrl ?? null;
    insert.source_book = poem.source.sourceBook ?? null;
    insert.imported_at = poem.source.importedAt ?? new Date().toISOString();
  } else if (poem.source?.type === 'poetrydb') {
    insert.poetrydb_id = poem.source.poetryDbId ?? null;
  }

  return insert;
}

// ─── Service Functions ───────────────────────────────────────

/** Fetch all poems for the current user. */
export async function fetchPoems(): Promise<Poem[]> {
  const { data: rows, error } = await supabase
    .from('poems')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`fetchPoems: ${error.message}`);
  if (!rows || rows.length === 0) return [];

  // Fetch all collection links in one query
  const poemIds = rows.map((r: PoemRow) => r.id);
  const { data: links, error: linkError } = await supabase
    .from('poem_collections')
    .select('poem_id, collection_id')
    .in('poem_id', poemIds);

  if (linkError) throw new Error(`fetchPoems links: ${linkError.message}`);

  const collectionMap = new Map<string, string[]>();
  for (const link of links ?? []) {
    const existing = collectionMap.get(link.poem_id) ?? [];
    existing.push(link.collection_id);
    collectionMap.set(link.poem_id, existing);
  }

  return rows.map((r: PoemRow) => rowToPoem(r, collectionMap.get(r.id) ?? []));
}

/** Fetch a single poem by ID. */
export async function fetchPoemById(id: string): Promise<Poem | null> {
  const { data: row, error } = await supabase
    .from('poems')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`fetchPoemById: ${error.message}`);
  }

  const { data: links } = await supabase
    .from('poem_collections')
    .select('collection_id')
    .eq('poem_id', id);

  const collectionIds = (links ?? []).map((l: { collection_id: string }) => l.collection_id);
  return rowToPoem(row as PoemRow, collectionIds);
}

/** Create a new poem. Returns the created Poem. */
export async function createPoem(input: {
  userId: string;
  title?: string;
  body?: string;
  formType?: PoetryFormSlug | null;
  source?: PoemSource;
  promptId?: string | null;
  collectionIds?: string[];
}): Promise<Poem> {
  const insert = poemToInsert(input);

  const { data: row, error } = await supabase
    .from('poems')
    .insert(insert)
    .select()
    .single();

  if (error) throw new Error(`createPoem: ${error.message}`);

  // Link to collections
  const collectionIds = input.collectionIds ?? [];
  if (collectionIds.length > 0) {
    const links = collectionIds.map((cid) => ({
      poem_id: (row as PoemRow).id,
      collection_id: cid,
    }));
    const { error: linkError } = await supabase
      .from('poem_collections')
      .insert(links);
    if (linkError) throw new Error(`createPoem links: ${linkError.message}`);
  }

  return rowToPoem(row as PoemRow, collectionIds);
}

/** Update a poem. */
export async function updatePoem(
  id: string,
  input: {
    title?: string;
    body?: string;
    tags?: string[];
    formType?: PoetryFormSlug | null;
    status?: PoemStatus;
    isFavorite?: boolean;
    promptId?: string | null;
  }
): Promise<void> {
  const update: PoemUpdate = {};

  if (input.title !== undefined) update.title = input.title;
  if (input.body !== undefined) {
    update.body = input.body;
    update.word_count = countWords(input.body);
    update.line_count = countLines(input.body);
  }
  if (input.tags !== undefined) update.tags = input.tags;
  if (input.formType !== undefined) update.form_type = input.formType;
  if (input.status !== undefined) update.status = input.status;
  if (input.isFavorite !== undefined) update.is_favorite = input.isFavorite;
  if (input.promptId !== undefined) update.prompt_id = input.promptId;

  const { error } = await supabase
    .from('poems')
    .update(update)
    .eq('id', id);

  if (error) throw new Error(`updatePoem: ${error.message}`);
}

/** Delete a poem. */
export async function deletePoem(id: string): Promise<void> {
  const { error } = await supabase.from('poems').delete().eq('id', id);
  if (error) throw new Error(`deletePoem: ${error.message}`);
}

/** Toggle favorite status. */
export async function toggleFavorite(id: string, current: boolean): Promise<void> {
  const { error } = await supabase
    .from('poems')
    .update({ is_favorite: !current })
    .eq('id', id);
  if (error) throw new Error(`toggleFavorite: ${error.message}`);
}

/** Add a poem to a collection. */
export async function addPoemToCollection(poemId: string, collectionId: string): Promise<void> {
  const { error } = await supabase
    .from('poem_collections')
    .upsert({ poem_id: poemId, collection_id: collectionId });
  if (error) throw new Error(`addPoemToCollection: ${error.message}`);
}

/** Remove a poem from a collection. */
export async function removePoemFromCollection(poemId: string, collectionId: string): Promise<void> {
  const { error } = await supabase
    .from('poem_collections')
    .delete()
    .eq('poem_id', poemId)
    .eq('collection_id', collectionId);
  if (error) throw new Error(`removePoemFromCollection: ${error.message}`);
}

/** Search poems by title, body, or tags using the DB function. */
export async function searchPoems(query: string): Promise<Poem[]> {
  const { data: rows, error } = await supabase.rpc('search_poems', {
    search_query: query,
  });

  if (error) throw new Error(`searchPoems: ${error.message}`);
  if (!rows || rows.length === 0) return [];

  const poemIds = rows.map((r: PoemRow) => r.id);
  const { data: links } = await supabase
    .from('poem_collections')
    .select('poem_id, collection_id')
    .in('poem_id', poemIds);

  const collectionMap = new Map<string, string[]>();
  for (const link of links ?? []) {
    const existing = collectionMap.get(link.poem_id) ?? [];
    existing.push(link.collection_id);
    collectionMap.set(link.poem_id, existing);
  }

  return rows.map((r: PoemRow) => rowToPoem(r, collectionMap.get(r.id) ?? []));
}
