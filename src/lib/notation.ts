// Splitting a constraint line into the parts that are NOTATION and the parts
// that are English.
//
// Why. `Problem.constraints` holds both — `1 <= nums.length <= 10^5` and "a
// single element cannot repeat, so a one-element array is always false" — and
// the page set the whole field in the mono face. Counted across the corpus:
// **668 constraint lines, of which 170 are notation and 498 are sentences**, so
// three quarters of the bounds on this site were prose wearing a code face.
// DESIGN.md is explicit that mono means "values, indices, counts, act keys,
// code blocks, notation glyphs" — a sentence is none of those, and a sentence
// in the data face reads as something the reader is supposed to type.
//
// A per-LINE choice cannot work, because the most useful lines are hybrids:
//
//     1 <= nums[i] <= n — every value is a legal index of the array
//
// Mono for the whole line makes the English hard to read; sans for the whole
// line makes the bound hard to scan. So the split is per RUN, which is what a
// typesetter would do with it anyway.
//
// This file owns the classification and nothing else — no markup, no colour.

export type Run = { text: string; mono: boolean }

/**
 * Is this whitespace-delimited token part of the notation rather than the
 * sentence?
 *
 * Deliberately narrow. A token qualifies when it carries no letters at all
 * (`10^5`, `<=`, `2^31`), when it holds a comparison or an index (`nums[i]`,
 * `words[i].length`), or when it is a bare identifier whose NEIGHBOUR is one of
 * those — which is what makes the `n` in `1 <= nums[i] <= n` notation and the
 * `n` in "n is never negative" a word.
 */
const symbolic = (t: string) =>
  // No letters AND carrying a digit or an operator. The second half is
  // load-bearing: an em dash has no letters either, and without it every
  // "— every value is a legal index" began with a mono glyph.
  (/^[^A-Za-z]+$/.test(t) && /[0-9<>=≤≥[\]^*/+]/.test(t)) ||
  // a comparison, or a token carrying one
  /[<>=≤≥]/.test(t) ||
  // an index or a property path: nums[i], words[i].length, grid[0][0]
  /^[A-Za-z_]\w*(\[[^\]]*\]|\.\w+)+[,.]?$/.test(t) ||
  // a power or a product written inline: 10^4, 2^31, 5*10^4
  /^[A-Za-z0-9_]+\^[-\w]+[,.]?$/.test(t)

/** a bare identifier — `n`, `k`, `nums` — which is notation only next to some */
const bareName = (t: string) => /^[A-Za-z_]\w{0,7}[,.]?$/.test(t)

export function runsOf(line: string): Run[] {
  const tokens = line.split(/(\s+)/).filter((t) => t !== "")
  const words = tokens.filter((t) => t.trim() !== "")
  if (words.length === 0) return [{ text: line, mono: false }]

  // pass 1: the tokens that are notation on their own
  const isMono = tokens.map((t) => (t.trim() === "" ? null : symbolic(t)))

  // pass 2: a bare name beside notation joins it. One hop only — otherwise
  // "every value is a legal index" creeps leftwards into the bound.
  for (let i = 0; i < tokens.length; i++) {
    if (isMono[i] !== false || !bareName(tokens[i])) continue
    const prev = isMono
      .slice(0, i)
      .filter((v) => v !== null)
      .pop()
    const next = isMono.slice(i + 1).find((v) => v !== null)
    // only next to a token carrying a COMPARISON, not merely to any symbol,
    // so a trailing "— every value is a legal index" stays English
    const near = (j: number, dir: number) => {
      for (let k = j + dir; k >= 0 && k < tokens.length; k += dir) {
        if (tokens[k].trim() === "") continue
        return /[<>=≤≥]/.test(tokens[k])
      }
      return false
    }
    if ((prev && near(i, -1)) || (next && near(i, 1))) isMono[i] = true
  }

  // merge neighbouring tokens of the same kind, whitespace following its left
  const runs: Run[] = []
  for (let i = 0; i < tokens.length; i++) {
    const mono = isMono[i] ?? runs[runs.length - 1]?.mono ?? false
    const last = runs[runs.length - 1]
    if (last && last.mono === mono) last.text += tokens[i]
    else runs.push({ text: tokens[i], mono })
  }
  // a run of pure whitespace at a boundary belongs to neither; give it to the
  // prose side so a mono span never carries a trailing space's background
  return runs
    .map((r) => (r.text.trim() === "" ? { ...r, mono: false } : r))
    .filter((r) => r.text !== "")
}
