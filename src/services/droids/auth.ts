import consola from "consola"
import { readFile, writeFile, unlink } from "node:fs/promises"
import { join } from "node:path"

import { PATHS } from "~/lib/paths"

// Factory AI Droids API
export const DROIDS_API_BASE = "https://app.factory.ai"

export interface DroidsAuthConfig {
  apiKey: string
  createdAt: string
}

export function getDroidsAuthPath(): string {
  return join(PATHS.DATA_DIR, "droids-auth.json")
}

export async function loadDroidsAuth(): Promise<DroidsAuthConfig | null> {
  try {
    const content = await readFile(getDroidsAuthPath(), "utf-8")
    return JSON.parse(content) as DroidsAuthConfig
  } catch {
    return null
  }
}

export async function saveDroidsAuth(config: DroidsAuthConfig): Promise<void> {
  await writeFile(getDroidsAuthPath(), JSON.stringify(config, null, 2))
}

export async function clearDroidsAuth(): Promise<void> {
  try {
    await unlink(getDroidsAuthPath())
  } catch {
    // File doesn't exist, ignore
  }
}

export async function setupDroidsAuth(): Promise<string> {
  consola.info("Setting up Factory AI Droids authentication")
  consola.info("")
  consola.info(
    "Get your API key from: https://app.factory.ai/settings/api-keys",
  )
  consola.info("API keys start with 'fk-'")
  consola.info("")

  const apiKey = await consola.prompt("Enter your Droids API key", {
    type: "text",
  })

  if (!apiKey) {
    throw new Error("API key is required")
  }

  if (!apiKey.startsWith("fk-")) {
    consola.warn("API key should start with 'fk-', proceeding anyway...")
  }

  const config: DroidsAuthConfig = {
    apiKey,
    createdAt: new Date().toISOString(),
  }

  await saveDroidsAuth(config)
  consola.success("Droids API key saved")

  return apiKey
}
