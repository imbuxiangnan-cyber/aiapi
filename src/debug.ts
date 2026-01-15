#!/usr/bin/env node

import { defineCommand } from "citty"
import consola from "consola"
import fs from "node:fs/promises"
import os from "node:os"

import { getProxyConfig, type ProxyConfig } from "./lib/config"
import { PATHS } from "./lib/paths"
import { getAntigravityAuthPath } from "./services/antigravity/auth"
import { getZenAuthPath } from "./services/zen/auth"

interface DebugInfo {
  version: string
  runtime: {
    name: string
    version: string
    platform: string
    arch: string
  }
  paths: {
    APP_DIR: string
    GITHUB_TOKEN_PATH: string
    ZEN_AUTH_PATH: string
    ANTIGRAVITY_AUTH_PATH: string
  }
  credentials: {
    github: boolean
    zen: boolean
    antigravity: boolean
  }
  proxy?: ProxyConfig
}

interface RunDebugOptions {
  json: boolean
}

async function getPackageVersion(): Promise<string> {
  try {
    const packageJsonPath = new URL("../package.json", import.meta.url).pathname
    // @ts-expect-error https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v59.0.1/docs/rules/prefer-json-parse-buffer.md
    // JSON.parse() can actually parse buffers
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath)) as {
      version: string
    }
    return packageJson.version
  } catch {
    return "unknown"
  }
}

function getRuntimeInfo() {
  const isBun = typeof Bun !== "undefined"

  return {
    name: isBun ? "bun" : "node",
    version: isBun ? Bun.version : process.version.slice(1),
    platform: os.platform(),
    arch: os.arch(),
  }
}

async function checkTokenExists(): Promise<boolean> {
  try {
    const stats = await fs.stat(PATHS.GITHUB_TOKEN_PATH)
    if (!stats.isFile()) return false

    const content = await fs.readFile(PATHS.GITHUB_TOKEN_PATH, "utf8")
    return content.trim().length > 0
  } catch {
    return false
  }
}

async function checkFileExists(path: string): Promise<boolean> {
  try {
    const stats = await fs.stat(path)
    if (!stats.isFile()) return false

    const content = await fs.readFile(path, "utf8")
    return content.trim().length > 0
  } catch {
    return false
  }
}

async function getDebugInfo(): Promise<DebugInfo> {
  const zenAuthPath = getZenAuthPath()
  const antigravityAuthPath = getAntigravityAuthPath()

  const [version, githubExists, zenExists, antigravityExists, proxyConfig] =
    await Promise.all([
      getPackageVersion(),
      checkTokenExists(),
      checkFileExists(zenAuthPath),
      checkFileExists(antigravityAuthPath),
      getProxyConfig(),
    ])

  return {
    version,
    runtime: getRuntimeInfo(),
    paths: {
      APP_DIR: PATHS.APP_DIR,
      GITHUB_TOKEN_PATH: PATHS.GITHUB_TOKEN_PATH,
      ZEN_AUTH_PATH: zenAuthPath,
      ANTIGRAVITY_AUTH_PATH: antigravityAuthPath,
    },
    credentials: {
      github: githubExists,
      zen: zenExists,
      antigravity: antigravityExists,
    },
    proxy: proxyConfig,
  }
}

function printDebugInfoPlain(info: DebugInfo): void {
  let proxyStatus = "Not configured"
  if (info.proxy) {
    proxyStatus =
      info.proxy.enabled ?
        `Enabled (${info.proxy.httpProxy || info.proxy.httpsProxy})`
      : "Disabled"
  }

  consola.info(`copilot-api-plus debug

Version: ${info.version}
Runtime: ${info.runtime.name} ${info.runtime.version} (${info.runtime.platform} ${info.runtime.arch})

Paths:
  APP_DIR: ${info.paths.APP_DIR}
  GITHUB_TOKEN_PATH: ${info.paths.GITHUB_TOKEN_PATH}
  ZEN_AUTH_PATH: ${info.paths.ZEN_AUTH_PATH}
  ANTIGRAVITY_AUTH_PATH: ${info.paths.ANTIGRAVITY_AUTH_PATH}

Credentials:
  GitHub Copilot: ${info.credentials.github ? "✅ Configured" : "❌ Not configured"}
  OpenCode Zen: ${info.credentials.zen ? "✅ Configured" : "❌ Not configured"}
  Google Antigravity: ${info.credentials.antigravity ? "✅ Configured" : "❌ Not configured"}

Proxy: ${proxyStatus}`)
}

function printDebugInfoJson(info: DebugInfo): void {
  console.log(JSON.stringify(info, null, 2))
}

export async function runDebug(options: RunDebugOptions): Promise<void> {
  const debugInfo = await getDebugInfo()

  if (options.json) {
    printDebugInfoJson(debugInfo)
  } else {
    printDebugInfoPlain(debugInfo)
  }
}

export const debug = defineCommand({
  meta: {
    name: "debug",
    description: "Print debug information about the application",
  },
  args: {
    json: {
      type: "boolean",
      default: false,
      description: "Output debug information as JSON",
    },
  },
  run({ args }) {
    return runDebug({
      json: args.json,
    })
  },
})
