#!/usr/bin/env node

import { defineCommand } from "citty"
import consola from "consola"

import { ensurePaths, PATHS } from "./lib/paths"
import { clearGithubToken } from "./lib/token"
import {
  clearAntigravityAuth,
  getAntigravityAuthPath,
} from "./services/antigravity/auth"
import { clearDroidsAuth, getDroidsAuthPath } from "./services/droids/auth"
import { clearKiroAuth, getKiroAuthPath } from "./services/kiro/auth"
import { clearZenAuth, getZenAuthPath } from "./services/zen/auth"

export async function runLogout(options: {
  github?: boolean
  zen?: boolean
  antigravity?: boolean
  kiro?: boolean
  droids?: boolean
  all?: boolean
}): Promise<void> {
  await ensurePaths()

  if (options.all) {
    // Clear all credentials
    await clearGithubToken()
    await clearZenAuth()
    await clearAntigravityAuth()
    await clearKiroAuth()
    await clearDroidsAuth()
    consola.success("Logged out from all services")
    consola.info(`GitHub token: ${PATHS.GITHUB_TOKEN_PATH}`)
    consola.info(`Zen API key: ${getZenAuthPath()}`)
    consola.info(`Antigravity accounts: ${getAntigravityAuthPath()}`)
    consola.info(`Kiro auth: ${getKiroAuthPath()}`)
    consola.info(`Droids API key: ${getDroidsAuthPath()}`)
    return
  }

  if (options.github) {
    // Clear only GitHub token
    await clearGithubToken()
    consola.success("Logged out from GitHub Copilot")
    consola.info(`Token file location: ${PATHS.GITHUB_TOKEN_PATH}`)
    return
  }

  if (options.zen) {
    // Clear only Zen API key
    await clearZenAuth()
    consola.success("Logged out from OpenCode Zen")
    consola.info(`Zen API key location: ${getZenAuthPath()}`)
    return
  }

  if (options.antigravity) {
    // Clear only Antigravity accounts
    await clearAntigravityAuth()
    consola.success("Logged out from Google Antigravity")
    consola.info(`Antigravity accounts location: ${getAntigravityAuthPath()}`)
    return
  }

  if (options.kiro) {
    // Clear only Kiro auth
    await clearKiroAuth()
    consola.success("Logged out from AWS Kiro")
    consola.info(`Kiro auth location: ${getKiroAuthPath()}`)
    return
  }

  if (options.droids) {
    // Clear only Droids API key
    await clearDroidsAuth()
    consola.success("Logged out from Factory AI Droids")
    consola.info(`Droids API key location: ${getDroidsAuthPath()}`)
    return
  }

  // Default: show interactive prompt
  const choice = await consola.prompt(
    "Which credentials do you want to clear?",
    {
      type: "select",
      options: [
        "GitHub Copilot token",
        "OpenCode Zen API key",
        "Google Antigravity accounts",
        "AWS Kiro auth",
        "Factory AI Droids API key",
        "All credentials",
      ],
    },
  )

  switch (choice) {
    case "GitHub Copilot token": {
      await clearGithubToken()
      consola.success("Logged out from GitHub Copilot")
      consola.info(`Token file location: ${PATHS.GITHUB_TOKEN_PATH}`)

      break
    }
    case "OpenCode Zen API key": {
      await clearZenAuth()
      consola.success("Logged out from OpenCode Zen")
      consola.info(`Zen API key location: ${getZenAuthPath()}`)

      break
    }
    case "Google Antigravity accounts": {
      await clearAntigravityAuth()
      consola.success("Logged out from Google Antigravity")
      consola.info(`Antigravity accounts location: ${getAntigravityAuthPath()}`)

      break
    }
    case "AWS Kiro auth": {
      await clearKiroAuth()
      consola.success("Logged out from AWS Kiro")
      consola.info(`Kiro auth location: ${getKiroAuthPath()}`)

      break
    }
    case "Factory AI Droids API key": {
      await clearDroidsAuth()
      consola.success("Logged out from Factory AI Droids")
      consola.info(`Droids API key location: ${getDroidsAuthPath()}`)

      break
    }
    case "All credentials": {
      await clearGithubToken()
      await clearZenAuth()
      await clearAntigravityAuth()
      await clearKiroAuth()
      await clearDroidsAuth()
      consola.success("Logged out from all services")

      break
    }
    // No default
  }
}

export const logout = defineCommand({
  meta: {
    name: "logout",
    description: "Clear stored credentials and logout",
  },
  args: {
    github: {
      alias: "g",
      type: "boolean",
      default: false,
      description: "Clear only GitHub Copilot token",
    },
    zen: {
      alias: "z",
      type: "boolean",
      default: false,
      description: "Clear only OpenCode Zen API key",
    },
    antigravity: {
      type: "boolean",
      default: false,
      description: "Clear only Google Antigravity accounts",
    },
    kiro: {
      alias: "k",
      type: "boolean",
      default: false,
      description: "Clear only AWS Kiro auth",
    },
    droids: {
      alias: "d",
      type: "boolean",
      default: false,
      description: "Clear only Factory AI Droids API key",
    },
    all: {
      alias: "a",
      type: "boolean",
      default: false,
      description:
        "Clear all credentials (GitHub, Zen, Antigravity, Kiro, Droids)",
    },
  },
  run({ args }) {
    return runLogout({
      github: args.github,
      zen: args.zen,
      antigravity: args.antigravity,
      kiro: args.kiro,
      droids: args.droids,
      all: args.all,
    })
  },
})
