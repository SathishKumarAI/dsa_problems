// Vite plugin: serves /api/* from src/api/routes.ts during `vite dev` and
// `vite preview`, so the browser makes real HTTP calls with zero extra
// processes. Same function server/index.ts mounts.

import type { Connect, Plugin } from "vite"
import { route } from "../src/api/routes.ts"

export function apiPlugin(): Plugin {
  const mount = (middlewares: Connect.Server) => {
    middlewares.use((req, res, next) => {
      const url = req.url ?? ""
      if (!url.startsWith("/api")) return next()
      const chunks: Buffer[] = []
      req.on("data", (c: Buffer) => chunks.push(c))
      req.on("end", () => {
        let body: unknown = undefined
        if (chunks.length) {
          try {
            body = JSON.parse(Buffer.concat(chunks).toString("utf8"))
          } catch {
            body = undefined
          }
        }
        const out = route(req.method ?? "GET", url.split("?")[0], body)
        res.statusCode = out.status
        res.setHeader("content-type", "application/json")
        res.end(JSON.stringify(out.body))
      })
    })
  }
  return {
    name: "dsa-api",
    configureServer: (s) => mount(s.middlewares),
    configurePreviewServer: (s) => mount(s.middlewares),
  }
}
