# InkWell - Product Requirements Document

**Author:** Musa Ajallo
**Date:** February 17, 2026
**Version:** 1.1
**Status:** Draft
**Last Updated:** February 17, 2026

---

## 1. Overview

### 1.1 Product Summary

InkWell is a mobile poetry writing app designed for aspiring poets and writers. It provides a focused, distraction-free environment for composing poems with poet-specific tools (syllable counter, rhyme suggestions, line numbering), voice-to-text dictation for hands-free writing, and the ability to append to existing poems via voice. Poets can generate AI-powered reviews and analyses of their work, create professional-quality audio recitations for sharing to platforms like Spotify and YouTube, organize poems into collections and publish them as anthologies, import poems from external sources, and draw daily inspiration from curated poems and writing prompts.

### 1.2 Mission Statement

Empower aspiring poets with a beautiful, purpose-built writing tool that makes the craft of poetry accessible, organized, and shareable -- from first draft to published anthology.

### 1.3 Target Audience

- **Primary:** Aspiring poets and writers actively working on their craft
- **Secondary:** Hobbyist writers who enjoy poetry as a creative outlet
- **Tertiary:** Poetry enthusiasts who read and collect poems for inspiration

### 1.4 Platform

- **Phase 1:** Android (primary target)
- **Phase 2:** iOS
- **Phase 3:** Web (via Expo)

---

## 2. Tech Stack

Based on the [React Native + TypeScript Guide](../../../guides/react-native-typescript-guide/00-index.md):

| Layer | Technology | Reference |
|-------|-----------|-----------|
| Framework | Expo SDK 54+ | Guide: `01-project-setup.md` |
| Language | TypeScript 5.x (strict mode) | Guide: `03-typescript-fundamentals.md` |
| Navigation | expo-router (file-based routing) | Guide: `05-navigation.md` |
| Styling | StyleSheet + design tokens + expo-linear-gradient | Guide: `07-styling.md` |
| State | useState/useReducer + Zustand (with persist) | Guide: `06-state-management.md` |
| Storage | AsyncStorage (poems, settings) + SecureStore (API keys) | Guide: `09-storage-persistence.md` |
| API | PoetryDB + Datamuse + OpenAI + ElevenLabs | Guide: `08-api-data-fetching.md` |
| Animations | react-native-reanimated | Guide: `07-styling.md` |
| TTS | expo-speech (playback) + ElevenLabs API (recitation gen) | -- |
| STT | expo-speech-recognition (voice-to-text) | -- |
| AI | OpenAI API (poem review & analysis) | -- |
| OCR | react-native-mlkit-ocr (poem import from photo) | -- |
| Testing | Jest + @testing-library/react-native | Guide: `10-testing.md` |
| Build | EAS Build | Guide: `12-deployment.md` |
| Icons | @expo/vector-icons (Feather set) | -- |

### 2.1 Project Conventions

All conventions follow the guide:

- **File naming:** kebab-case (`poem-editor.tsx`, `use-syllable-count.ts`)
- **Components:** Named function exports, PascalCase names
- **Imports:** `@/*` path alias, grouped (React/RN -> Expo -> external -> project)
- **Constants:** `UPPER_SNAKE_CASE`, storage keys prefixed with `@inkwell_`
- **Styling:** `StyleSheet.create()` at file bottom, centralized design tokens
- **Error handling:** `try/catch` with typed narrowing, graceful fallbacks
- **Types:** Strict mode, no `any`, `interface` for objects, `type` for unions

---

## 3. Information Architecture

### 3.1 App Structure

```
app/
  (tabs)/
    index.tsx              # Home - Daily poem + recent drafts
    write.tsx              # Poem editor (new poem)
    library.tsx            # Collections, anthologies & saved poems
    discover.tsx           # Writing prompts + poetry forms guide
    settings.tsx           # App settings
  poem/
    [id].tsx               # View/edit a single poem
    [id]/review.tsx        # Poem review & analysis screen
    [id]/recitation.tsx    # Audio recitation generation screen
  collection/
    [id].tsx               # View poems in a collection
  anthology/
    [id].tsx               # Anthology editor (arrange, metadata, preview)
    [id]/preview.tsx       # Full anthology preview (book-style reading)
  forms/
    [slug].tsx             # Poetry form detail (sonnet, haiku, etc.)
  import.tsx               # Poem import wizard
  share-preview.tsx        # Share preview modal
  _layout.tsx              # Root layout
```

### 3.2 Navigation Structure

```
Tab Navigator (5 tabs)
  +-- Home (index)
  +-- Write (editor with voice-to-text)
  +-- Library
  |     +-- Collection Detail [id]
  |     +-- Anthology Editor [id]
  |     |     +-- Anthology Preview
  |     +-- Poem Detail [id]
  |           +-- Poem Review
  |           +-- Audio Recitation
  +-- Discover
  |     +-- Poetry Form Detail [slug]
  +-- Settings

Modals
  +-- Share Preview
  +-- Import Wizard
```

---

## 4. Core Features

### 4.1 Poet-Focused Editor (P0 - Must Have)

The centerpiece of InkWell. A clean, distraction-free writing experience with tools designed specifically for poets.

**Requirements:**

| ID | Requirement | Priority |
|----|------------|----------|
| ED-01 | Multi-line text input with monospace font option and serif font option | P0 |
| ED-02 | Automatic line numbering in the left gutter | P0 |
| ED-03 | Real-time syllable counter per line (displayed alongside line numbers) | P0 |
| ED-04 | Stanza break insertion (visual separator between stanzas) | P0 |
| ED-05 | Rhyme suggestion panel: tap a line-ending word to see rhyming words | P1 |
| ED-06 | Word count and line count displayed in a subtle toolbar | P0 |
| ED-07 | Auto-save drafts every 30 seconds to AsyncStorage | P0 |
| ED-08 | Title field above the poem body | P0 |
| ED-09 | Tag/label poems with metadata (mood, form type, theme) | P1 |
| ED-10 | Undo/redo support | P1 |
| ED-11 | Font size adjustment (small, medium, large) | P1 |
| ED-12 | Full-screen "zen mode" -- hides all toolbars except the text area | P2 |
| ED-13 | Dark/light theme support in editor | P0 |
| ED-14 | Voice-to-text input: mic button in toolbar to dictate poem lines | P0 |
| ED-15 | Voice append mode: open an existing poem and dictate new lines that are appended at the cursor position or end of poem | P0 |
| ED-16 | Voice dictation shows real-time transcription preview before committing text | P1 |
| ED-17 | Voice punctuation commands: "new line", "new stanza", "period", "comma" interpreted as formatting | P1 |

**Syllable Counter Logic:**
- Use a dictionary-based approach (CMU Pronouncing Dictionary or similar)
- Fallback to heuristic vowel-cluster counting for unknown words
- Display count at the end of each line or in the gutter
- Highlight lines that match a target syllable count (useful for haiku, sonnets)

**Rhyme Suggestions:**
- Source: Datamuse API (free, no key required) - `https://api.datamuse.com/words?rel_rhy={word}`
- Show top 10-15 rhyming words in a dismissible panel
- Group by perfect rhyme, near rhyme, slant rhyme
- Cache results locally to reduce API calls

### 4.2 Poem Collections & Anthologies (P0 - Must Have)

Organize poems into themed collections and promote collections into publishable anthologies.

| ID | Requirement | Priority |
|----|------------|----------|
| CL-01 | Create, rename, and delete collections | P0 |
| CL-02 | Add/remove poems to/from collections | P0 |
| CL-03 | A poem can belong to multiple collections | P0 |
| CL-04 | Default "All Poems" and "Drafts" collections (cannot be deleted) | P0 |
| CL-05 | Custom cover color or icon for each collection | P1 |
| CL-06 | Sort poems within a collection (by date, title, manual order) | P1 |
| CL-07 | Search poems across all collections by title, content, or tags | P0 |
| CL-08 | Collection statistics (poem count, total word count) | P2 |
| CL-09 | Promote a collection to an **Anthology** with additional metadata (title, subtitle, author bio, dedication, foreword) | P0 |
| CL-10 | Anthology editor: arrange poem order with drag-and-drop, add section dividers/chapter headings between poems | P0 |
| CL-11 | Anthology preview: read through the anthology as a continuous scrollable document with page-break styling | P1 |
| CL-12 | Export anthology as PDF with cover page, table of contents, formatted poems, and page numbers | P1 |
| CL-13 | Export anthology as EPUB for e-readers | P2 |
| CL-14 | Share anthology PDF via system share sheet | P1 |
| CL-15 | Anthology cover image: choose from templates or upload a custom image | P2 |

**Anthology Structure:**
- An anthology is a collection that has been "promoted" -- it retains all collection functionality but gains publishing-oriented metadata and export capabilities
- The anthology editor provides a book-like editing experience: title page, optional dedication, optional foreword, ordered poems with optional section dividers
- Poems within an anthology can include their individual reviews/analyses as endnotes (see 4.9)

### 4.3 Daily Poem (P0 - Must Have)

A curated or randomly selected poem displayed on the home screen each day for inspiration.

| ID | Requirement | Priority |
|----|------------|----------|
| DP-01 | Display one featured poem per day on the Home tab | P0 |
| DP-02 | Source from PoetryDB API (random poem endpoint) | P0 |
| DP-03 | Fallback to local bundled collection if offline | P0 |
| DP-04 | Cache daily poem so it persists for 24 hours | P0 |
| DP-05 | "Save to Collection" action on daily poem | P0 |
| DP-06 | Show poet name, title, and full text with elegant typography | P0 |
| DP-07 | Text-to-speech button to hear the daily poem read aloud | P1 |
| DP-08 | Swipe to load a different random poem (optional discovery) | P2 |

### 4.4 Writing Prompts (P0 - Must Have)

Daily or on-demand prompts to inspire new poems.

| ID | Requirement | Priority |
|----|------------|----------|
| WP-01 | Display a new writing prompt each day on the Discover tab | P0 |
| WP-02 | "Write from this prompt" button that opens editor with prompt as context | P0 |
| WP-03 | Prompt categories: emotion, nature, memory, abstract, story, observation | P1 |
| WP-04 | Bundle 200+ prompts locally (no API dependency) | P0 |
| WP-05 | "Shuffle" button to get a new random prompt | P0 |
| WP-06 | Save favorite prompts for later | P1 |
| WP-07 | Track which prompts have been used | P2 |

### 4.5 Poetry Forms Guide (P1 - Should Have)

A reference section teaching common poetry forms with structure templates.

| ID | Requirement | Priority |
|----|------------|----------|
| PF-01 | Cover at least 12 poetry forms: haiku, tanka, sonnet (Shakespearean & Petrarchan), limerick, villanelle, ghazal, free verse, acrostic, ballad, ode, elegy, couplet | P0 |
| PF-02 | Each form page shows: name, origin, structure rules, syllable/line requirements, rhyme scheme, 1-2 examples | P0 |
| PF-03 | "Try this form" button that opens editor with a structure template pre-loaded (line count, syllable targets) | P1 |
| PF-04 | All content bundled locally (no API needed) | P0 |
| PF-05 | Searchable list of forms | P1 |
| PF-06 | Mark forms as "learned" or "favorite" | P2 |

### 4.6 Text-to-Speech (P1 - Should Have)

Listen to poems read aloud using device TTS.

| ID | Requirement | Priority |
|----|------------|----------|
| TS-01 | Play/pause button on any poem (own or daily poem) | P0 |
| TS-02 | Use `expo-speech` for TTS | P0 |
| TS-03 | Adjustable speech rate (slow, normal, fast) | P1 |
| TS-04 | Highlight current line being read (karaoke-style) | P2 |
| TS-05 | Voice selection (if multiple voices available on device) | P2 |

### 4.7 Sharing (P1 - Should Have)

Share poems externally via system share sheet.

| ID | Requirement | Priority |
|----|------------|----------|
| SH-01 | Share poem as plain text via system share sheet (WhatsApp, SMS, email, etc.) | P0 |
| SH-02 | Share poem as a styled image (poem text rendered on a themed background) | P1 |
| SH-03 | Share preview screen to choose format and background before sharing | P1 |
| SH-04 | Watermark/branding option: "Written in InkWell" footer (toggleable) | P2 |
| SH-05 | Copy poem text to clipboard | P0 |
| SH-06 | Export collection as a single text/PDF file | P2 |

### 4.8 Voice-to-Text Writing (P0 - Must Have)

Compose and extend poems using voice dictation, enabling a hands-free, stream-of-consciousness writing flow.

| ID | Requirement | Priority |
|----|------------|----------|
| VT-01 | Mic button in editor toolbar to start/stop voice dictation | P0 |
| VT-02 | Real-time transcription: show spoken words appearing in the editor as they are recognized | P0 |
| VT-03 | **Append mode:** when opening an existing poem, voice input inserts text at the cursor position or appends to the end of the poem | P0 |
| VT-04 | Voice command recognition for formatting: "new line" inserts `\n`, "new stanza" inserts `\n\n`, "period/comma/question mark" inserts punctuation | P1 |
| VT-05 | Visual recording indicator (pulsing mic icon, waveform animation) while dictating | P0 |
| VT-06 | Transcription preview: show interim (unconfirmed) text in a different style (e.g., lighter color) before it finalizes | P1 |
| VT-07 | Edit transcribed text immediately after dictation ends (don't auto-commit -- let user review) | P1 |
| VT-08 | Support continuous dictation sessions (no arbitrary time limit, re-start automatically if the recognizer stops) | P1 |
| VT-09 | Language setting for speech recognition (default: English) | P2 |
| VT-10 | Offline speech recognition when supported by the device OS | P2 |

**Technical Approach:**
- Use `expo-speech-recognition` (or `@react-native-voice/voice`) for on-device speech-to-text
- Android: leverages Google Speech Recognition (available offline on most devices with downloaded language packs)
- iOS: leverages Apple Speech framework (on-device since iOS 13)
- Voice commands are processed client-side with a simple keyword matcher before inserting text
- Append mode reuses the same editor component -- voice input is just another input method alongside the keyboard

**Voice Append UX Flow:**
1. User opens an existing poem from Library
2. Taps the mic button in the editor toolbar
3. Cursor moves to end of poem (or stays at current position if user placed it)
4. Spoken words appear in real-time at the cursor position
5. User taps mic again to stop
6. Transcribed text is shown with a "Confirm" / "Redo" prompt
7. On confirm, text is committed and auto-save triggers

### 4.9 Poem Review & Analysis (P1 - Should Have)

Generate an AI-powered review and analysis of a poem -- covering themes, literary devices, structure, and interpretation. Useful for self-reflection, learning, and including as endnotes in anthologies.

| ID | Requirement | Priority |
|----|------------|----------|
| RV-01 | "Review this poem" action button on any completed poem | P0 |
| RV-02 | Generate a structured review containing: **summary** (what the poem is about), **themes** identified, **literary devices** used (metaphor, alliteration, imagery, etc.), **structure analysis** (form, meter, rhyme scheme), and **overall interpretation** | P0 |
| RV-03 | Display the review in a dedicated review screen below/alongside the poem | P0 |
| RV-04 | Save the review attached to the poem (one review per poem, can regenerate) | P0 |
| RV-05 | Edit/annotate the AI-generated review with personal notes | P1 |
| RV-06 | Option to include the review as endnotes when the poem is part of an anthology | P1 |
| RV-07 | Review tone selector: "academic", "casual", "encouraging" (adjusts the language style) | P2 |
| RV-08 | Highlight specific lines referenced in the review (tap a review point to scroll to the relevant line) | P2 |
| RV-09 | Generate a review for an entire collection/anthology (high-level thematic analysis across all poems) | P2 |

**Technical Approach:**
- Use OpenAI API (GPT-4o-mini for cost efficiency) with a structured prompt
- Send poem text + metadata (title, tags, form type) to the API
- Response is parsed into a typed `PoemReview` object with sections
- Reviews are cached locally -- no re-generation unless the poem text changes or user manually triggers regeneration
- Rate limit: cap at N reviews per day on free tier to manage API costs

**Review Prompt Structure:**
```
Analyze the following poem. Provide:
1. A brief summary of what the poem is about (2-3 sentences)
2. Key themes (list with brief explanation)
3. Literary devices used (identify specific examples from the text)
4. Structure analysis (form, meter, rhyme scheme if any)
5. Overall interpretation and emotional impact

Poem Title: {title}
Form: {formType}
---
{body}
```

### 4.10 Audio Recitation Generation (P1 - Should Have)

Generate a professional-quality audio recitation of a poem using AI text-to-speech, exportable as an audio file for sharing to Spotify, YouTube, or other platforms.

| ID | Requirement | Priority |
|----|------------|----------|
| AR-01 | "Generate Recitation" button on any completed poem | P0 |
| AR-02 | Voice selection: choose from multiple AI voices (e.g., male/female, warm/dramatic/soft) | P0 |
| AR-03 | Preview the generated audio in-app before saving/exporting | P0 |
| AR-04 | Adjust recitation parameters: pace (slow/normal/dramatic), pauses between stanzas, emphasis style | P1 |
| AR-05 | Save generated audio file locally (MP3 or WAV) | P0 |
| AR-06 | Export/share audio via system share sheet (share to any app) | P0 |
| AR-07 | **Spotify integration:** export audio with metadata (title, author, poem text as description) in a format ready for upload to Spotify for Podcasters / Spotify for Artists | P1 |
| AR-08 | **YouTube integration:** generate a simple video (audio + styled poem text as static or scrolling background) and export as MP4 for YouTube upload | P1 |
| AR-09 | Add optional background music/ambience to the recitation (nature sounds, soft piano, silence) from bundled audio tracks | P2 |
| AR-10 | Batch generation: generate recitations for all poems in a collection/anthology | P2 |
| AR-11 | Recitation history: list of previously generated audio files with playback | P1 |
| AR-12 | Share audio with InkWell watermark audio tag (optional, toggleable): brief "Recorded with InkWell" at the end | P2 |

**Technical Approach:**
- **Primary:** ElevenLabs API for high-quality, expressive AI voices
  - Supports voice selection, pacing controls, SSML-like markup for pauses/emphasis
  - Returns MP3 audio
  - Pricing: pay-per-character (free tier: ~10,000 chars/month; paid plans scale up)
- **Fallback:** Google Cloud Text-to-Speech API (more affordable, slightly less expressive)
- **Video generation (YouTube):** Use `ffmpeg` via a cloud function or `expo-av` + `react-native-video` to composite audio + a styled image (generated with `react-native-view-shot`) into an MP4
- Audio files are saved to device storage via `expo-file-system`
- Metadata (title, author, duration) is embedded in the audio file where format supports it

**Spotify/YouTube Export Flow:**
1. User generates a recitation and previews it
2. Taps "Share to Spotify" or "Share to YouTube"
3. **Spotify:** App generates MP3 with proper metadata, opens system share sheet targeted at Spotify for Podcasters / file manager (user uploads manually to their Spotify podcast)
4. **YouTube:** App generates MP4 (poem image + audio), opens system share sheet targeted at YouTube app (user uploads as a short/video)
5. Both flows include suggested title, description (poem text), and tags

### 4.11 Poem Import (P0 - Must Have)

Import poems from external sources to build a personal library alongside original work.

| ID | Requirement | Priority |
|----|------------|----------|
| IM-01 | Import from plain text: paste or type poem text manually into an import form | P0 |
| IM-02 | Import from file: select a `.txt` file from device storage and parse it as a poem | P0 |
| IM-03 | Import from clipboard: detect poem-like text on clipboard and offer a quick-import action | P1 |
| IM-04 | Import from photo/image: use OCR (text recognition) to extract poem text from a photo of a printed poem | P1 |
| IM-05 | Import from PoetryDB: search by title or author and import directly into the library | P0 |
| IM-06 | Bulk import: select multiple `.txt` files or paste multiple poems separated by a delimiter (e.g., `---`) | P1 |
| IM-07 | Import wizard: after text is extracted, show an editable preview where user can set title, tags, form type, and assign to a collection before saving | P0 |
| IM-08 | Mark imported poems with an `imported` source flag (distinguish from original work) | P0 |
| IM-09 | Store original source attribution (author, source URL/book, date) for imported poems | P0 |
| IM-10 | Import from URL: fetch a webpage and attempt to extract poem text from it | P2 |

**Technical Approach:**
- File import: use `expo-document-picker` to select `.txt` files
- OCR: use `expo-camera` + Google ML Kit (via `react-native-mlkit-ocr`) or `expo-image-manipulator` + a cloud OCR API
- PoetryDB import: reuse existing API client, add a search-and-import flow
- Clipboard detection: check clipboard contents on app focus via `expo-clipboard`, offer import if text looks like a poem (heuristic: multiple short lines)
- All imports go through the import wizard for user review before saving

---

## 5. Data Models

### 5.1 Poem

```typescript
export interface Poem {
  id: string;                    // UUID
  title: string;
  body: string;                  // Raw poem text (stanzas separated by \n\n)
  tags: string[];                // e.g., ['haiku', 'nature', 'melancholy']
  formType: PoetryFormSlug | null; // e.g., 'haiku', 'sonnet', null for free verse
  status: 'draft' | 'complete';
  isFavorite: boolean;
  wordCount: number;
  lineCount: number;
  collectionIds: string[];       // Many-to-many relationship
  promptId: string | null;       // Writing prompt that inspired this poem
  source: PoemSource;            // Origin of the poem
  review: PoemReview | null;     // AI-generated review (null if not yet generated)
  recitationIds: string[];       // IDs of generated AudioRecitation objects
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}

export type PoemSource =
  | { type: 'original' }
  | { type: 'imported'; method: ImportMethod; author?: string; sourceUrl?: string; sourceBook?: string; importedAt: string }
  | { type: 'dictated' }        // Written primarily via voice-to-text
  | { type: 'poetrydb'; poetryDbId?: string };

export type ImportMethod = 'text' | 'file' | 'clipboard' | 'ocr' | 'poetrydb' | 'url';
```

### 5.2 Collection

```typescript
export interface Collection {
  id: string;                    // UUID
  name: string;
  description: string;
  coverColor: string;            // Hex color
  iconName: string;              // Feather icon name
  isDefault: boolean;            // true for "All Poems" and "Drafts"
  isAnthology: boolean;          // true if promoted to anthology
  anthologyMeta: AnthologyMeta | null; // Only set when isAnthology is true
  poemOrder: string[];           // Ordered poem IDs for manual sorting
  sectionDividers: SectionDivider[]; // Chapter headings between poems (anthologies)
  createdAt: string;
  updatedAt: string;
}

export interface AnthologyMeta {
  subtitle: string;
  authorBio: string;
  dedication: string;
  foreword: string;
  coverImageUri: string | null;  // Custom cover image
  includeReviews: boolean;       // Include poem reviews as endnotes
  publishedAt: string | null;    // ISO 8601, set when first exported
}

export interface SectionDivider {
  afterPoemId: string;           // Divider appears after this poem
  heading: string;               // Section/chapter title
  subtitle?: string;
}
```

### 5.3 Poem Review

```typescript
export interface PoemReview {
  id: string;                    // UUID
  poemId: string;
  summary: string;               // What the poem is about (2-3 sentences)
  themes: ReviewTheme[];
  literaryDevices: LiteraryDevice[];
  structureAnalysis: string;     // Form, meter, rhyme scheme analysis
  interpretation: string;        // Overall interpretation and emotional impact
  tone: ReviewTone;              // Tone used for generation
  personalNotes: string;         // User's own annotations
  generatedAt: string;           // ISO 8601
  poemBodyHash: string;          // Hash of poem body at generation time (detect changes)
}

export interface ReviewTheme {
  name: string;
  explanation: string;
}

export interface LiteraryDevice {
  device: string;                // e.g., 'metaphor', 'alliteration'
  example: string;               // Quoted text from the poem
  explanation: string;
}

export type ReviewTone = 'academic' | 'casual' | 'encouraging';
```

### 5.4 Audio Recitation

```typescript
export interface AudioRecitation {
  id: string;                    // UUID
  poemId: string;
  fileUri: string;               // Local file path to MP3/WAV
  videoUri: string | null;       // Local file path to MP4 (if YouTube video generated)
  voiceId: string;               // ElevenLabs voice ID used
  voiceName: string;             // Human-readable voice name
  pace: RecitationPace;
  backgroundTrack: string | null; // ID of ambient track, null for silence
  durationSeconds: number;
  fileSizeBytes: number;
  generatedAt: string;           // ISO 8601
}

export type RecitationPace = 'slow' | 'normal' | 'dramatic';
```

### 5.5 Writing Prompt

```typescript
export interface WritingPrompt {
  id: string;
  text: string;                  // The prompt itself
  category: PromptCategory;
  isFavorite: boolean;
  isUsed: boolean;
}

export type PromptCategory =
  | 'emotion'
  | 'nature'
  | 'memory'
  | 'abstract'
  | 'story'
  | 'observation';
```

### 5.6 Poetry Form

```typescript
export interface PoetryForm {
  slug: PoetryFormSlug;          // URL-friendly identifier
  name: string;                  // Display name
  origin: string;                // Brief history
  description: string;           // What makes this form unique
  rules: string[];               // Structural rules
  rhymeScheme: string | null;    // e.g., 'ABAB CDCD EFEF GG'
  lineCount: number | null;      // Fixed line count (null if variable)
  syllablePattern: number[] | null; // Per-line syllable counts (e.g., [5, 7, 5] for haiku)
  examples: PoetryFormExample[];
}

export interface PoetryFormExample {
  title: string;
  author: string;
  text: string;
}

export type PoetryFormSlug =
  | 'haiku'
  | 'tanka'
  | 'sonnet-shakespearean'
  | 'sonnet-petrarchan'
  | 'limerick'
  | 'villanelle'
  | 'ghazal'
  | 'free-verse'
  | 'acrostic'
  | 'ballad'
  | 'ode'
  | 'elegy'
  | 'couplet';
```

### 5.7 App Settings

```typescript
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  editorFontFamily: 'monospace' | 'serif';
  editorFontSize: 'small' | 'medium' | 'large';
  showSyllableCounter: boolean;
  showLineNumbers: boolean;
  autoSaveInterval: number;      // Milliseconds (default: 30000)
  ttsRate: number;               // 0.5 - 2.0 (default: 1.0)
  shareWatermark: boolean;       // Show "Written in InkWell" on shared images/audio
  defaultCollectionId: string;   // Where new poems are saved
  voiceRecognitionLang: string;  // BCP-47 language code (default: 'en-US')
  recitationVoiceId: string;     // Default ElevenLabs voice
  recitationPace: RecitationPace; // Default pace
  reviewTone: ReviewTone;        // Default review tone
}
```

---

## 6. Storage Schema

All keys prefixed with `@inkwell_` per project conventions.

| Key | Type | Description |
|-----|------|-------------|
| `@inkwell_poems` | `Poem[]` | All user-created and imported poems |
| `@inkwell_collections` | `Collection[]` | All collections (including anthologies) |
| `@inkwell_recitations` | `AudioRecitation[]` | Audio recitation metadata (files stored via expo-file-system) |
| `@inkwell_prompts_state` | `{ favorites: string[], used: string[] }` | Prompt interaction state |
| `@inkwell_settings` | `AppSettings` | User preferences |
| `@inkwell_daily_poem` | `{ poem: DailyPoem, fetchedAt: string }` | Cached daily poem |
| `@inkwell_rhyme_cache` | `Record<string, string[]>` | Cached Datamuse rhyme results |
| `@inkwell_review_cache` | `Record<string, PoemReview>` | Cached AI reviews keyed by poemId |
| `@inkwell_api_keys` | (SecureStore) `{ openai?: string, elevenlabs?: string }` | User-provided API keys for AI services |

---

## 7. API Integration

### 7.1 PoetryDB (Daily Poem & Discovery & Import)

- **Base URL:** `https://poetrydb.org`
- **No API key required**
- **Endpoints used:**
  - `GET /random` -- Random poem for daily feature
  - `GET /author/{name}` -- Browse by author (also used for import search)
  - `GET /title/{title}` -- Search by title (also used for import search)
- **Timeout:** 10 seconds (per guide `API_TIMEOUT` constant)
- **Caching:** Cache daily poem for 24 hours
- **Fallback:** 50+ bundled classic poems for offline use

### 7.2 Datamuse (Rhyme Suggestions)

- **Base URL:** `https://api.datamuse.com`
- **No API key required**
- **Endpoints used:**
  - `GET /words?rel_rhy={word}` -- Perfect rhymes
  - `GET /words?rel_nry={word}` -- Near rhymes
- **Timeout:** 5 seconds
- **Caching:** Cache rhyme results in AsyncStorage (they don't change)
- **Rate limit:** Max 100,000 requests/day (more than sufficient)

### 7.3 OpenAI (Poem Review & Analysis)

- **Base URL:** `https://api.openai.com/v1`
- **API key required** (user provides their own key, stored in SecureStore)
- **Model:** `gpt-4o-mini` (cost-efficient, sufficient quality for reviews)
- **Endpoints used:**
  - `POST /chat/completions` -- Generate poem review
- **Timeout:** 30 seconds (longer responses)
- **Cost estimate:** ~$0.0001-0.001 per review (very affordable)
- **Rate limit (app-side):** Free tier: 3 reviews/day; Premium: unlimited
- **Fallback:** Show error message if API key not configured or quota exceeded

### 7.4 ElevenLabs (Audio Recitation Generation)

- **Base URL:** `https://api.elevenlabs.io/v1`
- **API key required** (user provides their own key, stored in SecureStore)
- **Endpoints used:**
  - `GET /voices` -- List available voices
  - `POST /text-to-speech/{voice_id}` -- Generate audio from poem text
- **Timeout:** 60 seconds (audio generation can be slow)
- **Cost estimate:** ~$0.01-0.03 per poem (depending on length)
- **Rate limit (app-side):** Free tier: 2 recitations/day; Premium: unlimited
- **Audio format:** MP3 (default), 44.1kHz
- **Fallback:** Google Cloud TTS API as alternative provider

### 7.5 On-Device Speech Recognition (Voice-to-Text)

- **No API/key required** -- uses device OS capabilities
- **Android:** Google Speech Recognition service (offline packs available)
- **iOS:** Apple Speech framework
- **Library:** `expo-speech-recognition`
- **No rate limits** (runs locally)

---

## 8. Screens & UI Specification

### 8.1 Home Tab (index)

- **Top section:** Daily Poem card with elegant typography, poet name, TTS button
- **Below:** "Start Writing" CTA button (tap to open editor, long-press for voice mode)
- **Below:** Recent drafts list (last 5 poems with status badges)
- **Below:** Today's writing prompt (compact card)
- **Pull-to-refresh** to get a new daily poem

### 8.2 Write Tab

- Opens the poet-focused editor for a new poem
- Top bar: title field, form selector dropdown (optional)
- Main area: poem body with line numbers and syllable counts in gutter
- Bottom toolbar: word count, line count, undo/redo, rhyme panel toggle, **mic button** (voice-to-text)
- **Voice mode:** pulsing mic icon, waveform visualization, interim text in lighter color
- Auto-saves to "Drafts" collection
- "Done" button to mark as complete and choose collection

### 8.3 Library Tab

- Grid or list toggle for collections
- Default collections pinned at top: "All Poems", "Drafts"
- **Anthologies section** with distinct styling (book-like cards with cover colors)
- User collections below with cover color, icon, poem count
- FAB (floating action button) with options: new collection, **import poem**
- Search bar at top (searches poem titles, content, and tags)
- Filter toggle: "My Poems" / "Imported" / "All"

### 8.4 Discover Tab

- **Section 1:** Today's Writing Prompt (full card with category label, shuffle button)
- **Section 2:** Poetry Forms (horizontal scrollable cards)
- **Section 3:** Browse by prompt category (emotion, nature, memory, etc.)
- **Section 4:** "Import a Poem" quick action card

### 8.5 Settings Tab

- Theme selection (light / dark / system)
- Editor preferences (font family, font size, syllable counter toggle, line numbers toggle)
- Voice-to-text settings (language)
- TTS settings (speech rate)
- **AI Services:** OpenAI API key input, ElevenLabs API key input (with validation)
- **Recitation defaults:** voice selection, pace, background track
- **Review defaults:** tone selector
- Sharing preferences (watermark toggle)
- About / version info
- "Reset to Defaults" option

### 8.6 Poem Review Screen (poem/[id]/review)

- Poem text displayed at top (scrollable, with line numbers)
- Review sections below: Summary, Themes, Literary Devices, Structure, Interpretation
- Each literary device highlights the referenced line in the poem when tapped
- Personal notes text field at bottom
- "Regenerate" button, tone selector
- "Include in Anthology" toggle (if poem belongs to an anthology)

### 8.7 Audio Recitation Screen (poem/[id]/recitation)

- Poem text displayed at top
- Voice selector (cards with voice name + preview button)
- Pace selector (slow / normal / dramatic)
- Background track selector (silence, nature, piano, etc.)
- "Generate" button with progress indicator
- Audio player (play/pause, scrubber, duration)
- Export buttons: "Share Audio", "Share to Spotify", "Share to YouTube"
- Recitation history list (previously generated versions)

### 8.8 Import Wizard (import)

- Step 1: Choose source (text, file, photo, PoetryDB search, clipboard, URL)
- Step 2: Extract/enter text (OCR preview, file contents, PoetryDB search results, etc.)
- Step 3: Review & edit (editable poem text, title, author/attribution fields)
- Step 4: Metadata (tags, form type, collection assignment)
- Step 5: Confirm & save

### 8.9 Anthology Editor (anthology/[id])

- Header: anthology title, subtitle, author bio fields
- Optional: dedication text, foreword text
- Ordered poem list with drag-and-drop reordering
- "Add Section Divider" button between poems (chapter heading + optional subtitle)
- "Preview" button to open full anthology reading view
- "Export PDF" / "Export EPUB" buttons
- "Share" button

---

## 9. Design System

### 9.1 Color Palette

```
Primary:       #1A1A2E   (deep ink navy)
Secondary:     #E94560   (warm crimson accent)
Tertiary:      #0F3460   (rich indigo)
Background:    #FEFEFE   (light) / #0D0D1A (dark)
Surface:       #FFFFFF   (light) / #1A1A2E (dark)
Text Primary:  #1A1A2E   (light) / #F5F5F5 (dark)
Text Secondary:#6B7280   (light) / #9CA3AF (dark)
Success:       #10B981
Warning:       #F59E0B
Error:         #EF4444
Voice Active:  #E94560   (pulsing mic indicator)
Imported:      #8B5CF6   (purple accent for imported poems)
```

### 9.2 Typography

- **Headings:** Serif font (e.g., Playfair Display or system serif) -- literary feel
- **Body / UI:** Sans-serif (system default)
- **Editor - Serif mode:** Georgia or similar serif
- **Editor - Mono mode:** JetBrains Mono or system monospace
- **Poem display:** Serif with generous line-height (1.6-1.8)
- **Anthology titles:** Larger serif, tracked out (letter-spacing)

### 9.3 Spacing Scale

```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
xxl: 48px
```

### 9.4 Animation

- Screen transitions: `FadeIn`, `SlideInRight` (react-native-reanimated)
- Card interactions: subtle scale on press (0.97)
- Editor toolbar: `FadeInDown` on toggle
- Daily poem: `FadeIn` with staggered line reveal
- **Voice recording:** pulsing mic icon (scale 1.0-1.2, opacity 0.7-1.0 loop), waveform bars animation
- **Review generation:** skeleton loading with shimmer effect
- **Audio playback:** progress bar animation, line highlight scroll
- Haptic feedback on: save, share, collection actions, voice start/stop (expo-haptics)

---

## 10. Monetization (Freemium)

### 10.1 Free Tier

- Create unlimited poems
- Up to 3 custom collections (plus "All Poems" and "Drafts")
- Daily poem and daily writing prompt
- Basic sharing (plain text only)
- Poetry forms guide (full access)
- Text-to-speech (device TTS)
- Syllable counter and line numbers
- Voice-to-text writing (unlimited -- runs on-device)
- Import poems (all methods)
- 3 AI reviews per day (requires own API key)
- 2 audio recitations per day (requires own API key)

### 10.2 Premium Tier ("InkWell Pro")

- **Unlimited collections and anthologies**
- **Rhyme suggestion panel**
- **Image sharing** (styled poem images with background themes)
- **Anthology export** (PDF and EPUB)
- **Zen mode** (distraction-free writing)
- **Unlimited AI reviews** per day
- **Unlimited audio recitations** per day
- **YouTube video generation** (MP4 with poem text + audio)
- **Background music/ambience** for recitations
- **Batch recitation generation** for collections
- **Additional writing prompt categories** or unlimited prompt shuffles
- **No ads** (if ads are added to free tier later)
- **Priority access** to new features

### 10.3 Pricing (TBD)

- Monthly: ~$3.99/month
- Annual: ~$24.99/year (save ~48%)
- One-time lifetime: ~$49.99

Note: Users still provide their own API keys for OpenAI and ElevenLabs. Premium unlocks higher usage limits and additional export features within the app. Future option: bundle API credits so users don't need their own keys.

### 10.4 Implementation

- Use RevenueCat (or Expo in-app purchases) for subscription management
- Gate premium features with a simple `isPremium` check from user settings/state
- Show upgrade prompts contextually (e.g., when user tries to create 4th collection, hits daily review limit, or tries to export anthology)

---

## 11. Project Structure

Based on guide `02-project-structure.md`:

```
InkWell/
  app/
    (tabs)/
      index.tsx                 # Home screen
      write.tsx                 # Editor screen
      library.tsx               # Collections + anthologies list
      discover.tsx              # Prompts + forms
      settings.tsx              # Settings
      _layout.tsx               # Tab layout
    poem/
      [id].tsx                  # Poem detail/edit
      [id]/review.tsx           # Poem review screen
      [id]/recitation.tsx       # Audio recitation screen
    collection/
      [id].tsx                  # Collection detail
    anthology/
      [id].tsx                  # Anthology editor
      [id]/preview.tsx          # Anthology preview (book reading)
    forms/
      [slug].tsx                # Poetry form detail
    import.tsx                  # Import wizard
    share-preview.tsx           # Share modal
    _layout.tsx                 # Root layout
  components/
    poem-card.tsx               # Poem preview card
    poem-editor.tsx             # Core editor component
    poem-editor-toolbar.tsx     # Editor bottom toolbar
    poem-editor-gutter.tsx      # Line numbers + syllable counts
    voice-input-overlay.tsx     # Voice recording UI (mic, waveform, interim text)
    voice-command-handler.tsx    # Interprets voice commands (new line, punctuation)
    collection-card.tsx         # Collection preview card
    anthology-card.tsx          # Anthology preview card (book-style)
    anthology-poem-list.tsx     # Draggable poem list for anthology editor
    section-divider-editor.tsx  # Edit section headings between poems
    daily-poem-card.tsx         # Daily poem display
    writing-prompt-card.tsx     # Prompt display card
    poetry-form-card.tsx        # Form preview card
    review-display.tsx          # Renders PoemReview sections
    review-theme-card.tsx       # Individual theme in review
    literary-device-card.tsx    # Individual device in review
    recitation-player.tsx       # Audio player for recitations
    recitation-voice-card.tsx   # Voice selector card
    import-source-picker.tsx    # Import method selector
    import-preview.tsx          # Editable poem preview during import
    ocr-camera.tsx              # Camera view for OCR import
    search-bar.tsx              # Search input
    tts-controls.tsx            # Text-to-speech player (device TTS)
    share-button.tsx            # Share action button
    premium-gate.tsx            # Premium feature gate wrapper
    api-key-input.tsx           # Secure API key input field
    ui/
      themed-text.tsx
      themed-view.tsx
      icon-button.tsx
      fab.tsx
      tag-chip.tsx
      empty-state.tsx
      waveform-visualizer.tsx   # Animated waveform bars
      skeleton-loader.tsx       # Shimmer loading placeholder
      step-indicator.tsx        # Import wizard step progress
  constants/
    theme.ts                    # Light/dark color scheme
  hooks/
    use-poems.ts                # CRUD operations on poems
    use-collections.ts          # Collection management
    use-anthologies.ts          # Anthology promotion + metadata management
    use-daily-poem.ts           # Daily poem fetching + caching
    use-writing-prompts.ts      # Prompt selection + state
    use-syllable-count.ts       # Syllable counting logic
    use-rhyme-suggestions.ts    # Datamuse API integration
    use-voice-input.ts          # Speech recognition start/stop/result handling
    use-voice-commands.ts       # Parse voice commands (new line, punctuation)
    use-poem-review.ts          # Generate + cache AI reviews
    use-recitation.ts           # Generate + manage audio recitations
    use-poem-import.ts          # Import flow state management
    use-tts.ts                  # Text-to-speech controls (device TTS)
    use-auto-save.ts            # Auto-save timer for editor
    use-theme-color.ts          # Theme-aware color hook
    use-color-scheme.ts         # System color scheme detection
    use-premium.ts              # Premium status check
    use-api-keys.ts             # Manage OpenAI/ElevenLabs keys from SecureStore
  src/
    services/
      poem-service.ts           # Poem CRUD + storage
      collection-service.ts     # Collection CRUD + storage
      anthology-service.ts      # Anthology promotion, export (PDF/EPUB)
      poetry-db-api.ts          # PoetryDB API client
      datamuse-api.ts           # Datamuse rhyme API client
      openai-api.ts             # OpenAI API client (poem reviews)
      elevenlabs-api.ts         # ElevenLabs API client (audio recitations)
      speech-recognition-service.ts # Voice-to-text wrapper
      import-service.ts         # Poem import logic (file, OCR, clipboard, URL)
      ocr-service.ts            # ML Kit OCR wrapper
      settings-service.ts       # App settings persistence
      tts-service.ts            # expo-speech wrapper (device TTS)
      recitation-service.ts     # Audio file management (save, delete, metadata)
      video-service.ts          # MP4 generation (poem image + audio)
      share-service.ts          # Share sheet + image generation
      pdf-export-service.ts     # Anthology PDF generation
    data/
      bundled-poems.ts          # Offline poem collection
      writing-prompts.ts        # 200+ bundled prompts
      poetry-forms.ts           # 13 poetry form definitions
      ambient-tracks.ts         # Background music metadata for recitations
    styles/
      colors.ts                 # Color tokens
      typography.ts             # Font families, sizes, line heights
      spacing.ts                # Spacing scale
      shadows.ts                # Elevation/shadow tokens
    utils/
      syllable-counter.ts       # Syllable counting algorithm
      text-formatter.ts         # Poem text formatting utilities
      voice-command-parser.ts   # Parse "new line", "comma", etc. from speech text
      poem-hash.ts              # Hash poem body for review cache invalidation
      uuid.ts                   # UUID generation
      date.ts                   # Date formatting helpers
      constants.ts              # STORAGE_KEYS, API_TIMEOUT, CACHE_EXPIRY, etc.
  assets/
    fonts/                      # Custom fonts (if any)
    images/                     # App icon, splash, share backgrounds
    audio/                      # Bundled ambient tracks for recitations
```

---

## 12. Development Phases

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Scaffold project, core editor, local storage, and voice input.

- [ ] Scaffold project using `new-expo-project.sh` from the guide
- [ ] Set up design tokens (colors, typography, spacing)
- [ ] Implement `poem-service.ts` with AsyncStorage CRUD
- [ ] Implement `collection-service.ts` with default collections
- [ ] Build the poem editor component (text input, title, line numbers)
- [ ] Integrate voice-to-text (`expo-speech-recognition`) into editor
- [ ] Implement voice append mode (insert at cursor / end of poem)
- [ ] Build the Library tab (list collections, view poems)
- [ ] Build poem detail screen (view/edit)
- [ ] Implement auto-save

### Phase 2: Intelligence & Import (Weeks 3-4)

**Goal:** Add poet-specific tooling, writing aids, and import.

- [ ] Implement syllable counter algorithm
- [ ] Add syllable display to editor gutter
- [ ] Integrate Datamuse API for rhyme suggestions
- [ ] Build rhyme suggestion panel UI
- [ ] Build poetry forms data and guide screens
- [ ] Implement "Try this form" editor templates
- [ ] Add word/line count to editor toolbar
- [ ] Build import wizard (text, file, clipboard, PoetryDB search)
- [ ] Integrate OCR for photo import (`react-native-mlkit-ocr`)

### Phase 3: Inspiration & Review (Weeks 5-6)

**Goal:** Daily poem, writing prompts, discovery, and AI poem reviews.

- [ ] Integrate PoetryDB API
- [ ] Build daily poem feature with caching
- [ ] Bundle offline poem collection (50+ poems)
- [ ] Create 200+ writing prompts data
- [ ] Build Discover tab (prompts + forms browsing)
- [ ] Build Home tab (daily poem + recent drafts + prompt)
- [ ] Implement text-to-speech with expo-speech
- [ ] Integrate OpenAI API for poem reviews
- [ ] Build poem review screen (summary, themes, devices, structure)
- [ ] Implement review caching and regeneration

### Phase 4: Audio & Anthologies (Weeks 7-8)

**Goal:** Audio recitation generation, anthologies, and sharing.

- [ ] Integrate ElevenLabs API for audio recitation generation
- [ ] Build recitation screen (voice selection, pace, preview, export)
- [ ] Implement audio file storage and playback
- [ ] Build YouTube video generation (poem image + audio to MP4)
- [ ] Implement Spotify/YouTube export flows
- [ ] Build anthology promotion flow (collection -> anthology)
- [ ] Build anthology editor (reorder, section dividers, metadata)
- [ ] Build anthology preview (book-style reading)
- [ ] Implement PDF export for anthologies

### Phase 5: Polish & Share (Weeks 9-10)

**Goal:** Sharing, themes, settings, and UI polish.

- [ ] Implement sharing (plain text + styled image via share sheet)
- [ ] Build share preview screen
- [ ] Implement dark/light theme toggle
- [ ] Build Settings screen (including API key inputs)
- [ ] Add animations (screen transitions, card interactions, voice waveform, haptics)
- [ ] Add search across poems
- [ ] Tag/label system for poems
- [ ] UI polish pass (empty states, loading states, error states, skeleton loaders)

### Phase 6: Monetization & Launch (Weeks 11-12)

**Goal:** Premium features, testing, and store submission.

- [ ] Implement premium gate and upgrade flow
- [ ] Integrate RevenueCat / in-app purchases
- [ ] Gate premium features (unlimited collections/anthologies, image sharing, recitations, reviews, zen mode, export)
- [ ] Write tests (unit tests for services, component tests for editor)
- [ ] Performance optimization (guide `11-performance.md`)
- [ ] Build Android APK/AAB via EAS Build
- [ ] Prepare Play Store listing (screenshots, description, metadata)
- [ ] Submit to Google Play Store

---

## 13. Dependencies

### Production

| Package | Purpose |
|---------|---------|
| `expo` ~54 | Core framework |
| `expo-router` | File-based navigation |
| `expo-speech` | Text-to-speech playback (device TTS) |
| `expo-speech-recognition` | Voice-to-text input |
| `expo-haptics` | Tactile feedback |
| `expo-sharing` | System share sheet |
| `expo-file-system` | Save/read audio files and exports |
| `expo-document-picker` | File import (.txt) |
| `expo-clipboard` | Clipboard import detection |
| `expo-camera` | Camera access for OCR import |
| `expo-av` | Audio playback for recitations |
| `expo-linear-gradient` | Background gradients |
| `expo-font` | Custom fonts |
| `expo-secure-store` | Store API keys securely |
| `expo-print` | PDF generation for anthologies |
| `react-native-reanimated` | Animations |
| `react-native-mlkit-ocr` | On-device OCR for photo import |
| `react-native-view-shot` | Capture poem as image for sharing / video |
| `react-native-draggable-flatlist` | Drag-and-drop poem ordering in anthologies |
| `@react-native-async-storage/async-storage` | Local persistence |
| `@expo/vector-icons` | Feather icons |
| `zustand` | State management (with persist middleware) |
| `uuid` | Generate unique IDs |

### Development

| Package | Purpose |
|---------|---------|
| `typescript` ~5.x | Type checking |
| `eslint` + `eslint-config-expo` | Linting |
| `jest` + `jest-expo` | Testing |
| `@testing-library/react-native` | Component testing |

### Future

| Package | Purpose |
|---------|---------|
| `react-native-purchases` (RevenueCat) | Subscription management |
| `react-native-video` | Video compositing for YouTube export |

---

## 14. Success Metrics

| Metric | Target (6 months post-launch) |
|--------|-------------------------------|
| Play Store rating | >= 4.3 stars |
| Monthly active users | 1,000+ |
| Poems written per user/month | >= 5 |
| Poems imported per user/month | >= 2 |
| Daily poem engagement rate | >= 40% of DAU |
| Voice-to-text adoption rate | >= 25% of active writers |
| Reviews generated per user/month | >= 3 |
| Recitations generated per user/month | >= 2 |
| Anthology creation rate | >= 10% of users with 10+ poems |
| Premium conversion rate | >= 5-8% |
| Crash-free rate | >= 99.5% |
| App startup time | < 2 seconds |

---

## 15. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| PoetryDB API goes down | Daily poem feature breaks | Bundle 50+ offline poems as fallback |
| Datamuse API rate limit | Rhyme suggestions fail | Cache aggressively, limit to premium users |
| Syllable counter inaccuracy | Poor user experience | Use dictionary-first approach, allow manual override |
| AsyncStorage size limits (6MB on Android) | Data loss for prolific writers | Monitor storage usage, implement export, consider SQLite migration path |
| Device TTS quality varies | Poems sound unnatural | Allow rate adjustment, show disclaimer; premium users get ElevenLabs recitations |
| OpenAI API costs escalate | Revenue impact from free-tier reviews | Cap free-tier at 3/day, require user's own API key, use gpt-4o-mini |
| ElevenLabs API costs escalate | Revenue impact from recitations | Cap free-tier at 2/day, require user's own API key, offer Google Cloud TTS fallback |
| User doesn't have API keys | AI features inaccessible | Clear setup guide in settings, link to API key registration, consider bundling credits in premium |
| Voice recognition accuracy | Frustrating dictation experience | Allow immediate editing of transcription, "Confirm/Redo" flow, offline recognition |
| OCR accuracy on printed poems | Bad imports from photos | Always show editable preview, let user correct before saving |
| Audio file storage bloat | Device storage fills up | Show storage usage, allow deleting old recitations, compress audio |
| Premium conversion too low | Revenue insufficient | Experiment with gate placement, add more premium value, bundled API credits |

---

## 16. Out of Scope (v1)

The following are explicitly **not** in scope for version 1:

- User accounts / authentication / cloud sync
- In-app social features (profiles, followers, feed, likes, comments)
- AI-generated poetry or AI writing assistance (review only, not generation)
- Collaboration (co-writing poems)
- Multiple languages (English only for v1)
- Tablet-optimized layouts
- Widget (home screen poem widget)
- Push notifications
- Direct Spotify/YouTube API integration (uploads are manual via share sheet)
- Bundled API credits (users provide their own keys for v1)

---

## 17. Open Questions

1. **Font licensing:** Should we bundle a custom serif font (Playfair Display is free via Google Fonts) or rely on system fonts?
2. **Offline poem selection:** Which 50 classic poems should be bundled? Focus on public domain English-language poetry?
3. **Syllable dictionary:** Ship a trimmed CMU dictionary (~10KB) with the app, or compute heuristically?
4. **Image share backgrounds:** How many background themes for styled poem images? 5? 10?
5. **Analytics:** Add anonymous usage analytics (e.g., Expo Analytics or PostHog) for understanding feature usage?
6. **API key UX:** Should we provide a first-time setup wizard that walks users through getting OpenAI and ElevenLabs API keys? Or make it optional/discoverable?
7. **ElevenLabs voice curation:** Pre-select a curated set of 5-8 voices suitable for poetry, or expose the full voice library?
8. **Ambient tracks:** How many background music tracks to bundle for recitations? License implications?
9. **Anthology templates:** Should we provide pre-designed anthology templates (cover styles, font pairings, layout options)?
10. **EPUB export:** Priority relative to PDF? Should we support both in v1 or defer EPUB to v2?
11. **Video generation:** On-device vs cloud function for MP4 compositing? On-device is simpler but slower; cloud function requires a backend.

---

*This document should be reviewed and updated as development progresses. Each phase completion should trigger a review of upcoming phase requirements.*
