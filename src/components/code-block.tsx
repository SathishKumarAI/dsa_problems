// Minimal code display: mono block with copy button. No highlighter dependency.
import { useState } from "react"
import { CheckIcon, CopyIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CodeBlock({
  code,
  className,
}: {
  code: string
  className?: string
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

  return (
    <div className={cn("relative rounded-lg border bg-card", className)}>
      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute top-2 right-2 text-muted-foreground"
        onClick={copy}
        aria-label={failed ? "Copying is blocked here" : "Copy code"}
      >
        {copied ? <CheckIcon /> : failed ? <XIcon /> : <CopyIcon />}
      </Button>
      {/* pr-12 keeps the first line clear of the copy button, which floats
          over the block and used to sit on top of it */}
      <pre className="overflow-x-auto p-4 pr-12 font-mono text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}
