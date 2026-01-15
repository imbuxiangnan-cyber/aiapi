/**
 * Factory AI Droids Models
 *
 * Fetches available models from Droids API with fallback to static list.
 */

import consola from "consola"

import { state } from "~/lib/state"

import { DROIDS_API_BASE } from "./auth"

// Fallback models when API is unavailable
export const DROIDS_FALLBACK_MODELS = [
  // Claude Opus 4.5
  "claude-opus-4-5",
  "claude-opus-4-5-20251101",
  // Claude Sonnet 4.5
  "claude-sonnet-4-5",
  "claude-sonnet-4-5-20250929",
  // Claude Haiku 4.5
  "claude-haiku-4-5-20251001",
  // Claude Opus 4
  "claude-opus-4",
  "claude-opus-4-20250514",
  "claude-opus-4-1",
  "claude-opus-4-1-20250805",
  // Claude Sonnet 4
  "claude-sonnet-4-20250514",
  // GPT models
  "gpt-4o",
  "gpt-4o-mini",
  "o1",
  "o1-mini",
  // Gemini models
  "gemini-2.0-flash",
  "gemini-1.5-pro",
]

export interface DroidsModel {
  id: string
  object: string
  created: number
  owned_by: string
}

export interface DroidsModelsResponse {
  object: string
  data: Array<DroidsModel>
}

// Cache for fetched models
let cachedModels: Array<DroidsModel> | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch models from Droids API
 */
async function fetchModelsFromApi(): Promise<Array<DroidsModel> | null> {
  const apiKey = state.droidsApiKey
  if (!apiKey) {
    consola.debug("No Droids API key, using fallback models")
    return null
  }

  try {
    const response = await fetch(`${DROIDS_API_BASE}/v1/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      consola.warn(`Failed to fetch Droids models: ${response.status}`)
      return null
    }

    const data = (await response.json()) as DroidsModelsResponse
    consola.debug(`Fetched ${data.data.length} models from Droids API`)
    return data.data
  } catch (error) {
    consola.warn("Error fetching Droids models:", error)
    return null
  }
}

/**
 * Get available Droids models (with caching)
 */
export async function getDroidsModelsAsync(): Promise<DroidsModelsResponse> {
  // Check cache
  if (cachedModels && Date.now() - cacheTimestamp < CACHE_TTL) {
    return { object: "list", data: cachedModels }
  }

  // Try to fetch from API
  const apiModels = await fetchModelsFromApi()

  if (apiModels && apiModels.length > 0) {
    cachedModels = apiModels
    cacheTimestamp = Date.now()
    return { object: "list", data: apiModels }
  }

  // Use fallback models
  consola.debug("Using fallback Droids models")
  const fallback = DROIDS_FALLBACK_MODELS.map((id) => ({
    id,
    object: "model" as const,
    created: Math.floor(Date.now() / 1000),
    owned_by: "factory-ai",
  }))

  return { object: "list", data: fallback }
}

/**
 * Get Droids models (sync version for backward compatibility)
 */
export function getDroidsModels(): DroidsModelsResponse {
  // Return cached if available
  if (cachedModels) {
    return { object: "list", data: cachedModels }
  }

  // Return fallback
  const models = DROIDS_FALLBACK_MODELS.map((id) => ({
    id,
    object: "model" as const,
    created: Math.floor(Date.now() / 1000),
    owned_by: "factory-ai",
  }))

  return { object: "list", data: models }
}

/**
 * Cache Droids models in state
 */
export async function cacheDroidsModels(): Promise<void> {
  const models = await getDroidsModelsAsync()
  state.droidsModels = models
  consola.info(`Loaded ${models.data.length} Droids models`)
}
