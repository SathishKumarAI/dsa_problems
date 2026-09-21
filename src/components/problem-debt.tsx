// "What this page still owes" — the gaps, said out loud, at the foot.
//
// Why a reader should see this at all: 152 of 153 pages are thin, and a thin
// page here does not LOOK thin. Every band degrades to nothing when its field
// is absent, so a page with no read-before-you-solve questions reads as a page
// designed without them. That is the site quietly overstating itself.
//
// Three rules this band follows, and they are what keep it from being noise:
//
//   * It says what the READER loses, never what the author failed to write.
//     "nothing here asks whether you understood the statement" — not "checks:
//     missing".
//   * It is the last thing on the page, quiet, and absent entirely when the
//     page owes nothing. A complete page says nothing about its completeness.
//   * It never names an approach or a technique. A gap is a fact about this
//     page; it must not become a spoiler for a journey in flight.
import { debtsOf } from "@/lib/page-debt"
import type { Problem } from "@/data"

export function ProblemDebt({
  problem,
  has,
}: {
  problem: Problem
  has: { journey: boolean; explanation: boolean }
}) {
  const debts = debtsOf(problem, has)
  if (!debts.length) return null
  return (
    <section
      data-page-debt
      aria-labelledby="page-debt-heading"
      className="flex scroll-mt-20 flex-col gap-2 border-t pt-4"
      id="still-owed"
    >
      <h2
        id="page-debt-heading"
        className="text-meta tracking-wide text-dim uppercase"
      >
        What this page still owes
      </h2>
      {/* `text-body`, not `text-meta`. This is a SENTENCE, and U6 refuses
          prose below the ui step while U7 measures a full-measure paragraph in
          characters — at the ui step the same 768px column is 102ch, past the
          96 the gate allows. A sentence filling the reading column is
          `text-body`; quiet comes from the muted role, never from a smaller
          size (DESIGN.md: reach for the role, not the size). */}
      <p className="max-w-measure text-body text-muted-foreground">
        This site is written one problem at a time, and says where it has got
        to. {debts.length} {debts.length === 1 ? "thing is" : "things are"} not
        written yet for this problem.
      </p>
      {/* The measure belongs on the FLOW, not on each line: a flex row of two
          spans has no width of its own, so without this the sentences ran to
          102ch against the column's 96 — caught by U7 on the first run. */}
      <ul className="flex max-w-measure flex-col gap-1.5">
        {debts.map((d) => (
          <li
            key={d.id}
            data-debt={d.id}
            className="flex flex-wrap items-baseline gap-x-2 text-ui"
          >
            <span className="font-medium text-foreground">{d.label}</span>
            <span className="text-muted-foreground">— {d.cost}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
