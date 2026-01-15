import type { Context } from "hono"

import { Hono } from "hono"
import { cors } from "hono/cors"

import { apiKeyAuthMiddleware } from "./lib/api-key-auth"
import { modelLogger } from "./lib/model-logger"
import { requestIdMiddleware } from "./lib/request-id"
import { state } from "./lib/state"
import { antigravityChatCompletionsRoute } from "./routes/antigravity/chat-completions/route"
import { antigravityMessagesRoute } from "./routes/antigravity/messages/route"
import { antigravityModelsRoute } from "./routes/antigravity/models/route"
import { completionRoutes } from "./routes/chat-completions/route"
import { embeddingRoutes } from "./routes/embeddings/route"
import { messageRoutes } from "./routes/messages/route"
import { modelRoutes } from "./routes/models/route"
import { tokenPoolRoute } from "./routes/token-pool/route"
import { tokenRoute } from "./routes/token/route"
import { usageRoute } from "./routes/usage/route"
import { zenCompletionRoutes } from "./routes/zen/chat-completions/route"
import { zenMessageRoutes } from "./routes/zen/messages/route"
import { zenModelRoutes } from "./routes/zen/models/route"
import { zenResponsesRoutes } from "./routes/zen/responses/route"
import {
  droidsChatRoute,
  droidsMessagesRoute,
  droidsModelsRoute,
} from "./services/droids/routes"
import {
  kiroChatRoute,
  kiroMessagesRoute,
  kiroModelsRoute,
} from "./services/kiro/routes"

export const server = new Hono()

// Middleware
server.use(requestIdMiddleware())
server.use(modelLogger())
server.use(cors())
server.use(apiKeyAuthMiddleware)

server.get("/", (c) => c.text("Server running"))

// Helper to create a new request with modified path
function createSubRequest(c: Context, basePath: string): Request {
  const url = new URL(c.req.url)
  const subPath = url.pathname.slice(basePath.length) || "/"
  url.pathname = subPath
  return new Request(url.toString(), c.req.raw)
}

// Mode-based router helper
function modeRouter(
  c: Context,
  basePath: string,
  routes: {
    copilot: Hono
    zen: Hono
    antigravity: Hono
    kiro: Hono
    droids: Hono
  },
) {
  const req = createSubRequest(c, basePath)
  if (state.zenMode) return routes.zen.fetch(req, c.env)
  if (state.antigravityMode) return routes.antigravity.fetch(req, c.env)
  if (state.kiroMode) return routes.kiro.fetch(req, c.env)
  if (state.droidsMode) return routes.droids.fetch(req, c.env)
  return routes.copilot.fetch(req, c.env)
}

// Route configurations
const chatRoutes = {
  copilot: completionRoutes,
  zen: zenCompletionRoutes,
  antigravity: antigravityChatCompletionsRoute,
  kiro: kiroChatRoute,
  droids: droidsChatRoute,
}

const modelsRoutes = {
  copilot: modelRoutes,
  zen: zenModelRoutes,
  antigravity: antigravityModelsRoute,
  kiro: kiroModelsRoute,
  droids: droidsModelsRoute,
}

const messagesRoutes = {
  copilot: messageRoutes,
  zen: zenMessageRoutes,
  antigravity: antigravityMessagesRoute,
  kiro: kiroMessagesRoute,
  droids: droidsMessagesRoute,
}

// Dynamic routing based on mode
// Chat completions
server.all("/chat/completions/*", (c) =>
  modeRouter(c, "/chat/completions", chatRoutes),
)
server.all("/chat/completions", (c) =>
  modeRouter(c, "/chat/completions", chatRoutes),
)
server.all("/v1/chat/completions/*", (c) =>
  modeRouter(c, "/v1/chat/completions", chatRoutes),
)
server.all("/v1/chat/completions", (c) =>
  modeRouter(c, "/v1/chat/completions", chatRoutes),
)

// Models
server.all("/models/*", (c) => modeRouter(c, "/models", modelsRoutes))
server.all("/models", (c) => modeRouter(c, "/models", modelsRoutes))
server.all("/v1/models/*", (c) => modeRouter(c, "/v1/models", modelsRoutes))
server.all("/v1/models", (c) => modeRouter(c, "/v1/models", modelsRoutes))

// Messages (Anthropic compatible)
server.all("/v1/messages/*", (c) =>
  modeRouter(c, "/v1/messages", messagesRoutes),
)
server.all("/v1/messages", (c) => modeRouter(c, "/v1/messages", messagesRoutes))

// Embeddings
server.route("/embeddings", embeddingRoutes)
server.route("/v1/embeddings", embeddingRoutes)

// Monitoring endpoints
server.route("/usage", usageRoute)
server.route("/token", tokenRoute)
server.route("/api/tokens", tokenPoolRoute)

// OpenAI Responses API (Zen only)
server.all("/v1/responses/*", async (c) => {
  if (state.zenMode) {
    const req = createSubRequest(c, "/v1/responses")
    return zenResponsesRoutes.fetch(req, c.env)
  }
  return c.json({ error: "Responses API requires Zen mode" }, 400)
})
server.all("/v1/responses", async (c) => {
  if (state.zenMode) {
    const req = createSubRequest(c, "/v1/responses")
    return zenResponsesRoutes.fetch(req, c.env)
  }
  return c.json({ error: "Responses API requires Zen mode" }, 400)
})

// Dedicated Zen routes (always available)
server.route("/zen/v1/chat/completions", zenCompletionRoutes)
server.route("/zen/v1/models", zenModelRoutes)
server.route("/zen/v1/messages", zenMessageRoutes)
server.route("/zen/v1/responses", zenResponsesRoutes)

// Dedicated Antigravity routes (always available)
server.route(
  "/antigravity/v1/chat/completions",
  antigravityChatCompletionsRoute,
)
server.route("/antigravity/v1/models", antigravityModelsRoute)
server.route("/antigravity/v1/messages", antigravityMessagesRoute)

// Dedicated Kiro routes (always available)
server.route("/kiro/v1/chat/completions", kiroChatRoute)
server.route("/kiro/v1/models", kiroModelsRoute)
server.route("/kiro/v1/messages", kiroMessagesRoute)

// Dedicated Droids routes (always available)
server.route("/droids/v1/chat/completions", droidsChatRoute)
server.route("/droids/v1/models", droidsModelsRoute)
server.route("/droids/v1/messages", droidsMessagesRoute)
