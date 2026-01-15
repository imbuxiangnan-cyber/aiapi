import consola from "consola"
import { Hono } from "hono"

import { createDroidsChatCompletion } from "../api"

export const droidsChatRoute = new Hono()

droidsChatRoute.post("/", async (c) => {
  try {
    const body = await c.req.json()
    consola.debug("Droids chat request:", body.model)

    const response = await createDroidsChatCompletion(body)

    if (!response.ok) {
      const text = await response.text()
      consola.error("Droids API error:", text)
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
    consola.error("Droids chat error:", error)
    return c.json({ error: String(error) }, 500)
  }
})
