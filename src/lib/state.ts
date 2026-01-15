import type { AntigravityModelsResponse } from "~/services/antigravity/get-models"
import type { ModelsResponse } from "~/services/copilot/get-models"
import type { DroidsModelsResponse } from "~/services/droids/models"
import type { KiroModelsResponse } from "~/services/kiro/models"
import type { ZenModelsResponse } from "~/services/zen/get-models"

export interface State {
  githubToken?: string
  copilotToken?: string
  copilotApiEndpoint?: string // API endpoint returned by token response

  accountType: string
  models?: ModelsResponse
  vsCodeVersion?: string

  manualApprove: boolean
  rateLimitWait: boolean
  showToken: boolean

  // Rate limiting configuration
  rateLimitSeconds?: number
  lastRequestTimestamp?: number

  // API key authentication
  apiKeys?: Array<string>

  // OpenCode Zen support
  zenApiKey?: string
  zenModels?: ZenModelsResponse
  zenMode?: boolean // When true, proxy to Zen instead of Copilot

  // Google Antigravity support
  antigravityMode?: boolean // When true, proxy to Antigravity instead of Copilot
  antigravityModels?: AntigravityModelsResponse

  // AWS Kiro (CodeWhisperer) support
  kiroMode?: boolean // When true, proxy to Kiro instead of Copilot
  kiroModels?: KiroModelsResponse

  // Factory AI Droids support
  droidsMode?: boolean // When true, proxy to Droids instead of Copilot
  droidsApiKey?: string
  droidsModels?: DroidsModelsResponse
}

export const state: State = {
  accountType: "individual",
  manualApprove: false,
  rateLimitWait: false,
  showToken: false,
  zenMode: false,
  antigravityMode: false,
  kiroMode: false,
  droidsMode: false,
}
