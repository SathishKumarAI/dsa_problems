// The HTTP API as one pure function: route(method, path, body) -> response.
// Owns every endpoint and its JSON shape. Mounted three ways with zero
// duplication: server/index.ts (node:http), server/vite-api.ts (dev
// middleware), and src/api/client.ts in-process mode (static hosting).
// Docs: docs/API.md. Never touches the DOM, never imports React.

import { PROBLEMS } from "../data/index.ts"
import {
  ALGORITHMS,
  buildArrayFrames,
  buildGraphFrames,
  makeGraph,
} from "../engine/algorithms.ts"
import type { ArrayAlgo, GraphAlgo } from "../engine/algorithms.ts"
import {
  JOURNEYS,
  drain,
  journeyBySlug,
  journeyForProblem,
} from "../engine/index.ts"
import type { AnyJourney, Trace } from "../engine/types.ts"

export interface ApiResponse {
  status: number
  body: unknown
}

const ok = (body: unknown): ApiResponse => ({ status: 200, body })
const err = (status: number, error: string): ApiResponse => ({
  status,
  body: { error },
})

type Body = Record<string, unknown>
const asBody = (b: unknown): Body =>
  b && typeof b === "object" ? (b as Body) : {}

// Journey meta = everything about a journey that survives JSON. view()/run()
// stay in-process; review checks are functions and are omitted too.
export function journeyMeta(j: AnyJourney) {
  return {
    slug: j.slug,
    title: j.title,
    subtitle: j.subtitle,
    problemId: j.problemId,
    leetcode: j.leetcode,
    acts: j.acts.map((a) => ({
      key: a.key,
      name: a.name,
      short: a.short,
      complexity: a.complexity,
      insight: a.insight,
      idea: a.idea,
      tools: a.tools ?? [],
      code: a.code,
      takeaways: a.takeaways,
      hints: a.hints ?? [],
      quiz: a.quiz ?? [],
      gate: a.gate ?? null,
      chart: a.chart !== false,
      nextLabel: a.nextLabel ?? null,
    })),
    resources: j.resources,
    reveals: j.reveals ?? [],
    edgeCases: j.edgeCases,
    presets: Object.fromEntries(
      Object.entries(j.presets).map(([k, p]) => [
        k,
        { label: p.label, info: p.info ?? null },
      ])
    ),
    defaultPreset: j.defaultPreset,
    harder: j.harder ?? null,
    params: j.params ?? [],
    challenge: j.challenge
      ? {
          fname: j.challenge.fname,
          signature: j.challenge.signature,
          starter: j.challenge.starter,
          cases: j.challenge.cases,
          reference: j.challenge.reference,
          review: j.challenge.review.map((r) => r.q),
          big: j.challenge.big ? { n: j.challenge.big.n } : null,
        }
      : null,
    sample: j.sample,
  }
}

const isData = (d: unknown): d is { nums: number[]; [k: string]: unknown } =>
  !!d &&
  typeof d === "object" &&
  Array.isArray((d as { nums?: unknown }).nums) &&
  (d as { nums: unknown[] }).nums.every((n) => Number.isInteger(n))

function runAct(
  j: AnyJourney,
  actKey: unknown,
  data: unknown,
  trace: unknown
): ApiResponse {
  const act = j.acts.find((a) => a.key === actKey)
  if (!act) return err(404, `unknown act ${String(actKey)}`)
  if (!isData(data)) return err(400, "data.nums must be an integer array")
  try {
    return ok({
      frames: drain(act.run(data, { trace: (trace as Trace | null) ?? null })),
    })
  } catch (e) {
    return err(500, String((e as Error).message))
  }
}

// steps per algorithm act on this input, only for acts up to `upto`
// (the caller's unlocked count) — the chart never spoils a locked act
function chart(j: AnyJourney, data: unknown, upto: unknown): ApiResponse {
  if (!isData(data)) return err(400, "data.nums must be an integer array")
  const n = Number.isInteger(upto) ? (upto as number) : j.acts.length
  const rows = j.acts
    .slice(1, n)
    .filter((a) => a.chart !== false)
    .map((a) => ({
      act: a.key,
      name: a.name,
      steps: drain(a.run(data, {})).length,
    }))
  return ok(rows)
}

export function route(
  method: string,
  path: string,
  rawBody?: unknown
): ApiResponse {
  const body = asBody(rawBody)
  const parts = path
    .replace(/^\/api\/?/, "")
    .replace(/\/$/, "")
    .split("/")
    .filter(Boolean)
  const [root, id, action] = parts

  if (root === "problems") {
    if (!id)
      return ok(
        PROBLEMS.map((p) => ({
          id: p.id,
          title: p.title,
          pattern: p.pattern,
          difficulty: p.difficulty,
          brief: p.brief,
          journey: journeyForProblem(p.id)?.slug ?? null,
        }))
      )
    const p = PROBLEMS.find((x) => x.id === id)
    return p
      ? ok({ ...p, journey: journeyForProblem(p.id)?.slug ?? null })
      : err(404, `unknown problem ${id}`)
  }

  if (root === "journeys") {
    if (!id)
      return ok(
        JOURNEYS.map((j) => ({
          slug: j.slug,
          title: j.title,
          problemId: j.problemId,
          acts: j.acts.length,
        }))
      )
    const j = journeyBySlug(id)
    if (!j) return err(404, `unknown journey ${id}`)
    if (!action) return ok(journeyMeta(j))
    if (method !== "POST") return err(405, "POST required")
    switch (action) {
      case "preset": {
        const p = j.presets[String(body.preset ?? j.defaultPreset)]
        return p
          ? ok({ data: p.make(), info: p.info ?? null })
          : err(404, `unknown preset ${String(body.preset)}`)
      }
      case "parse": {
        const d = j.parse(
          String(body.text ?? ""),
          asBody(body.params) as Record<string, string>
        )
        return d ? ok({ data: d }) : err(400, "could not parse input")
      }
      case "classify":
        return isData(body.data)
          ? ok(j.classify(body.data))
          : err(400, "data.nums must be an integer array")
      case "run":
        return runAct(j, body.act, body.data, body.trace)
      case "chart":
        return chart(j, body.data, body.upto)
      default:
        return err(404, `unknown action ${action}`)
    }
  }

  if (root === "algorithms") {
    if (!id)
      return ok(
        Object.entries(ALGORITHMS).map(([key, a]) => ({
          key,
          name: a.name,
          kind: a.kind,
          complexity: a.complexity,
        }))
      )
    const a = ALGORITHMS[id]
    if (!a) return err(404, `unknown algorithm ${id}`)
    if (!action)
      return ok({
        key: id,
        name: a.name,
        kind: a.kind,
        complexity: a.complexity,
        pseudocode: a.pseudocode,
      })
    if (action !== "run" || method !== "POST")
      return err(404, `unknown action ${action}`)
    if (a.kind === "graph") {
      const g = makeGraph(Number.isInteger(body.n) ? (body.n as number) : 9)
      return ok({
        graph: { nodes: g.nodes, edges: g.edges },
        frames: buildGraphFrames(a as GraphAlgo, g),
      })
    }
    if (
      !Array.isArray(body.array) ||
      !body.array.every((n) => Number.isInteger(n))
    )
      return err(400, "array must be an integer array")
    return ok({
      frames: buildArrayFrames(
        a as ArrayAlgo,
        body.array as number[],
        typeof body.target === "number" ? body.target : undefined
      ),
    })
  }

  return err(404, `no route for ${method} ${path}`)
}
