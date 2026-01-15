/**
 * Antigravity Models Route
 *
 * OpenAI-compatible models endpoint for Antigravity.
 */

import { Hono } from "hono"

import { getAntigravityModels } from "~/services/antigravity/get-models"

const app = new Hono()

app.get("/", async (c) => {
  const models = await getAntigravityModels()
  return c.json(models)
})

export const antigravityModelsRoute = app
