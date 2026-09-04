// Typed API client. Owns the transport decision only: over HTTP when the
// page is served by Vite (dev/preview mount /api) or VITE_API_URL names a
// server; otherwise in-process against the same routes.ts, so a static
// build on any host keeps working. Every function returns what docs/API.md
// promises; components never call fetch themselves.

import { route } from "./routes.ts"
import type { ArrayFrame, GraphFrame } from "../engine/algorithms.ts"
import type { BaseFrame, Trace, Verdict } from "../engine/types.ts"

export type Data = { nums: number[]; [k: string]: unknown }

const BASE: string | null = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "" : null)

export const apiMode = (): "http" | "local" => (BASE === null ? "local" : "http")

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  if (BASE === null) {
    const r = route(method, path, body)
    if (r.status >= 400) throw new Error((r.body as { error: string }).error)
    return r.body as T
  }
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? res.statusText)
  return json as T
}

export const api = {
  problems: () => call<{ id: string; title: string; pattern: string; difficulty: string; brief: string; journey: string | null }[]>("GET", "/api/problems"),
  journeys: () => call<{ slug: string; title: string; problemId: string; acts: number }[]>("GET", "/api/journeys"),
  preset: (slug: string, preset: string) => call<{ data: Data; info: string | null }>("POST", `/api/journeys/${slug}/preset`, { preset }),
  parse: (slug: string, text: string, params: Record<string, string>) => call<{ data: Data }>("POST", `/api/journeys/${slug}/parse`, { text, params }),
  classify: (slug: string, data: Data) => call<Verdict>("POST", `/api/journeys/${slug}/classify`, { data }),
  run: (slug: string, act: string, data: Data, trace?: Trace | null) => call<{ frames: BaseFrame[] }>("POST", `/api/journeys/${slug}/run`, { act, data, trace: trace ?? null }),
  chart: (slug: string, data: Data, upto: number) => call<{ act: string; name: string; steps: number }[]>("POST", `/api/journeys/${slug}/chart`, { data, upto }),
  runArray: (key: string, array: number[], target?: number) => call<{ frames: ArrayFrame[] }>("POST", `/api/algorithms/${key}/run`, { array, target }),
  runGraph: (key: string, n: number) => call<{ graph: { nodes: { x: number; y: number }[]; edges: [number, number, number][] }; frames: GraphFrame[] }>("POST", `/api/algorithms/${key}/run`, { n }),
}
