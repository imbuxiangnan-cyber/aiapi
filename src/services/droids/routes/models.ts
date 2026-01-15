import { Hono } from "hono"

import { getDroidsModels } from "../models"

export const droidsModelsRoute = new Hono()

droidsModelsRoute.get("/", (c) => {
  const models = getDroidsModels()
  return c.json(models)
})
