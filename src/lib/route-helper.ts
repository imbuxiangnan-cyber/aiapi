import type { Context, Hono } from "hono"

import { state } from "./state"

export function createSubRequest(c: Context, basePath: string): Request {
  const url = new URL(c.req.url)
  const subPath = url.pathname.slice(basePath.length) || "/"
  url.pathname = subPath
  return new Request(url.toString(), c.req.raw)
}

interface RouteConfig {
  copilot: Hono
  zen: Hono
  antigravity: Hono
}

export function createModeRouter(config: RouteConfig) {
  return async (c: Context, basePath: string) => {
    const req = createSubRequest(c, basePath)
    if (state.zenMode) return config.zen.fetch(req, c.env)
    if (state.antigravityMode) return config.antigravity.fetch(req, c.env)
    return config.copilot.fetch(req, c.env)
  }
}

export function registerRoutes(
  server: Hono,
  paths: Array<string>,
  config: RouteConfig,
) {
  const router = createModeRouter(config)

  for (const path of paths) {
    server.all(`${path}/*`, (c) => router(c, path))
    server.all(path, (c) => router(c, path))
  }
}
