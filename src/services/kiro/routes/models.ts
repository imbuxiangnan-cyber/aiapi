import { Hono } from "hono"

import { getKiroModels } from "../models"

export const kiroModelsRoute = new Hono()

kiroModelsRoute.get("/", (c) => {
  const models = getKiroModels()
  return c.json(models)
})
