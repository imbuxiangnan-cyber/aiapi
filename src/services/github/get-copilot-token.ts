import { GITHUB_API_BASE_URL, githubHeaders } from "~/lib/api-config"
import { HTTPError } from "~/lib/error"
import { state } from "~/lib/state"

export const getCopilotToken = async () => {
  const response = await fetch(
    `${GITHUB_API_BASE_URL}/copilot_internal/v2/token`,
    {
      headers: githubHeaders(state),
    },
  )

  if (!response.ok) throw new HTTPError("Failed to get Copilot token", response)

  const data = (await response.json()) as GetCopilotTokenResponse

  // Store the API endpoint if available
  if (data.endpoints?.api) {
    state.copilotApiEndpoint = data.endpoints.api
  }

  return data
}

// Full interface matching Zed's implementation
interface GetCopilotTokenResponse {
  expires_at: number
  refresh_in: number
  token: string
  endpoints?: {
    api: string
    "origin-tracker"?: string
    proxy?: string
    telemetry?: string
  }
  annotations_enabled?: boolean
  chat_enabled?: boolean
  chat_jetbrains_enabled?: boolean
  code_quote_enabled?: boolean
  codesearch?: boolean
  copilot_ide_agent_chat_gpt4_small_prompt?: boolean
  copilotignore_enabled?: boolean
  individual?: boolean
  sku?: string
  tracking_id?: string
  limited_user_quotas?: unknown // Premium request quotas
}
