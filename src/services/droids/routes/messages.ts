import consola from "consola"
import { Hono } from "hono"

import { createDroidsChatCompletion } from "../api"

export const droidsMessagesRoute = new Hono()

droidsMessagesRoute.post("/", async (c) => {
  try {
    const body = await c.req.json()
    consola.debug("Droids messages request:", body.model)

    const request = {
      model: body.model,
      messages: body.messages,
      max_tokens: body.max_tokens,
      stream: body.stream,
    }

    const response = await createDroidsChatCompletion(request)

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
    consola.error("Droids messages error:", error)
    return c.json({ error: String(error) }, 500)
  }
})
