import { Hono } from "hono"

import { state } from "~/lib/state"

export const tokenPoolRoute = new Hono()

tokenPoolRoute.get("/", (c) => {
  const status = {
    mode:
      state.zenMode ? "zen"
      : state.antigravityMode ? "antigravity"
      : "copilot",
    copilot: {
      hasToken: Boolean(state.copilotToken),
      accountType: state.accountType,
    },
    zen: {
      enabled: state.zenMode,
      hasApiKey: Boolean(state.zenApiKey),
    },
    antigravity: {
      enabled: state.antigravityMode,
    },
    rateLimit: {
      seconds: state.rateLimitSeconds,
      lastRequest: state.lastRequestTimestamp,
    },
  }

  return c.json(status)
})
