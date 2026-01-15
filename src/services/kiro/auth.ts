import consola from "consola"
import { readFile, writeFile, unlink } from "node:fs/promises"
import { join } from "node:path"

import { PATHS } from "~/lib/paths"

// Auth method constants
export const AUTH_METHOD_SOCIAL = "Social"
export const AUTH_METHOD_IDC = "IdC"

// API URLs
export const REFRESH_TOKEN_URL =
  "https://prod.us-east-1.auth.desktop.kiro.dev/refreshToken"
export const IDC_REFRESH_TOKEN_URL =
  "https://oidc.us-east-1.amazonaws.com/token"
export const CODE_WHISPERER_URL =
  "https://codewhisperer.us-east-1.amazonaws.com/generateAssistantResponse"

export interface KiroAuthConfig {
  auth: "Social" | "IdC"
  refreshToken: string
  clientId?: string
  clientSecret?: string
  disabled?: boolean
  description?: string
}

export interface KiroTokenInfo {
  accessToken: string
  refreshToken: string
  expiresIn: number
  expiresAt: Date
}

export interface KiroAuthState {
  configs: Array<KiroAuthConfig>
  currentIndex: number
  tokens: Map<number, KiroTokenInfo>
}

let authState: KiroAuthState | null = null

export function getKiroAuthPath(): string {
  return join(PATHS.DATA_DIR, "kiro-auth.json")
}

export async function loadKiroAuth(): Promise<Array<KiroAuthConfig> | null> {
  try {
    const content = await readFile(getKiroAuthPath(), "utf-8")
    const configs = JSON.parse(content) as Array<KiroAuthConfig>
    return configs.filter((c) => !c.disabled && c.refreshToken)
  } catch {
    return null
  }
}

export async function saveKiroAuth(
  configs: Array<KiroAuthConfig>,
): Promise<void> {
  await writeFile(getKiroAuthPath(), JSON.stringify(configs, null, 2))
}

export async function clearKiroAuth(): Promise<void> {
  try {
    await unlink(getKiroAuthPath())
    authState = null
  } catch {
    // File doesn't exist, ignore
  }
}

export async function setupKiroAuth(): Promise<void> {
  consola.info("Setting up Kiro (AWS CodeWhisperer) authentication")
  consola.info("")
  consola.info("You need to provide refresh tokens from Kiro/AWS SSO.")
  consola.info("Token locations:")
  consola.info("  - Social: ~/.aws/sso/cache/kiro-auth-token.json")
  consola.info("  - IdC: ~/.aws/sso/cache/ directory")
  consola.info("")

  const authType = await consola.prompt("Select authentication type", {
    type: "select",
    options: [
      { value: "Social", label: "Social (AWS SSO)" },
      { value: "IdC", label: "IdC (Identity Center)" },
    ],
  })

  const refreshToken = await consola.prompt("Enter refresh token", {
    type: "text",
  })

  if (!refreshToken) {
    throw new Error("Refresh token is required")
  }

  const config: KiroAuthConfig = {
    auth: authType as "Social" | "IdC",
    refreshToken,
  }

  if (authType === "IdC") {
    const clientId = await consola.prompt("Enter client ID", {
      type: "text",
    })
    const clientSecret = await consola.prompt("Enter client secret", {
      type: "text",
    })

    if (!clientId || !clientSecret) {
      throw new Error("Client ID and secret are required for IdC auth")
    }

    config.clientId = clientId
    config.clientSecret = clientSecret
  }

  // Load existing configs or create new array
  const existing = (await loadKiroAuth()) ?? []
  existing.push(config)
  await saveKiroAuth(existing)

  consola.success("Kiro authentication configured")
}
