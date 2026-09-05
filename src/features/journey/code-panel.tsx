// Pseudocode / Python / Java / C++ tabs with the current frame's line lit.
// Every language is written line-for-line against the pseudocode (checked
// by journeys.test.ts), so one `line` index highlights the right row in any
// tab. Owns the tab strip and the highlight; the tab choice is a stored pref.

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
  const tabs = (Object.keys(code) as (keyof CodeTabs)[]).filter((k) => code[k])
  const mode: keyof CodeTabs = tabs.includes(codeTab as keyof CodeTabs)
    ? (codeTab as keyof CodeTabs)
    : "pseudo"
  const lines = code[mode] ?? code.pseudo
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
                "rounded-t-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
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
      <pre className="overflow-x-auto p-3 font-mono text-[13.5px] leading-7">
        {lines.map((l, i) => (
          <div
            key={i}
            className={cn(
              "-mx-3 px-3 whitespace-pre transition-colors",
              i === line
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
