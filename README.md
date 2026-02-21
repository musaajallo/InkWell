# InkWell

A mobile poetry writing app built with React Native (Expo) and TypeScript. InkWell provides a focused, distraction-free environment for composing poems with poet-specific tools, AI-powered reviews, audio recitations, and anthology publishing.

## Features

- **Poet-Focused Editor** — Syllable counter, line numbering, rhyme suggestions, form-aware guidance
- **Collections & Anthologies** — Organize poems into collections; promote to publishable anthologies with sections, dedications, and forewords
- **Daily Inspiration** — Curated classic poems and categorized writing prompts refreshed daily
- **AI Poem Reviews** — Claude-powered analysis of themes, literary devices, structure, and interpretation
- **Audio Recitations** — Device TTS and ElevenLabs AI voice generation with pace control
- **Poem Import** — Paste text, OCR from photos, file import, URL fetch, PoetryDB search
- **Voice-to-Text** — Hands-free dictation for writing poems
- **Sharing** — Export poems as plain text or styled images with optional watermark

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54, React Native 0.81 |
| Language | TypeScript 5.x (strict mode) |
| Navigation | expo-router (file-based routing) |
| State | Zustand with AsyncStorage persistence |
| Backend | Supabase (Auth, PostgreSQL, RLS) |
| AI Reviews | Anthropic Claude API |
| Audio | expo-speech + ElevenLabs API |
| Voice Input | expo-speech-recognition |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your device (for development)

### Setup

```bash
# Clone the repo
git clone git@github.com:musaajallo/InkWell.git
cd InkWell

# Install dependencies
npm install

# Create your .env file from the template
cp .env.example .env
# Edit .env and add your Supabase credentials

# Start the dev server
npx expo start
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

API keys for Claude and ElevenLabs are entered by users in-app via Settings and stored securely in device SecureStore.

## Project Structure

```
inkwell/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab navigator (Home, Write, Library, Discover, Settings)
│   ├── poem/[id]/          # Poem detail, review, recitation
│   ├── collection/[id].tsx # Collection detail
│   ├── forms/[slug].tsx    # Poetry form detail
│   ├── import.tsx          # Poem import wizard
│   ├── profile.tsx         # User profile
│   ├── sign-in.tsx         # Authentication
│   └── sign-up.tsx
├── src/
│   ├── components/         # Reusable UI components
│   ├── constants/          # Design system tokens (colors, spacing, fonts)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Supabase client
│   ├── services/           # Supabase CRUD + external API clients
│   ├── stores/             # Zustand state stores
│   ├── types/              # TypeScript interfaces and types
│   └── utils/              # Helpers (date, text, syllable counter)
├── supabase/
│   └── migrations/         # Database schema and seed data
└── docs/
    └── requirements.md     # Full product requirements document
```

## Database

The Supabase database includes 13 tables with Row-Level Security policies, auto-triggers for user onboarding, full-text search with trigram indexes, and seed data (13 poetry forms, 210 writing prompts, 55 classic poems).

## License

Private — All rights reserved.
