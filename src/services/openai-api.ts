/**
 * OpenAI API Client
 *
 * Generates AI-powered poem reviews using GPT-4o-mini.
 * User must provide their own API key (stored in SecureStore).
 *
 * Base URL: https://api.openai.com/v1
 * Endpoint: POST /chat/completions
 */

import { API_URLS, API_TIMEOUT, OPENAI_MODEL } from '@/utils/constants';
import type {
  PoemReview,
  ReviewTone,
  ReviewTheme,
  LiteraryDevice,
} from '@/types';
import { hashPoemBody } from '@/utils/text-formatter';
import * as Crypto from 'expo-crypto';

// ─── Types ───────────────────────────────────────────────────

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIError {
  error: {
    message: string;
    type: string;
    code: string | null;
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

async function chatCompletion(
  apiKey: string,
  messages: ChatMessage[]
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT.OPENAI);

  try {
    const response = await fetch(`${API_URLS.OPENAI}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errBody: OpenAIError = await response.json().catch(() => ({
        error: { message: `HTTP ${response.status}`, type: 'api_error', code: null },
      }));
      throw new Error(errBody.error.message);
    }

    const data: ChatCompletionResponse = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    return content;
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
 * Requires a valid OpenAI API key.
 */
export async function generatePoemReview(
  apiKey: string,
  input: ReviewInput,
  poemId: string
): Promise<PoemReview> {
  const messages: ChatMessage[] = [
    { role: 'system', content: buildSystemPrompt(input.tone) },
    { role: 'user', content: buildUserPrompt(input) },
  ];

  const rawContent = await chatCompletion(apiKey, messages);
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
 * Validate an OpenAI API key by making a minimal request.
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URLS.OPENAI}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}
