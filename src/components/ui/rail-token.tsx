// The two-character stand-in a row shows once the sidebar is an icon rail.
//
// Why this exists: collapsed, every pattern row drew the same generic icon and
// every journey row drew the same one — ten identical squares above six more
// identical squares. It technically collapsed and was useless to navigate, so
// the only way back was to expand it again.
//
// 48px of rail has room for about two characters, which is enough to tell one
// row from another, and the colour carries the same not-started / in-progress
// / done state the ring does when there IS room for a ring. Identity and
// status in one glyph, and the tooltip still carries the full name.

import { cn } from "@/lib/utils"

/**
 * "Arrays & Hashing" → "AH", "Stack" → "St", "Two Sum" → "TS",
 * "Triplets Summing to Zero" → "TZ".
 *
 * FIRST and LAST initial rather than the first two, because the first two
 * collide immediately on this content: "Two Sum" and "Triplets Summing to
 * Zero" both give TS, and two identical tokens in the rail is the bug this
 * component exists to fix. Titles still collide in principle — the tooltip is
 * what disambiguates — but the rail shows ten patterns and a handful of
 * journeys in play, not all 46.
 */
export function initials(name: string) {
  const words = name.split(/[^A-Za-z0-9]+/).filter(Boolean)
  if (words.length >= 2)
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  return (words[0]?.slice(0, 2) ?? "??").replace(/^./, (c) => c.toUpperCase())
}

export function RailToken({
  label,
  done,
  total,
  className,
}: {
  /** what the token abbreviates — pass the MASKED name for a masked pattern */
  label: string
  done?: number
  total?: number
  className?: string
}) {
  // A masked pattern must not leak its name through its initials either — the
  // disclosure rule is about the name, not about where the name is rendered.
  const text = label.startsWith("?") ? "?" : initials(label)
  const state =
    total && done === total
      ? "text-chart-3"
      : done
        ? "text-chart-4"
        : "text-muted-foreground"
  return (
    <span
      aria-hidden="true"
      className={cn(
        "hidden w-full shrink-0 text-center font-mono text-meta leading-none font-medium tabular-nums group-data-[collapsible=icon]:block",
        state,
        className
      )}
    >
      {text}
    </span>
  )
}
