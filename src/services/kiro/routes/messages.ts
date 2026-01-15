import consola from "consola"
import { Hono } from "hono"

import { createKiroChatCompletion } from "../api"

export const kiroMessagesRoute = new Hono()

kiroMessagesRoute.post("/", async (c) => {
  try {
    const body = await c.req.json()
    consola.debug("Kiro messages request:", body.model)

    // Convert Anthropic format to internal format
    const request = {
      model: body.model,
      messages: body.messages,
      max_tokens: body.max_tokens,
      stream: body.stream,
    }

    const response = await createKiroChatCompletion(request)

    if (!response.ok) {
      const text = await response.text()
      return c.json({ error: text }, response.status as 400)
    }

    if (body.stream) {
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      })
    }

    const data = await response.json()
    return c.json(data)
  } catch (error) {
    consola.error("Kiro messages error:", error)
    return c.json({ error: String(error) }, 500)
  }
})
