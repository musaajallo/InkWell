/**
 * ElevenLabs API Client
 *
 * Generates AI-powered audio recitations of poems.
 * User must provide their own API key (stored in SecureStore).
 *
 * Base URL: https://api.elevenlabs.io/v1
 * Endpoints: GET /voices, POST /text-to-speech/{voice_id}
 */

import { API_URLS, API_TIMEOUT } from '@/utils/constants';
import type { RecitationPace } from '@/types';

// ─── Types ───────────────────────────────────────────────────

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description: string | null;
  preview_url: string | null;
  labels: Record<string, string>;
}

interface VoicesResponse {
  voices: ElevenLabsVoice[];
}

interface TTSRequestBody {
  text: string;
  model_id: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

// ─── Pace Mappings ───────────────────────────────────────────

/**
 * Map our RecitationPace to ElevenLabs voice settings.
 * - slow: high stability, moderate style (measured, careful reading)
 * - normal: balanced settings
 * - dramatic: lower stability, higher style (more expressive)
 */
const PACE_SETTINGS: Record<
  RecitationPace,
  { stability: number; similarity_boost: number; style: number }
> = {
  slow: { stability: 0.85, similarity_boost: 0.75, style: 0.3 },
  normal: { stability: 0.65, similarity_boost: 0.75, style: 0.45 },
  dramatic: { stability: 0.4, similarity_boost: 0.8, style: 0.7 },
};

/**
 * Add SSML-like pauses between stanzas based on pace.
 * ElevenLabs doesn't support full SSML, but pauses are handled
 * by adding ellipsis or newlines.
 */
function formatTextForPace(text: string, pace: RecitationPace): string {
  // Add extra pause markers between stanzas (double newlines)
  const pauseMarker = pace === 'slow' ? '\n\n...\n\n' : pace === 'dramatic' ? '\n\n..\n\n' : '\n\n';
  return text.replace(/\n\n+/g, pauseMarker);
}

// ─── Helpers ─────────────────────────────────────────────────

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number = API_TIMEOUT.ELEVENLABS
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Public API ──────────────────────────────────────────────

/** List available voices. */
export async function listVoices(apiKey: string): Promise<ElevenLabsVoice[]> {
  const response = await fetchWithTimeout(
    `${API_URLS.ELEVENLABS}/voices`,
    {
      headers: {
        'xi-api-key': apiKey,
      },
    },
    10_000
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs: HTTP ${response.status} - Failed to fetch voices`);
  }

  const data: VoicesResponse = await response.json();
  return data.voices;
}

/**
 * Generate audio from text using a specific voice.
 * Returns the audio as an ArrayBuffer (MP3 format).
 *
 * The caller is responsible for saving the buffer to a file
 * via expo-file-system.
 */
export async function generateSpeech(
  apiKey: string,
  voiceId: string,
  text: string,
  pace: RecitationPace = 'normal'
): Promise<ArrayBuffer> {
  const settings = PACE_SETTINGS[pace];
  const formattedText = formatTextForPace(text, pace);

  const body: TTSRequestBody = {
    text: formattedText,
    model_id: 'eleven_monolingual_v1',
    voice_settings: {
      stability: settings.stability,
      similarity_boost: settings.similarity_boost,
      style: settings.style,
      use_speaker_boost: true,
    },
  };

  const response = await fetchWithTimeout(
    `${API_URLS.ELEVENLABS}/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody?.detail?.message) errorMsg = errBody.detail.message;
    } catch {
      // Ignore parse errors
    }
    throw new Error(`ElevenLabs: ${errorMsg}`);
  }

  return response.arrayBuffer();
}

/** Validate an ElevenLabs API key by fetching the voices list. */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(
      `${API_URLS.ELEVENLABS}/voices`,
      { headers: { 'xi-api-key': apiKey } },
      5_000
    );
    return response.ok;
  } catch {
    return false;
  }
}
