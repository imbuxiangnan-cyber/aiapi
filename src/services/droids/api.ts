import { state } from "~/lib/state"

import { DROIDS_API_BASE } from "./auth"

export interface DroidsMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface DroidsChatRequest {
  model: string
  messages: Array<DroidsMessage>
  max_tokens?: number
  temperature?: number
  stream?: boolean
}

export async function createDroidsChatCompletion(
  request: DroidsChatRequest,
): Promise<Response> {
  const apiKey = state.droidsApiKey
  if (!apiKey) {
    throw new Error("Droids API key not configured")
  }

  const response = await fetch(`${DROIDS_API_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  })

  return response
}
