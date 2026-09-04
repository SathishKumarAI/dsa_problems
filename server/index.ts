// Standalone HTTP API: node server/index.ts  (Node 24 strips the types).
// Owns: listening, JSON body parsing, CORS for a separately hosted UI.
// Owns no routing — every endpoint lives in src/api/routes.ts.

import { createServer } from "node:http"
import { route } from "../src/api/routes.ts"

const PORT = Number(process.env.PORT) || 8787

createServer((req, res) => {
  const chunks: Buffer[] = []
  req.on("data", (c: Buffer) => chunks.push(c))
  req.on("end", () => {
    const url = new URL(req.url ?? "/", "http://localhost")
    let body: unknown = undefined
    if (chunks.length) {
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf8"))
      } catch {
        body = undefined
      }
    }
    const out =
      req.method === "OPTIONS"
        ? { status: 204, body: "" }
        : route(req.method ?? "GET", url.pathname, body)
    res.writeHead(out.status, {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "content-type",
      "access-control-allow-methods": "GET,POST,OPTIONS",
    })
    res.end(out.status === 204 ? "" : JSON.stringify(out.body))
  })
}).listen(PORT, () =>
  console.log(`api on http://localhost:${PORT}/api/problems`)
)
