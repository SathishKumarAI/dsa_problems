// The page's side of the Python runtime: one worker for the whole tab, created
// on the first Run and never before.
//
// Owns the lifecycle and the "who is running" bookkeeping. Owns no markup —
// `runnable-code.tsx` renders what this returns.
//
// ONE worker, shared. A learn page has up to a dozen Python fences and booting
// a 10.6 MB runtime per block would be absurd; the first Run pays ~2 s and every
// Run after it is immediate. `owner` is which block currently holds it, so two
// blocks cannot render output at once and a second Run while one is in flight
// is refused rather than queued.
//
// The runtime is never created at module scope. Importing this file must cost
// nothing: the whole argument for self-hosting a 10.6 MB runtime is that a
// reader who never presses Run never fetches it.

import { useCallback, useRef, useState, useSyncExternalStore } from "react"
import type { RunResult, WorkerMessage } from "./python.worker.ts"

export interface RunState {
  /** which block id holds the runtime right now, or null */
  owner: string | null
  /** true between the first Run and the runtime being ready */
  booting: boolean
  /** ms the runtime took to boot, once it has */
  bootMs?: number
  /** the runtime could not be loaded at all — offline, or assets not built */
  failed?: string
}

let worker: Worker | undefined
let seq = 0
const pending = new Map<number, (r: RunResult) => void>()

let state: RunState = { owner: null, booting: false }
const listeners = new Set<() => void>()
const set = (next: Partial<RunState>) => {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

function ensure(): Worker {
  if (worker) return worker
  worker = new Worker(new URL("./python.worker.ts", import.meta.url), {
    type: "module",
  })
  worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const m = e.data
    if (m.kind === "ready") return set({ booting: false, bootMs: m.ms })
    if (m.kind === "failed") {
      set({ booting: false, owner: null, failed: m.error })
      // a runtime that failed to load will fail again; drop it so the next Run
      // gets a clean attempt rather than a worker in an unknown state
      worker?.terminate()
      worker = undefined
      pending.forEach((resolve, id) =>
        resolve({ id, ok: false, output: "", error: m.error, ms: 0 })
      )
      pending.clear()
      return
    }
    pending.get(m.id)?.(m)
    pending.delete(m.id)
    set({ owner: null })
  }
  return worker
}

/** kill the runtime mid-run — the only way to stop it (see python.worker.ts) */
export function stopPython() {
  worker?.terminate()
  worker = undefined
  pending.forEach((resolve, id) =>
    resolve({ id, ok: false, output: "", error: "stopped", ms: 0 })
  )
  pending.clear()
  set({ owner: null, booting: false, bootMs: undefined })
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function usePythonState(): RunState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state
  )
}

/**
 * `run(code)` for one block. `id` is any stable string — the block's index on
 * the page is enough; it only has to distinguish this block from its siblings.
 */
export function usePython(id: string) {
  const shared = usePythonState()
  const [result, setResult] = useState<RunResult | undefined>()
  const alive = useRef(true)

  const run = useCallback(
    async (code: string) => {
      if (shared.owner) return // another block holds it; the UI disables Run
      setResult(undefined)
      const first = !worker
      set({ owner: id, booting: first })
      const w = ensure()
      const runId = ++seq
      const out = await new Promise<RunResult>((resolve) => {
        pending.set(runId, resolve)
        w.postMessage({ id: runId, code })
      })
      if (alive.current) setResult(out)
      return out
    },
    [id, shared.owner]
  )

  return {
    run,
    result,
    clear: () => setResult(undefined),
    /** this block is the one running */
    running: shared.owner === id,
    /** something else is, so Run is refused rather than queued */
    blocked: shared.owner !== null && shared.owner !== id,
    booting: shared.booting && shared.owner === id,
    bootMs: shared.bootMs,
    failed: shared.failed,
    alive,
  }
}
