/**
 * AWS Kiro (CodeWhisperer) Models
 *
 * Kiro uses AWS CodeWhisperer's private API which doesn't expose a models endpoint.
 * Models are configured internally by AWS, so we maintain a static mapping.
 */

import consola from "consola"

import { mapModelForPlatform, normalizeModelName } from "~/lib/model-mapper"
import { state } from "~/lib/state"

// Kiro model mapping (public name -> CodeWhisperer internal ID)
export const KIRO_MODEL_MAP: Record<string, string> = {
  // Claude Opus 4.5 models
  "claude-opus-4-5": "CLAUDE_OPUS_4_5_V1_0",
  "claude-opus-4-5-20251101": "CLAUDE_OPUS_4_5_20251101_V1_0",
  "claude-opus-4-5-thinking": "CLAUDE_OPUS_4_5_THINKING_V1_0",
  "claude-opus-4-5-20251101-thinking": "CLAUDE_OPUS_4_5_20251101_THINKING_V1_0",

  // Claude Sonnet 4.5 models
  "claude-sonnet-4-5": "CLAUDE_SONNET_4_5_V1_0",
  "claude-sonnet-4-5-20250929": "CLAUDE_SONNET_4_5_20250929_V1_0",
  "claude-sonnet-4-5-thinking": "CLAUDE_SONNET_4_5_THINKING_V1_0",
  "claude-sonnet-4-5-20250929-thinking":
    "CLAUDE_SONNET_4_5_20250929_THINKING_V1_0",

  // Claude Haiku 4.5 models
  "claude-haiku-4-5": "CLAUDE_HAIKU_4_5_V1_0",
  "claude-haiku-4-5-20251001": "CLAUDE_HAIKU_4_5_20251001_V1_0",

  // Claude Opus 4.1 models
  "claude-opus-4-1": "CLAUDE_OPUS_4_1_V1_0",
  "claude-opus-4-1-20250805": "CLAUDE_OPUS_4_1_20250805_V1_0",
  "claude-opus-4-1-thinking": "CLAUDE_OPUS_4_1_THINKING_V1_0",
  "claude-opus-4-1-20250805-thinking": "CLAUDE_OPUS_4_1_20250805_THINKING_V1_0",

  // Claude Opus 4 models
  "claude-opus-4": "CLAUDE_OPUS_4_V1_0",
  "claude-opus-4-20250514": "CLAUDE_OPUS_4_20250514_V1_0",
  "claude-opus-4-thinking": "CLAUDE_OPUS_4_THINKING_V1_0",
  "claude-opus-4-20250514-thinking": "CLAUDE_OPUS_4_20250514_THINKING_V1_0",

  // Claude Sonnet 4 models
  "claude-sonnet-4": "CLAUDE_SONNET_4_V1_0",
  "claude-sonnet-4-20250514": "CLAUDE_SONNET_4_20250514_V1_0",
  "claude-sonnet-4-thinking": "CLAUDE_SONNET_4_THINKING_V1_0",
  "claude-sonnet-4-20250514-thinking": "CLAUDE_SONNET_4_20250514_THINKING_V1_0",

  // Claude 3.5 Sonnet models
  "claude-3-5-sonnet": "CLAUDE_3_5_SONNET_V1_0",
  "claude-3-5-sonnet-20241022": "CLAUDE_3_5_SONNET_20241022_V1_0",

  // Claude 3.5 Haiku models
  "claude-3-5-haiku": "CLAUDE_3_5_HAIKU_V1_0",
  "claude-3-5-haiku-20241022": "CLAUDE_3_5_HAIKU_20241022_V1_0",
}

export interface KiroModel {
  id: string
  object: string
  created: number
  owned_by: string
}

export interface KiroModelsResponse {
  object: string
  data: Array<KiroModel>
}

/**
 * Get available Kiro models
 */
export function getKiroModels(): KiroModelsResponse {
  const models = Object.keys(KIRO_MODEL_MAP).map((id) => ({
    id,
    object: "model" as const,
    created: Math.floor(Date.now() / 1000),
    owned_by: "aws-kiro",
  }))

  return {
    object: "list",
    data: models,
  }
}

/**
 * Map public model name to internal CodeWhisperer ID
 *
 * Uses unified model mapper with Kiro-specific transformation.
 */
export function mapModelToInternal(model: string): string {
  // Normalize model name first (handle aliases)
  const normalized = normalizeModelName(model)

  // Check static mapping
  if (KIRO_MODEL_MAP[normalized]) {
    return KIRO_MODEL_MAP[normalized]
  }

  // Use unified mapper for dynamic generation
  return mapModelForPlatform(normalized, "kiro")
}

/**
 * Cache Kiro models in state
 */
export function cacheKiroModels(): void {
  const models = getKiroModels()
  state.kiroModels = models
  consola.info(`Loaded ${models.data.length} Kiro models`)
}
