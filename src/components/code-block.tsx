// Minimal code display: mono block with copy button. No highlighter dependency.
import { useState } from "react"
import { CheckIcon, CopyIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CodeBlock({
  code,
  className,
  lang,
}: {
  code: string
  className?: string
  /** shown as a quiet tag in the corner, so a block says what it is before a
   *  reader parses it. Python, Java and C++ look alike for the first line. */
  lang?: string
}) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)

  // clipboard access is refused outright in an insecure context or when the
  // permission is denied, and an unhandled rejection here killed nothing
  // visible — the button just did nothing and said nothing
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setFailed(true)
      setTimeout(() => setFailed(false), 1500)
    }
  }

  const label = failed
    ? "Copying is blocked here"
    : copied
      ? "Copied"
      : "Copy code"

  return (
    <div className={cn("group relative rounded-lg border bg-code", className)}>
      {lang && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-2 left-3 font-mono text-meta text-dim"
        >
          {lang}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        // Quiet at rest, present the moment the block is pointed at or
        // anything inside it takes focus — and a COLOUR rather than an
        // opacity, because a faded control is an invisible one. The two
        // outcomes are said in the palette's own words: chart-3 is "this is
        // correct" and `destructive` is the error role — neither is spent on
        // decoration.
        onClick={copy}
        aria-label={label}
        title={label}
        data-state={copied ? "copied" : failed ? "failed" : "idle"}
        className={cn(
          "absolute top-2 right-2 text-dim",
          !copied &&
            !failed &&
            "group-focus-within:text-foreground group-hover:text-foreground",
          copied && "text-chart-3",
          failed && "text-destructive"
        )}
      >
        {copied ? <CheckIcon /> : failed ? <XIcon /> : <CopyIcon />}
      </Button>
      {/* pr-12 keeps the first line clear of the copy button, which floats
          over the block and used to sit on top of it */}
      <pre
        className={cn(
          "overflow-x-auto p-4 pr-12 font-mono text-ui leading-relaxed",
          lang && "pt-7"
        )}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}
