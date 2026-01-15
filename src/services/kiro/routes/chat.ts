import consola from "consola"
import { Hono } from "hono"

import { createKiroChatCompletion } from "../api"

export const kiroChatRoute = new Hono()

kiroChatRoute.post("/", async (c) => {
  try {
    const body = await c.req.json()
    consola.debug("Kiro chat request:", body.model)

    const response = await createKiroChatCompletion(body)

    if (!response.ok) {
      const text = await response.text()
      consola.error("Kiro API error:", text)
      return c.json({ error: text }, response.status as 400)
    }

    // Stream or non-stream response
    if (body.stream) {
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }

    const data = await response.json()
    return c.json(data)
  } catch (error) {
    consola.error("Kiro chat error:", error)
    return c.json({ error: String(error) }, 500)
  }
})
