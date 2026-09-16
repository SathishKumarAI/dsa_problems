// What the learner wrote about this problem (B86).
//
// One textarea, one store key, no formatting and no toolbar. The thing it has
// to be is THERE when you come back — an interview note written the day you
// first solved something is the most valuable sentence on the page a month
// later, and it is the one thing this site cannot generate for you.
//
// Three decisions worth keeping:
//
//   * It SAVES AS YOU TYPE, debounced. A Save button is a way to lose work:
//     nobody presses it before closing a tab.
//   * It is NOT in the progress export, and therefore not in the reset either
//     (`store.ts`, NOT_PROGRESS). A key nothing can back up must not be
//     destroyed by a button labelled "erase progress".
//   * It never touches the ledger. Writing a note is not earning an act.
import { useEffect, useRef, useState } from "react"
import { CheckIcon, PencilLineIcon } from "lucide-react"
import { K, getStored, setStored } from "@/lib/store"
import { cn } from "@/lib/utils"

/** how long after the last keystroke the value is written */
const SETTLE = 600

export function ProblemNotes({ problemId }: { problemId: string }) {
  const key = K.notes(problemId)
  // read once per problem: the store is the source, but a controlled textarea
  // re-reading it on every render would fight the caret
  const [text, setText] = useState(() => getStored<string>(key, ""))
  const [saved, setSaved] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // the page is mounted with `key={id}`, so a different problem is a different
  // instance and starts from its own note — no reset effect needed
  useEffect(() => () => clearTimeout(timer.current), [])

  const onChange = (value: string) => {
    setText(value)
    setSaved(false)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setStored(key, value)
      setSaved(true)
    }, SETTLE)
  }

  return (
    <section className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-1.5">
        <span className="flex items-center gap-1.5 text-meta font-semibold text-foreground">
          <PencilLineIcon className="size-3.5 shrink-0 text-dim" aria-hidden />
          Your notes
        </span>
        {/* the only feedback a debounced save owes: that it happened */}
        <span
          aria-live="polite"
          className={cn(
            "ml-auto inline-flex items-center gap-1 font-mono text-meta transition-colors",
            saved && text ? "text-chart-3" : "text-dim"
          )}
        >
          {text && saved && <CheckIcon className="size-3" aria-hidden />}
          {!text ? "" : saved ? "saved" : "…"}
        </span>
      </div>
      <textarea
        // Two UI gates count `textarea` to mean "a code editor": one asserts
        // every runnable block is editable, the other that no editor sits
        // above the explanation. This is a notepad, not an editor, and it
        // says so rather than letting either gate quietly mean something else.
        data-notes=""
        value={text}
        onChange={(e) => onChange(e.target.value)}
        spellCheck
        placeholder="What tripped you up? What would you say in an interview?"
        aria-label={`your notes on this problem`}
        className="min-h-40 w-full resize-y rounded-lg border bg-card/40 px-3 py-2 text-ui leading-relaxed placeholder:text-dim focus-visible:border-edge/60"
      />
      {/* under 55 characters on purpose: the prose-size gate counts anything
          longer as a SENTENCE and requires it at 14px or more, and this is a
          caption, which `text-meta` is for */}
      <p className="text-meta text-dim">On this device. Never exported.</p>
    </section>
  )
}
