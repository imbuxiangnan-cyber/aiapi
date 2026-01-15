#!/usr/bin/env node

import { defineCommand, runMain } from "citty"

import { antigravity } from "./antigravity"
import { auth } from "./auth"
import { checkUsage } from "./check-usage"
import { debug } from "./debug"
import { logout } from "./logout"
import { proxy } from "./proxy-config"
import { start } from "./start"

const main = defineCommand({
  meta: {
    name: "aiapi",
    description:
      "AI API proxy server supporting multiple platforms (GitHub Copilot, OpenCode Zen, Google Antigravity, AWS Kiro, Factory AI Droids) with OpenAI/Anthropic compatible interface.",
  },
  subCommands: {
    antigravity,
    auth,
    start,
    "check-usage": checkUsage,
    debug,
    logout,
    proxy,
  },
})

await runMain(main)
