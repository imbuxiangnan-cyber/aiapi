/**
 * Unified Model Mapper
 *
 * Maps model names across different platforms.
 * Supports user-defined cross-platform mappings.
 */

import consola from "consola"

export type Platform = "copilot" | "zen" | "antigravity" | "kiro" | "droids"

/**
 * Cross-platform model mapping
 * Format: { "canonical-model": { "platform": "platform-specific-name" } }
 */
export type CrossPlatformMapping = Record<
  string,
  Partial<Record<Platform, string>>
>

/**
 * Platform-to-platform model mapping
 * Format: { "source-platform:model": { "target-platform": "target-model" } }
 * Example: { "kiro:claude-sonnet-4-5": { "antigravity": "claude-sonnet-4-thinking" } }
 */
export type PlatformToPlatformMapping = Record<
  string,
  Partial<Record<Platform, string>>
>

/**
 * Model alias mapping - maps common aliases to canonical names
 */
const MODEL_ALIASES: Record<string, string> = {
  // Claude 4.5 aliases
  "claude-4.5-opus": "claude-opus-4-5",
  "claude-4.5-sonnet": "claude-sonnet-4-5",
  "claude-4.5-haiku": "claude-haiku-4-5",

  // Claude 4 aliases
  "claude-4-opus": "claude-opus-4",
  "claude-4-sonnet": "claude-sonnet-4",

  // Claude 3.5 aliases
  "claude-3.5-sonnet": "claude-3-5-sonnet",
  "claude-3.5-haiku": "claude-3-5-haiku",

  // GPT aliases
  gpt4o: "gpt-4o",
  "gpt4o-mini": "gpt-4o-mini",

  // Gemini aliases
  "gemini-pro": "gemini-1.5-pro",
  "gemini-flash": "gemini-2.0-flash",
}

// User-defined cross-platform mappings
let userCrossPlatformMappings: CrossPlatformMapping = {}

// Platform-to-platform mappings (for model equivalence across platforms)
let platformToPlatformMappings: PlatformToPlatformMapping = {}

/**
 * Set user-defined cross-platform mappings
 */
export function setCrossPlatformMappings(mappings: CrossPlatformMapping): void {
  userCrossPlatformMappings = { ...mappings }
  consola.info(
    `Loaded ${Object.keys(mappings).length} cross-platform model mappings`,
  )
}

/**
 * Add a cross-platform mapping for a model
 */
export function addCrossPlatformMapping(
  canonicalModel: string,
  platformMappings: Partial<Record<Platform, string>>,
): void {
  userCrossPlatformMappings[canonicalModel] = {
    ...userCrossPlatformMappings[canonicalModel],
    ...platformMappings,
  }
}

/**
 * Get all cross-platform mappings
 */
export function getCrossPlatformMappings(): CrossPlatformMapping {
  return { ...userCrossPlatformMappings }
}

/**
 * Set platform-to-platform model mappings
 * Example: When using model X from platform A, map to model Y on platform B
 */
export function setPlatformToPlatformMappings(
  mappings: PlatformToPlatformMapping,
): void {
  platformToPlatformMappings = { ...mappings }
  consola.info(
    `Loaded ${Object.keys(mappings).length} platform-to-platform mappings`,
  )
}

/**
 * Add a platform-to-platform mapping
 * @param sourcePlatform - The source platform
 * @param sourceModel - The model name on source platform
 * @param targetMappings - Map of target platform to target model name
 *
 * Example: addPlatformMapping("kiro", "claude-sonnet-4-5", { antigravity: "claude-sonnet-4-5-thinking" })
 */
export function addPlatformMapping(
  sourcePlatform: Platform,
  sourceModel: string,
  targetMappings: Partial<Record<Platform, string>>,
): void {
  const key = `${sourcePlatform}:${sourceModel}`
  platformToPlatformMappings[key] = {
    ...platformToPlatformMappings[key],
    ...targetMappings,
  }
  consola.debug(
    `Added platform mapping: ${key} -> ${JSON.stringify(targetMappings)}`,
  )
}

/**
 * Get platform-to-platform mapping
 */
export function getPlatformMapping(
  sourcePlatform: Platform,
  sourceModel: string,
  targetPlatform: Platform,
): string | null {
  const key = `${sourcePlatform}:${sourceModel}`
  return platformToPlatformMappings[key]?.[targetPlatform] ?? null
}

/**
 * Get all platform-to-platform mappings
 */
export function getPlatformToPlatformMappings(): PlatformToPlatformMapping {
  return { ...platformToPlatformMappings }
}

/**
 * Platform-specific model mappings
 * Maps canonical model names to platform-specific names
 */
const PLATFORM_MODEL_MAP: Record<Platform, Record<string, string>> = {
  // Copilot uses standard names
  copilot: {},

  // Zen uses standard names
  zen: {},

  // Antigravity uses standard names
  antigravity: {},

  // Kiro needs internal CodeWhisperer format
  kiro: {
    // Will be handled by dynamic mapping function
  },

  // Droids uses standard names
  droids: {},
}

/**
 * Normalize model name to canonical form
 */
export function normalizeModelName(model: string): string {
  // Check aliases first
  if (MODEL_ALIASES[model]) {
    return MODEL_ALIASES[model]
  }
  return model
}

/**
 * Map model name for a specific platform
 */
export function mapModelForPlatform(model: string, platform: Platform): string {
  // Normalize first
  const normalized = normalizeModelName(model)

  // 1. Check user-defined cross-platform mapping first
  const userMapping = userCrossPlatformMappings[normalized]?.[platform]
  if (userMapping) {
    consola.debug(
      `Using user mapping: ${model} -> ${userMapping} (${platform})`,
    )
    return userMapping
  }

  // 2. Check built-in platform-specific mapping
  const platformMap = PLATFORM_MODEL_MAP[platform]
  if (platformMap[normalized]) {
    return platformMap[normalized]
  }

  // 3. Special handling for Kiro - needs internal format
  if (platform === "kiro") {
    return mapModelToKiroInternal(normalized)
  }

  // 4. Return normalized name for other platforms
  return normalized
}

/**
 * Map model to Kiro internal CodeWhisperer format
 * Pattern: claude-opus-4-5-20251101-thinking -> CLAUDE_OPUS_4_5_20251101_THINKING_V1_0
 */
function mapModelToKiroInternal(model: string): string {
  if (model.startsWith("claude-")) {
    const internalId = model.toUpperCase().replaceAll("-", "_") + "_V1_0"

    consola.debug(`Kiro model mapping: ${model} -> ${internalId}`)
    return internalId
  }

  // Return as-is for non-Claude models
  return model
}

/**
 * Check if a model is supported by a platform
 */
export function isModelSupportedByPlatform(
  model: string,
  platform: Platform,
): boolean {
  const normalized = normalizeModelName(model)

  // Claude models
  if (normalized.startsWith("claude-")) {
    // All platforms support Claude
    return true
  }

  // GPT models
  if (normalized.startsWith("gpt-") || normalized.startsWith("o1")) {
    // Only Copilot and Droids support GPT
    return platform === "copilot" || platform === "droids"
  }

  // Gemini models
  if (normalized.startsWith("gemini-")) {
    // Antigravity and Droids support Gemini
    return platform === "antigravity" || platform === "droids"
  }

  // Amazon Nova models
  if (normalized.startsWith("amazon-nova")) {
    return platform === "kiro"
  }

  // Default: assume supported
  return true
}

/**
 * Get recommended platform for a model
 */
export function getRecommendedPlatform(model: string): Platform | null {
  const normalized = normalizeModelName(model)

  // Claude models - prefer Kiro or Antigravity
  if (normalized.startsWith("claude-")) {
    return "kiro"
  }

  // GPT models - prefer Copilot
  if (normalized.startsWith("gpt-") || normalized.startsWith("o1")) {
    return "copilot"
  }

  // Gemini models - prefer Antigravity
  if (normalized.startsWith("gemini-")) {
    return "antigravity"
  }

  // Amazon Nova - Kiro only
  if (normalized.startsWith("amazon-nova")) {
    return "kiro"
  }

  return null
}
