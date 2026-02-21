/**
 * Anthropic (Claude) API Client
 *
 * Generates AI-powered poem reviews using Claude.
 * User must provide their own API key (stored in SecureStore).
 *
 * Base URL: https://api.anthropic.com/v1
 * Endpoint: POST /messages
 */

import { API_URLS, API_TIMEOUT, ANTHROPIC_MODEL } from '@/utils/constants';
import type {
  PoemReview,
  ReviewTone,
  ReviewTheme,
  LiteraryDevice,
} from '@/types';
import { hashPoemBody } from '@/utils/text-formatter';
import * as Crypto from 'expo-crypto';

// ─── Types ───────────────────────────────────────────────────

interface MessageContent {
  type: 'text';
  text: string;
}

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: MessageContent[];
  model: string;
  stop_reason: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface AnthropicError {
  type: 'error';
  error: {
    type: string;
    message: string;
  };
}

interface ReviewInput {
  title: string;
  body: string;
  formType: string | null;
  tone: ReviewTone;
}

// ─── Raw response shape we ask the model to produce ─────────

interface RawReviewJSON {
  summary: string;
  themes: Array<{ name: string; explanation: string }>;
  literary_devices: Array<{
    device: string;
    example: string;
    explanation: string;
  }>;
  structure_analysis: string;
  interpretation: string;
}

// ─── Prompt builders ─────────────────────────────────────────

function buildSystemPrompt(tone: ReviewTone): string {
  const toneInstruction: Record<ReviewTone, string> = {
    academic:
      'Write in a scholarly, analytical tone. Use literary criticism vocabulary. Be precise and objective.',
    casual:
      'Write in a warm, conversational tone. Use accessible language. Be relatable and approachable.',
    encouraging:
      'Write in a supportive, uplifting tone. Highlight strengths while gently noting areas for growth. Be enthusiastic.',
  };

  return `You are an expert poetry critic and literary analyst. ${toneInstruction[tone]}

Respond ONLY with valid JSON matching this exact structure (no markdown, no code fences, no extra text):
{
  "summary": "2-3 sentence summary of the poem",
  "themes": [{"name": "theme name", "explanation": "brief explanation"}],
  "literary_devices": [{"device": "device name", "example": "quoted text", "explanation": "how it's used"}],
  "structure_analysis": "analysis of form, meter, rhyme scheme",
  "interpretation": "overall interpretation and emotional impact"
}`;
}

function buildUserPrompt(input: ReviewInput): string {
  const formLine = input.formType ? `Form: ${input.formType}\n` : '';
  return `Analyze the following poem. Identify themes, literary devices (with specific examples from the text), structure, and provide an overall interpretation.

Poem Title: ${input.title || 'Untitled'}
${formLine}---
${input.body}`;
}

// ─── Helpers ─────────────────────────────────────────────────

async function sendMessage(
  apiKey: string,
  systemPrompt: string,
  messages: AnthropicMessage[]
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT.ANTHROPIC);

  try {
    const response = await fetch(`${API_URLS.ANTHROPIC}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1500,
        system: systemPrompt,
        messages,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errBody: AnthropicError = await response.json().catch(() => ({
        type: 'error' as const,
        error: { type: 'api_error', message: `HTTP ${response.status}` },
      }));
      throw new Error(errBody.error.message);
    }

    const data: AnthropicResponse = await response.json();
    const textBlock = data.content.find((c) => c.type === 'text');
    if (!textBlock) throw new Error('Empty response from Claude');

    return textBlock.text;
  } finally {
    clearTimeout(timeout);
  }
}

function parseReviewJSON(raw: string): RawReviewJSON {
  // Strip markdown code fences if the model ignores instructions
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    return JSON.parse(cleaned) as RawReviewJSON;
  } catch {
    throw new Error('Failed to parse AI review response. Please try again.');
  }
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Generate an AI review for a poem.
 * Requires a valid Anthropic API key.
 */
export async function generatePoemReview(
  apiKey: string,
  input: ReviewInput,
  poemId: string
): Promise<PoemReview> {
  const systemPrompt = buildSystemPrompt(input.tone);
  const messages: AnthropicMessage[] = [
    { role: 'user', content: buildUserPrompt(input) },
  ];

  const rawContent = await sendMessage(apiKey, systemPrompt, messages);
  const parsed = parseReviewJSON(rawContent);

  const review: PoemReview = {
    id: Crypto.randomUUID(),
    poemId,
    summary: parsed.summary,
    themes: parsed.themes as ReviewTheme[],
    literaryDevices: parsed.literary_devices.map((d) => ({
      device: d.device,
      example: d.example,
      explanation: d.explanation,
    })) as LiteraryDevice[],
    structureAnalysis: parsed.structure_analysis,
    interpretation: parsed.interpretation,
    tone: input.tone,
    personalNotes: '',
    generatedAt: new Date().toISOString(),
    poemBodyHash: hashPoemBody(input.body),
  };

  return review;
}

/**
 * Validate an Anthropic API key by making a minimal request.
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URLS.ANTHROPIC}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
