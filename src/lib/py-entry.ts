// Which function in a Python block is the way in, and whether the block calls
// anything at all.
//
// A port of the half of `scripts/localsmith/run.mjs` that decides what to
// invoke. It is duplicated rather than imported because that module reaches for
// `node:child_process` at load — it exists to spawn compilers — and the browser
// needs only these twenty lines. The two are checked against each other by
// `py-entry.test.ts`, which runs the same cases the driver does.
//
// Pure and DOM-free, so the test runs under `node --test` with no browser.

/** top-level `def`s, in source order */
function defs(src: string): { name: string; at: number }[] {
  const out: { name: string; at: number }[] = []
  const lines = src.split("\n")
  for (let i = 0; i < lines.length; i++) {
    const m = /^def ([A-Za-z_]\w*)/.exec(lines[i])
    if (m) out.push({ name: m[1], at: i })
  }
  return out
}

/**
 * The definition nobody else calls — the way in.
 *
 * A document's approach often carries a helper beside the answer (`_at_most`,
 * `bracket_kind`, `apply_op`), and the helper is the one that is CALLED. So the
 * entry is the last root: the last def that no other def mentions.
 */
export function pyEntry(src: string): string | null {
  const found = defs(src)
  if (!found.length) return null
  if (found.length === 1) return found[0].name
  const lines = src.split("\n")
  const bodyOf = (d: { name: string; at: number }) => {
    const next = found.find((o) => o.at > d.at)
    return lines.slice(d.at, next ? next.at : lines.length).join("\n")
  }
  const called = new Set<string>()
  for (const d of found)
    for (const o of found)
      if (o !== d && new RegExp(`\\b${o.name}\\s*\\(`).test(bodyOf(d)))
        called.add(o.name)
  const roots = found.filter((d) => !called.has(d.name))
  return (roots.at(-1) ?? found.at(-1))!.name
}

/**
 * Does this block PRINT anything when executed, on its own?
 *
 * The first version of this asked whether the block had any top-level
 * statement, which is not the same question and got the very first block wrong:
 * balanced-brackets' opening fence declares `PAIRS = {...}` at module scope, so
 * it "does something" and still printed nothing. A constant is not output.
 *
 * Only two things make a block print on its own — a `print(` at the left
 * margin, or a `__main__` guard, which is how every full runnable script in the
 * corpus starts itself. Everything else gets a call appended.
 */
export function printsSomething(src: string): boolean {
  return src
    .split("\n")
    .some((line) => /^print\(/.test(line) || /^if\s+__name__\s*==/.test(line))
}
