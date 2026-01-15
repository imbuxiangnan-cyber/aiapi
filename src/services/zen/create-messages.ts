/**
 * OpenCode Zen Messages Proxy
 *
 * Proxies Anthropic-format message requests to OpenCode Zen API.
 */

import consola from "consola"

import { state } from "~/lib/state"
import { sleep } from "~/lib/utils"

const MAX_RETRIES = 5
const DEFAULT_RETRY_DELAY = 500

export interface ZenMessageRequest {
  model: string
  messages: Array<{
    role: string
    content: string | Array<{ type: string; text?: string; source?: unknown }>
  }>
  max_tokens: number
  temperature?: number
  stream?: boolean
  system?: string | Array<{ type: string; text: string }>
  [key: string]: unknown
}

/**
 * Parse retry delay from error response headers or body
 */
function parseRetryDelay(response: Response, errorText: string): number {
  // Check Retry-After header
  const retryAfter = response.headers.get("Retry-After")
  if (retryAfter) {
    const seconds = Number.parseInt(retryAfter, 10)
    if (!Number.isNaN(seconds)) return seconds * 1000
  }

  // Try to parse from error body
  try {
    const errorData = JSON.parse(errorText) as {
      error?: { retry_after?: number }
    }
    if (errorData.error?.retry_after) {
      return errorData.error.retry_after * 1000
    }
  } catch {
    // Ignore parse errors
  }

  return DEFAULT_RETRY_DELAY
}

/**
 * Create messages via OpenCode Zen (Anthropic format)
 */
export async function createZenMessages(
  request: ZenMessageRequest,
  signal?: AbortSignal,
): Promise<Response> {
  const apiKey = state.zenApiKey

  if (!apiKey) {
    throw new Error("Zen API key not configured")
  }

  consola.debug(`Zen messages request for model: ${request.model}`)

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch("https://opencode.ai/zen/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(request),
        signal,
      })

      if (response.ok) {
        return response
      }

      const errorText = await response.text()

      // Retry on rate limit or server errors
      if (
        (response.status === 429 || response.status >= 500)
        && attempt < MAX_RETRIES
      ) {
        const retryDelay = parseRetryDelay(response, errorText)
        consola.info(
          `Zen rate limited (${response.status}), retrying in ${retryDelay}ms...`,
        )
        await sleep(retryDelay)
        continue
      }

      consola.error(`Zen Messages API error: ${response.status} ${errorText}`)
      throw new Error(`Zen Messages API error: ${response.status} ${errorText}`)
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw error
      }
      if (attempt < MAX_RETRIES) {
        consola.warn(`Zen request failed, retrying... (${attempt + 1})`)
        await sleep(DEFAULT_RETRY_DELAY)
        continue
      }
      throw error
    }
  }

  throw new Error("Max retries exceeded")
}
