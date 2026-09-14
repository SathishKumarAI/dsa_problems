// CPython, in a Worker, off the main thread.
//
// Owns: loading the runtime once, running a snippet, and reporting what it
// printed. Owns no UI and no policy about WHEN to load — `use-python.ts` decides
// that, and the answer is "the first time someone presses Run, never before".
//
// Why a Worker and not the main thread: this executes arbitrary Python for as
// long as it takes. `while True: pass` on the main thread freezes the tab and
// the only way out is closing it; here it pins one worker that `use-python.ts`
// can terminate. The challenge editor already made this call for JavaScript and
// the comment there says the same thing.
//
// Two honest limits, both consequences of the same design:
//   * `input()` cannot work. There is no stdin, and the synchronous prompt a
//     learner would expect would have to block a worker that cannot be blocked.
//     It is stubbed to raise something readable rather than hang.
//   * a run can only be stopped by terminating the worker. WebAssembly has no
//     interrupt we can reach from here without SharedArrayBuffer, which needs
//     cross-origin isolation headers a static host may not send. So: kill it,
//     and the next Run pays the load again. Documented in the UI as "stop".

import type { PyodideInterface } from "pyodide"

export interface RunRequest {
  id: number
  code: string
}

export interface RunResult {
  id: number
  ok: boolean
  /** everything the script printed, stdout and stderr interleaved as it ran */
  output: string
  /** the exception's own text, already formatted by Python */
  error?: string
  ms: number
}

export type WorkerMessage =
  | { kind: "ready"; ms: number }
  | { kind: "failed"; error: string }
  | ({ kind: "result" } & RunResult)

let pyodide: PyodideInterface | undefined
let chunks: string[] = []

// A run is capped so that a page cannot be left with a worker spinning forever
// on a typo. Generous on purpose: the teaching scripts do a thousand random
// trials and the slowest measured is well under a second.
const LIMIT_MS = 20_000

async function boot() {
  const started = performance.now()
  // `/pyodide/` is served from our own origin by `scripts/copy-pyodide.mjs`.
  // The import is dynamic so that nothing here is fetched until boot() is called.
  const { loadPyodide } = await import(
    /* @vite-ignore */ `${location.origin}/pyodide/pyodide.mjs`
  )
  pyodide = (await loadPyodide({
    indexURL: `${location.origin}/pyodide/`,
    stdout: (line: string) => chunks.push(line),
    stderr: (line: string) => chunks.push(line),
  })) as PyodideInterface
  // stdin would block a worker nothing can unblock — say so in Python's own
  // voice rather than hanging with no output and no error
  pyodide.runPython(
    "import builtins\n" +
      "def _no_input(prompt=''):\n" +
      "    raise RuntimeError('input() is not available here — this page runs " +
      "the script as written, with no keyboard attached')\n" +
      "builtins.input = _no_input\n"
  )
  return performance.now() - started
}

self.onmessage = async (e: MessageEvent<RunRequest>) => {
  const { id, code } = e.data
  try {
    if (!pyodide) {
      const ms = await boot()
      post({ kind: "ready", ms })
    }
  } catch (err) {
    post({ kind: "failed", error: String(err) })
    return
  }

  chunks = []
  const started = performance.now()
  const timer = setTimeout(() => {
    // the worker cannot interrupt itself; this only guarantees the PAGE hears
    // something. `use-python.ts` terminates the worker on the same deadline.
    post({
      kind: "result",
      id,
      ok: false,
      output: chunks.join("\n"),
      error: `still running after ${LIMIT_MS / 1000}s — stopped`,
      ms: LIMIT_MS,
    })
  }, LIMIT_MS)

  try {
    await pyodide!.runPythonAsync(code)
    clearTimeout(timer)
    post({
      kind: "result",
      id,
      ok: true,
      output: chunks.join("\n"),
      ms: performance.now() - started,
    })
  } catch (err) {
    clearTimeout(timer)
    post({
      kind: "result",
      id,
      ok: false,
      output: chunks.join("\n"),
      // Python's own traceback, which names the line — far more useful than
      // anything this file could say about it
      error: err instanceof Error ? err.message : String(err),
      ms: performance.now() - started,
    })
  }
}

function post(m: WorkerMessage) {
  self.postMessage(m)
}
