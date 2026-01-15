#!/usr/bin/env node

import { defineCommand } from "citty"
import consola from "consola"

import { ensurePaths, PATHS } from "./lib/paths"
import { state } from "./lib/state"
import { setupGitHubToken } from "./lib/token"

interface RunAuthOptions {
  verbose: boolean
  showToken: boolean
  platform?: string
}

export async function runAuth(options: RunAuthOptions): Promise<void> {
  if (options.verbose) {
    consola.level = 5
    consola.info("Verbose logging enabled")
  }

  state.showToken = options.showToken

  await ensurePaths()

  // Determine which platform to authenticate
  let platform = options.platform
  if (!platform) {
    platform = await consola.prompt("Select platform to authenticate", {
      type: "select",
      options: [
        { value: "copilot", label: "GitHub Copilot" },
        { value: "zen", label: "OpenCode Zen" },
        { value: "antigravity", label: "Google Antigravity" },
        { value: "kiro", label: "AWS Kiro (CodeWhisperer)" },
        { value: "droids", label: "Factory AI Droids" },
      ],
    })
  }

  switch (platform) {
    case "copilot": {
      await setupGitHubToken({ force: true })
      consola.success("GitHub token written to", PATHS.GITHUB_TOKEN_PATH)
      break
    }
    case "zen": {
      const { setupZenApiKey } = await import("~/services/zen/auth")
      await setupZenApiKey()
      consola.success("Zen API key configured")
      break
    }
    case "antigravity": {
      const { setupAntigravity } = await import("~/services/antigravity/auth")
      await setupAntigravity()
      consola.success("Antigravity account configured")
      break
    }
    case "kiro": {
      const { setupKiroAuth } = await import("~/services/kiro/auth")
      await setupKiroAuth()
      consola.success("Kiro authentication configured")
      break
    }
    case "droids": {
      const { setupDroidsAuth } = await import("~/services/droids/auth")
      await setupDroidsAuth()
      consola.success("Droids API key configured")
      break
    }
    default: {
      consola.error(`Unknown platform: ${platform}`)
      process.exit(1)
    }
  }
}

export const auth = defineCommand({
  meta: {
    name: "auth",
    description:
      "Authenticate with AI platforms (Copilot, Zen, Antigravity, Kiro, Droids)",
  },
  args: {
    verbose: {
      alias: "v",
      type: "boolean",
      default: false,
      description: "Enable verbose logging",
    },
    "show-token": {
      type: "boolean",
      default: false,
      description: "Show token on auth",
    },
    platform: {
      alias: "p",
      type: "string",
      description:
        "Platform to authenticate (copilot, zen, antigravity, kiro, droids)",
    },
  },
  run({ args }) {
    return runAuth({
      verbose: args.verbose,
      showToken: args["show-token"],
      platform: args.platform,
    })
  },
})
