// The arithmetic behind a constraint's figure: how long a bar is, and how a
// very large number is written so a reader can take it in at a glance.
//
// A `.ts` with a test rather than arithmetic inlined in JSX, because both of
// these are easy to get subtly wrong and impossible to notice: a linear bar for
// 5·10⁹ against 10⁵ renders the small one at 0.002% — an invisible sliver that
// says "nothing here" when the point is "this is the affordable one".

/**
 * Where a value sits on a LOG scale, as a percentage.
 *
 * Log, not linear, and that is the whole reason this file exists. These figures
 * compare quantities four orders of magnitude apart; on a linear scale every
 * bar but the largest is a hairline, which draws the opposite of the lesson.
 * On a log scale each power of ten is a fixed step, so "three thousand times
 * more work" reads as three and a bit steps.
 *
 * `floor` keeps the smallest bar visible: a bar of width 0 is not a small
 * quantity, it is a missing one.
 */
export function logWidth(value: number, max: number, floor = 8): number {
  if (!(value > 0) || !(max > 0)) return 0
  const span = Math.log10(max)
  if (span <= 0) return 100
  const pct = (Math.log10(value) / span) * 100
  return Math.max(floor, Math.min(100, Math.round(pct)))
}

const SUPER: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
}

const superscript = (n: number) =>
  String(n)
    .split("")
    .map((d) => SUPER[d] ?? d)
    .join("")

/**
 * A big number as a reader says it out loud: `5·10⁹`, `100 000`, `12`.
 *
 * Under ten thousand it is written in full with thin spaces, because "5000" is
 * a quantity a reader already holds. Above it, powers of ten — the mantissa is
 * dropped when it rounds to 1, so 10⁵ never renders as the noisier `1·10⁵`.
 */
export function compact(n: number): string {
  if (!Number.isFinite(n)) return "∞"
  if (n < 0) return `−${compact(-n)}`
  // Grouped by hand rather than through `toLocaleString`: the locale separator
  // is not the plain space it looks like, so a test comparing "1 000" with
  // "1 000" fails on two strings that render identically.
  if (n < 10_000) return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  const exp = Math.floor(Math.log10(n))
  const rounded = Math.round((n / 10 ** exp) * 10) / 10
  // `·` separates the mantissa from the power, and NOTHING touches the
  // decimal point — replacing it turned 1.7·10⁶ into 1·7·10⁶, which reads
  // as a product rather than as a number.
  return rounded === 1
    ? `10${superscript(exp)}`
    : `${rounded}·10${superscript(exp)}`
}
