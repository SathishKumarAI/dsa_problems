// A Python block you can run, and — where the page says so — edit.
//
// Owns the Run affordance and the output panel. Owns no runtime (`use-python.ts`)
// and no code styling (`code-block.tsx`, which this wraps so there is exactly one
// code surface on the site rather than a second one nobody maintains).
//
// The whole point, stated once: every ```python fence on a learn page is already
// executed on every pull request by `scripts/verify-deep.mjs`, which runs the
// document's full script and requires it to report that its approaches agreed.
// The code on this page is not illustrative — it is the code CI ran. This
// component is the difference between telling a reader that and showing them.
//
// EVERY block is editable, and nothing is saved. A reader learns by changing a
// line and seeing what happens, and the draft is component state — navigate away
// and the author's version is back. That is deliberate: this is a teaching
// document, not the reader's file, and an edit that persisted would quietly
// become a fork of the document nobody can tell from the original.
//
// EVERY block also PRINTS something. Measured in a real browser on 2026-09-15:
// three of the four Run buttons on balanced-brackets gave "exit 0 · 5 ms" and
// "the script printed nothing", because every approach fence in every teaching
// document is a bare function definition — no print, no top-level call. A
// definition has nothing to print. So when a block defines a function and calls
// nothing, Run appends one line that calls it on the problem's own first test
// case (`data/demos.ts`, generated from the vectors that drive the Java and C++
// gates). The appended line is shown in the output, not hidden, so nobody is
// left wondering where a number came from.
import { useState } from "react"
import { PlayIcon, RotateCcwIcon, SquareIcon } from "lucide-react"
import { CodeBlock } from "./code-block"
import { cn } from "@/lib/utils"
import { DEMOS } from "@/data/demos"
import { printsSomething, pyEntry } from "@/lib/py-entry"
import { PREAMBLE, stripFuture } from "@/lib/py-preamble"
import { stopPython, usePython } from "@/lib/use-python"

export function RunnableCode({
  id,
  code,
  problemId,
  scaffold,
  editable = true,
  className,
}: {
  /** stable within the page — the block's index is enough */
  id: string
  code: string
  /** the document's own runnable script, minus its `__main__` guard. A fence is
   *  an EXCERPT of it and inherits its helpers — `format_range`, `seed_sum`,
   *  `PAIRS` — so without this 45 of the 184 fences raise NameError. Measured
   *  by `scripts/verify-fences.mjs`, which runs the same three pieces. */
  scaffold?: string
  /** whose test case to call the block with; absent on a block with no problem
   *  behind it, which then runs exactly as written */
  problemId?: string
  editable?: boolean
  className?: string
}) {
  const [draft, setDraft] = useState(code)
  const { run, result, clear, running, blocked, booting, failed } = usePython(id)
  const edited = editable && draft !== code

  const source = editable ? draft : code

  // The line the Run button adds, or "" when the block already does something.
  // Derived from the DRAFT, so a reader who types their own `print(...)` stops
  // getting ours — which is the whole point of letting them edit it.
  const entry = printsSomething(source) ? null : pyEntry(source)
  const args = problemId ? DEMOS[problemId] : undefined
  const call =
    entry && args !== undefined
      ? `\n\n# ── added by Run, so the block prints something: your code, on this\n# problem's first test case. Edit it, or write your own call instead.\nprint(${entry}(${args}))`
      : ""
  // A fence is an EXCERPT: it was lifted out of a document that declares its
  // imports and its node classes once at the top, so on its own it raises
  // NameError before reaching the algorithm — `Optional`, `ListNode`,
  // `TreeNode`. The preamble is the same scaffolding the Java and C++ gates
  // drive Python with, so the block runs here the way it runs in CI. A block
  // that starts itself is a full script and is run exactly as written.
  const toRun = call
    ? PREAMBLE +
      (scaffold ? stripFuture(scaffold) + "\n" : "") +
      stripFuture(source) +
      call
    : source

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {editable ? (
        <div className="overflow-hidden rounded-lg border bg-card">
          <textarea
            value={draft}
            spellCheck={false}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="the script, yours to change"
            className="block h-80 w-full resize-y bg-transparent p-4 font-mono text-ui leading-relaxed text-foreground focus-visible:outline-none"
          />
        </div>
      ) : (
        <CodeBlock code={code} className="w-0 min-w-full" />
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          onClick={() => (running ? stopPython() : run(toRun))}
          disabled={blocked}
          className={cn(
            "inline-flex min-h-11 items-center gap-1.5 rounded-md border px-3 text-meta font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:min-h-8",
            running
              ? "border-chart-5/50 bg-chart-5/10 text-chart-5 hover:bg-chart-5/20"
              : "border-chart-3/50 bg-chart-3/10 text-chart-3 hover:bg-chart-3/20",
            blocked && "cursor-not-allowed opacity-50"
          )}
        >
          {running ? (
            <>
              <SquareIcon aria-hidden className="size-3.5 shrink-0" />
              {booting ? "loading Python…" : "stop"}
            </>
          ) : (
            <>
              <PlayIcon aria-hidden className="size-3.5 shrink-0" />
              Run
            </>
          )}
        </button>

        {edited && (
          <button
            onClick={() => {
              setDraft(code)
              clear()
            }}
            className="inline-flex min-h-11 items-center gap-1.5 text-meta text-muted-foreground underline-offset-2 hover:text-foreground hover:underline lg:min-h-8"
          >
            <RotateCcwIcon aria-hidden className="size-3.5 shrink-0" />
            reset to the document's version
          </button>
        )}

        {blocked && !running && (
          <span className="text-meta text-dim">another block is running</span>
        )}

        {/* The first Run fetches 10.6 MB of CPython. Saying so before it starts
            is the difference between a slow button and a broken one. */}
        {booting && (
          <span className="text-meta text-dim">
            fetching CPython — 10.6 MB, once per tab
          </span>
        )}

        {result && !running && (
          <span
            className={cn(
              "font-mono text-meta",
              result.ok ? "text-chart-3" : "text-chart-5"
            )}
          >
            {result.ok ? "exit 0" : "error"} · {Math.round(result.ms)} ms
          </span>
        )}
      </div>

      {failed && !result && (
        <p className="rounded-lg border border-chart-5/40 bg-chart-5/8 px-3 py-2 text-meta text-chart-5">
          Python could not be loaded here. The runtime is served from this site
          at <code className="font-mono">/pyodide/</code>; if you are running a
          dev server, <code className="font-mono">npm run assets:pyodide</code>{" "}
          puts it there.
        </p>
      )}

      {result && (
        // `max-h-96`: the teaching scripts print a line per approach per case
        // and the cycle-detect one runs to 90 lines. Looked at in a browser:
        // unbounded, the output pushed the rest of the document a screen and a
        // half down, and the reader lost the code they had just run.
        <div className="rounded-lg border bg-card">
          <div className="flex items-center gap-2 border-b px-3 py-1.5">
            <span className="font-mono text-meta text-dim">output</span>
            {edited && (
              <span className="font-mono text-meta text-chart-4">
                your version, not the document's
              </span>
            )}
            <button
              onClick={clear}
              className="ml-auto text-meta text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              clear
            </button>
          </div>
          <pre className="max-h-96 w-0 min-w-full overflow-auto px-4 py-3 font-mono text-ui leading-relaxed">
            {result.output || (
              <span className="text-dim">
                {result.error
                  ? ""
                  : entry
                    ? `${entry}() is defined but nothing called it — add a print(), or run the full script at the foot of this page`
                    : "the script printed nothing"}
              </span>
            )}
            {result.error && (
              <span className="mt-2 block text-chart-5">{result.error}</span>
            )}
          </pre>
        </div>
      )}
    </div>
  )
}
