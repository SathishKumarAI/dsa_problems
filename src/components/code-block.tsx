// Minimal code display: mono block with copy button. No highlighter dependency.
import { useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
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

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={cn("relative rounded-lg border bg-card", className)}>
      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute top-2 right-2 text-muted-foreground"
        onClick={copy}
        aria-label="Copy code"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}
