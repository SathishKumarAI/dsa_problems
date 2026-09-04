// The "Code It" act: an editor whose body runs in a sandboxed Web Worker
// against the same cases the repo's tests use. Owns: the worker harness,
// Run / Trace, per-case results, the scorecard (array touches vs the
// reference, stored history), the structured self-review, and the big
// second test set. Emits onPass (all green) and onTrace (learner trace
// ready for "your code is the animation"). No eval on the main thread.

import { EyeIcon, PlayIcon, ZapIcon } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Challenge, Trace } from "@/engine"
import { K, getStored, setStored } from "@/lib/store"

// The learner's function runs off the main thread; test mode counts array
// touches for the learner AND the reference so step-efficiency is scored.
const WORKER_SRC = `onmessage = (e) => {
  const { code, cases, mode, nums, target, reference } = e.data;
  let fn;
  try { fn = new Function("nums", "target", code); }
  catch (err) { postMessage({ error: String(err.message) }); return; }
  if (mode === "trace") {
    const events = [];
    const arr = nums.slice();
    const proxied = new Proxy(arr, {
      get(t, p) { if (/^\\d+$/.test(p) && events.length < 400) events.push({ op: "get", i: +p, v: t[p] }); return t[p]; },
      set(t, p, v) { if (/^\\d+$/.test(p) && events.length < 400) events.push({ op: "set", i: +p, v }); t[p] = v; return true; },
    });
    let result = null, error = null;
    try { result = fn(proxied, target); } catch (err) { error = String(err.message); }
    postMessage({ trace: { events, result, error } });
    return;
  }
  const counter = (arr, bump) => new Proxy(arr, {
    get(t, p) { if (/^\\d+$/.test(p)) bump(); return t[p]; },
    set(t, p, v) { if (/^\\d+$/.test(p)) bump(); t[p] = v; return true; },
  });
  let refFn = null;
  try { refFn = new Function("nums", "target", reference || ""); } catch {}
  postMessage({ results: cases.map((c) => {
    let touches = 0, refTouches = 0;
    try {
      const got = fn(counter(c.nums.slice(), () => touches++), c.target);
      if (refFn) { try { refFn(counter(c.nums.slice(), () => refTouches++), c.target); } catch {} }
      const isPair = Array.isArray(got) && got.length === 2;
      const ok = c.expected.length === 0
        ? Array.isArray(got) && got.length === 0
        : c.anyPair
          ? isPair && got[0] !== got[1] && c.nums[got[0]] + c.nums[got[1]] === c.target
          : isPair && [...got].sort((a, b) => a - b).join() === c.expected.join();
      return { ok, got: JSON.stringify(got), touches, refTouches };
    } catch (err) { return { ok: false, got: String(err.message), touches, refTouches }; }
  }) });
};`

interface CaseResult {
  ok: boolean
  got: string
  touches: number
  refTouches: number
}

function runWorker(
  msg: unknown,
  timeoutMs = 3000
): Promise<{ error?: string; results?: CaseResult[]; trace?: Trace }> {
  return new Promise((resolve) => {
    const w = new Worker(
      URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" }))
    )
    const timer = setTimeout(() => {
      w.terminate()
      resolve({ error: "timed out — infinite loop?" })
    }, timeoutMs)
    w.onmessage = (e) => {
      clearTimeout(timer)
      w.terminate()
      resolve(e.data)
    }
    w.postMessage(msg)
  })
}

interface Props {
  slug: string
  challenge: Challenge
  data: { nums: number[]; target?: number }
  onPass: (attempts: number) => void
  onTrace: (t: Trace) => void
}

interface Score {
  date: string
  passed: number
  allPass: boolean
  touches: number
}

export function ChallengeEditor({
  slug,
  challenge,
  data,
  onPass,
  onTrace,
}: Props) {
  const [code, setCode] = useState(challenge.starter)
  const [verdict, setVerdict] = useState<{
    text: string
    cls: "ok" | "bad" | ""
  }>({ text: "", cls: "" })
  const [results, setResults] = useState<CaseResult[] | null>(null)
  const [big, setBig] = useState<
    { ok: boolean; touches: number; refTouches: number } | "running" | null
  >(null)
  const [best, setBest] = useState<number | null>(null)
  const attempts = useRef(0)
  const editor = useRef<HTMLTextAreaElement>(null)

  // a stale big-set result on new data would lie — reset during render
  const [seenData, setSeenData] = useState(data)
  if (data !== seenData) {
    setSeenData(data)
    setBig(null)
  }

  const run = async () => {
    attempts.current++
    setVerdict({ text: "running…", cls: "" })
    const out = await runWorker({
      code,
      cases: challenge.cases,
      reference: challenge.reference,
    })
    if (out.error || !out.results) {
      setVerdict({ text: "syntax error: " + out.error, cls: "bad" })
      setResults(null)
      return
    }
    const r = out.results
    const passed = r.filter((x) => x.ok).length
    setResults(r)
    const touches = r.reduce((s, x) => s + x.touches, 0)
    const hist = getStored<Score[]>(K.scorecard(slug), [])
    const prevBest = hist
      .filter((h) => h.allPass)
      .reduce((m, h) => Math.min(m, h.touches), Infinity)
    setStored(
      K.scorecard(slug),
      [
        ...hist,
        {
          date: new Date().toISOString().slice(0, 10),
          passed,
          allPass: passed === r.length,
          touches,
        },
      ].slice(-50)
    )
    setBest(prevBest === Infinity ? null : prevBest)
    if (passed === r.length) {
      setVerdict({ text: `all ${passed} cases pass — you wrote it`, cls: "ok" })
      onPass(attempts.current)
    } else setVerdict({ text: `${passed}/${r.length} passing`, cls: "bad" })
  }

  const trace = async () => {
    setVerdict({ text: "tracing…", cls: "" })
    const out = await runWorker({
      mode: "trace",
      code,
      nums: data.nums,
      target: data.target,
    })
    if (out.error || !out.trace) {
      setVerdict({ text: "syntax error: " + out.error, cls: "bad" })
      return
    }
    setVerdict({
      text: `traced ${out.trace.events.length} array accesses — press Play to watch YOUR code`,
      cls: "",
    })
    onTrace(out.trace)
  }

  const runBig = async () => {
    if (!challenge.big) return
    setBig("running")
    const c = challenge.big.make()
    const out = await runWorker(
      { code, cases: [c], reference: challenge.reference },
      6000
    )
    if (out.error || !out.results)
      return setVerdict({ text: "syntax error: " + out.error, cls: "bad" })
    const r = out.results[0]
    setBig({ ok: r.ok, touches: r.touches, refTouches: r.refTouches })
  }

  const allPass = results !== null && results.every((r) => r.ok)
  const touches = results?.reduce((s, r) => s + r.touches, 0) ?? 0
  const refTouches = results?.reduce((s, r) => s + r.refTouches, 0) ?? 0

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg border bg-background/60 font-mono text-[12.5px]">
        <div className="border-b px-3 py-1.5 text-muted-foreground">
          {challenge.signature}
        </div>
        <textarea
          ref={editor}
          aria-label="your solution"
          spellCheck={false}
          rows={9}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault()
              const t = e.currentTarget
              const s = t.selectionStart
              setCode(code.slice(0, s) + "  " + code.slice(t.selectionEnd))
              requestAnimationFrame(() => t.setSelectionRange(s + 2, s + 2))
            }
          }}
          className="w-full resize-y bg-transparent px-3 py-2 leading-6 text-foreground focus-visible:outline-none"
        />
        <div className="border-t px-3 py-1.5 text-muted-foreground">{"}"}</div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={run}>
          <PlayIcon data-icon="inline-start" />
          Run tests
        </Button>
        <Button size="sm" variant="outline" onClick={trace}>
          <EyeIcon data-icon="inline-start" />
          Watch my code on this input
        </Button>
        <span
          className={cn(
            "text-xs",
            verdict.cls === "ok"
              ? "text-chart-3"
              : verdict.cls === "bad"
                ? "text-chart-5"
                : "text-muted-foreground"
          )}
          aria-live="polite"
        >
          {verdict.text}
        </span>
      </div>

      {results && (
        <div className="flex flex-col gap-1 font-mono text-xs">
          {results.map((r, i) => {
            const c = challenge.cases[i]
            const want =
              c.expected.length === 0
                ? "[]"
                : c.anyPair
                  ? `any pair hitting ${c.target}`
                  : `[${c.expected}]`
            return (
              <div
                key={i}
                className={cn(
                  "rounded px-2 py-1",
                  r.ok
                    ? "bg-chart-3/10 text-chart-3"
                    : "bg-chart-5/10 text-chart-5"
                )}
              >
                {r.ok ? "✓" : "✗"} {challenge.fname}([{c.nums.join(", ")}]
                {c.target !== undefined ? `, ${c.target}` : ""}) → {r.got}
                {!r.ok && (
                  <span className="text-muted-foreground"> want {want}</span>
                )}
                {c.tag && (
                  <span className="ml-2 text-muted-foreground">· {c.tag}</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {results && (
        <div className="grid gap-1 rounded-lg border bg-background/40 p-3 text-xs sm:grid-cols-3">
          <div className="text-[11px] tracking-wide text-muted-foreground uppercase sm:col-span-3">
            scorecard — how you solved it
          </div>
          <div>
            correctness{" "}
            <b className="font-mono">
              {results.filter((r) => r.ok).length}/{results.length}
            </b>
          </div>
          <div>
            array touches <b className="font-mono">{touches}</b>{" "}
            <span className="text-muted-foreground">
              reference {refTouches}
            </span>
          </div>
          <div>
            edges{" "}
            {challenge.cases.map(
              (c, i) =>
                c.tag && (
                  <span
                    key={i}
                    className={cn(
                      "mr-1",
                      results[i].ok ? "text-chart-3" : "text-chart-5"
                    )}
                  >
                    {results[i].ok ? "✓" : "✗"} {c.tag}
                  </span>
                )
            )}
          </div>
          {allPass && best !== null && (
            <div className="sm:col-span-3">
              {touches < best ? (
                <span className="text-chart-3">
                  new best — previous was {best} touches
                </span>
              ) : (
                <span className="text-muted-foreground">
                  your best: {best} touches
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {allPass && challenge.review.length > 0 && (
        <div className="flex flex-col gap-1 rounded-lg border bg-background/40 p-3 text-xs">
          <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
            self-review — what a mentor would ask
          </div>
          {challenge.review.map((it, i) => {
            let v: boolean | undefined
            try {
              v = it.check?.(code)
            } catch {
              v = undefined
            }
            if (v === undefined)
              return (
                <label key={i} className="flex items-center gap-2">
                  <input type="checkbox" className="accent-primary" /> {it.q}
                </label>
              )
            return (
              <div key={i} className={v ? "text-chart-3" : "text-chart-5"}>
                {v ? "✓" : "✗"} {it.q}
                {!v && (
                  <span className="text-muted-foreground">
                    {" "}
                    — worth a second look
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {allPass && challenge.big && (
        <div className="flex flex-col gap-2 rounded-lg border bg-background/40 p-3 text-xs">
          {big === null && (
            <div>
              <Button size="sm" variant="outline" onClick={runBig}>
                <ZapIcon data-icon="inline-start" />
                Set 2: same code, n = {challenge.big.n}
              </Button>
            </div>
          )}
          {big === "running" && (
            <span className="text-muted-foreground">
              running {challenge.big.n} elements…
            </span>
          )}
          {big && big !== "running" && (
            <>
              <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
                {big.ok ? "still correct" : "✗ wrong on the big input"} at n ={" "}
                {challenge.big.n}
              </div>
              {(["you", "ref"] as const).map((who) => {
                const n = who === "you" ? big.touches : big.refTouches
                const max = Math.max(big.touches, big.refTouches, 1)
                return (
                  <div
                    key={who}
                    className="grid grid-cols-[5rem_minmax(0,1fr)_6rem] items-center gap-2"
                  >
                    <span className="text-muted-foreground">
                      {who === "you" ? "your code" : "reference"}
                    </span>
                    <span className="h-3 rounded-[2px] bg-muted/40">
                      <span
                        className={cn(
                          "block h-full rounded-r-[4px]",
                          who === "you" ? "bg-chart-4" : "bg-chart-1"
                        )}
                        style={{ width: `${Math.max(1, (n / max) * 100)}%` }}
                      />
                    </span>
                    <span className="font-mono tabular-nums">
                      {n.toLocaleString()} touches
                    </span>
                  </div>
                )
              })}
              <p className="text-muted-foreground">
                {big.touches > big.refTouches * 5
                  ? `${(big.touches / Math.max(1, big.refTouches)).toFixed(1)}× the reference's work — THIS gap is what O-notation was trying to tell you. It only gets worse.`
                  : `within ${(big.touches / Math.max(1, big.refTouches)).toFixed(1)}× of the reference — your shape scales. This is what a good complexity feels like.`}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
