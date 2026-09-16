// Pseudocode / Python / Java / C++ tabs with the current frame's line lit.
// A language is normally written line-for-line against the pseudocode (checked
// by journeys.test.ts), so one `line` index highlights the right row in any tab.
//
// B43: a derived act's Java and C++ are faithful translations of the same rung
// and rarely the same LENGTH, so they are listed in `code.unsynced`. Those tabs
// render with the highlight off and say why, which is worth far more than the
// blank tab strip they replaced.
//
// Owns the tab strip and the highlight; the tab choice is a stored pref.

import { cn } from "@/lib/utils"
import type { CodeTabs } from "@/engine"
import { setPref, usePrefs } from "@/lib/store"

const LABELS: Record<string, string> = {
  pseudo: "pseudocode",
  python: "Python 3",
  java: "Java",
  cpp: "C++",
}

export function CodePanel({ code, line }: { code: CodeTabs; line: number }) {
  const { codeTab } = usePrefs()
  // the four language keys, in reading order — never Object.keys, which would
  // put `unsynced` in the tab strip
  const tabs = (["pseudo", "python", "java", "cpp"] as const).filter(
    (k) => code[k]?.length
  )
  type Lang = (typeof tabs)[number]
  const mode: Lang = tabs.includes(codeTab as Lang)
    ? (codeTab as Lang)
    : "pseudo"
  const lines = code[mode] ?? code.pseudo
  const synced = !(code.unsynced ?? []).includes(mode as "java" | "cpp")
  return (
    <div className="overflow-hidden rounded-lg border bg-background/60">
      {tabs.length > 1 && (
        <div
          className="flex gap-0.5 border-b bg-card/60 px-1 pt-1"
          role="tablist"
        >
          {tabs.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={t === mode}
              onClick={() => setPref("codeTab", t)}
              className={cn(
                "rounded-t-md px-2.5 py-1 text-meta font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                t === mode
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {LABELS[t] ?? t}
            </button>
          ))}
        </div>
      )}
      {!synced && (
        <p className="border-b bg-card/60 px-3 py-1.5 text-meta text-muted-foreground">
          the same idea, not the same lines — no row is lit on this tab
        </p>
      )}
      <pre className="overflow-x-auto p-3 font-mono text-ui leading-7">
        {lines.map((l, i) => (
          <div
            key={i}
            className={cn(
              "-mx-3 px-3 whitespace-pre transition-colors",
              synced && i === line
                ? "bg-chart-1/15 text-foreground shadow-[inset_2px_0_0_0] shadow-chart-1"
                : "text-muted-foreground"
            )}
          >
            {l || " "}
          </div>
        ))}
      </pre>
    </div>
  )
}
