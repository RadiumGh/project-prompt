
// <ai_context>
// TODO: Next rewriting plan: Move or replicate this token counting on server for stable counts. Keep for client fallback.
//  Utility helpers for token counting, etc.
//  Updated to produce an estimate using js-tiktoken to better approximate the OpenAI tokenizer.
// </ai_context>

import { encodingForModel, Tiktoken } from "js-tiktoken"

let enc: Tiktoken | null = null

export function approximateTokens(text: string): number {
  if (!text) return 0
  if (!enc) {
    enc = encodingForModel("gpt-3.5-turbo")
  }
  const tokens = enc.encode(text)
  return tokens.length
}

/**
 * Format a raw token count into a shorthand, e.g.
 * 42 => "42"
 * 4200 => "4.2k"
 * 12345 => "12.3k"
 */
export function formatTokenCount(count: number): string {
  if (count < 1000) {
    return String(count)
  }
  const k = count / 1000
  return k.toFixed(1) + 'k'
}
