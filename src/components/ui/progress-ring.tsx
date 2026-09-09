// A count drawn as a ring, so a column of them is scannable without reading
// every number: grey = not started, amber = in progress, green = complete.
// Two stacked circles — a conic-gradient sized by --p, and an inner disc in
// the surrounding background punching the middle out.
//
// The number itself is never lost: it stays in the label, which is what a
// screen reader and the row's tooltip both read.
import { cn } from "@/lib/utils"

export function ProgressRing({
  done,
  total,
  className,
}: {
  done: number
  total: number
  className?: string
}) {
  const pct = total ? Math.round((done / total) * 100) : 0
  const colour =
    done === 0
      ? "var(--muted-foreground)"
      : done >= total
        ? "var(--chart-3)"
        : "var(--chart-4)"
  return (
    <span
      role="img"
      aria-label={`${done} of ${total} solved`}
      title={`${done}/${total} solved`}
      className={cn(
        "relative inline-block size-3.5 shrink-0 rounded-full",
        className
      )}
      style={{
        background: `conic-gradient(${colour} ${pct}%, color-mix(in oklab, var(--muted-foreground) 30%, transparent) 0)`,
      }}
    >
      {/* the hole — only when there is something left to show through it */}
      {done < total && (
        <span className="absolute inset-[3px] rounded-full bg-sidebar" />
      )}
    </span>
  )
}
