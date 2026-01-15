import type { Context, Next } from "hono"

export function requestIdMiddleware() {
  return async (c: Context, next: Next) => {
    let requestId = c.req.header("X-Request-ID")

    if (!requestId) {
      requestId = `req_${crypto.randomUUID()}`
    }

    c.set("requestId", requestId)
    c.header("X-Request-ID", requestId)

    await next()
  }
}

export function getRequestId(c: Context): string {
  return c.get("requestId") ?? ""
}
