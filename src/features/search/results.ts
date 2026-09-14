// What the palette can find, and in what order. Owns the index and the
// ranking; owns no rendering and no state.
//
// DISCLOSURE: the index is built FROM the mask, not filtered by it. A masked
// pattern's name is neither displayed nor searchable — typing "two pointers"
// while Two Sum is midway through teaching it must not hand back the list of
// two-pointer problems, which is the same leak the catalogue header avoids.
// Acts, approaches and journey subtitles are not indexed at all: a subtitle
// like "a monotone yes/no over a range is a binary search" names the pattern
// the journey is still withholding (koko-bananas).

// The MANIFEST for the problems, the real records for nothing. The palette
// indexes a title, a pattern, a difficulty and a slug — six fields — and
// reading them off `PROBLEMS` put all 127 statements, constraint lists, hint
// ladders and code blocks in three languages into the first chunk so that
// pressing Ctrl-K could match a title.
import { PATTERNS } from "@/data"
import { CATALOGUE as PROBLEMS } from "@/data/manifest"
import type { Difficulty } from "@/data"
import { JOURNEY_CARDS as JOURNEYS } from "@/engine/manifest"
import type { Mask } from "@/lib/disclosure"
import { MASKED_NAME } from "@/lib/disclosure"

export interface Hit {
  /** stable id for the recent list: "p:<problemId>" | "j:<slug>" */
  key: string
  kind: "problem" | "journey"
  title: string
  /** display text, already masked — never a name the learner has not earned */
  pattern: string
  difficulty?: Difficulty
  /** hash route, handed straight to navigate() */
  path: string
  /** lowercase match text; a masked pattern name is not in it */
  hay: string
}

const NAMES = new Map(PATTERNS.map((p) => [p.id, p.name]))

/** the slug form of a pattern name, removed from a slug while it is masked */
const strip = (slug: string, name: string) =>
  slug.replaceAll(name.toLowerCase().replace(/\s+/g, "-"), "")

/** for the placeholder — counted, never typed, so it cannot go stale */
export const COUNTS = { problems: PROBLEMS.length, journeys: JOURNEYS.length }

export function buildIndex(mask: Mask): Hit[] {
  const hits: Hit[] = []
  const hit = (
    key: string,
    kind: Hit["kind"],
    title: string,
    patternId: string,
    path: string,
    extra: string,
    difficulty?: Difficulty
  ) => {
    const masked = mask.hidden.has(patternId)
    const name = NAMES.get(patternId) ?? patternId
    hits.push({
      key,
      kind,
      title,
      pattern: masked ? MASKED_NAME : name,
      difficulty,
      path,
      // The name is cut out of the SLUG too, not just dropped as a field:
      // "binary-search" is the LeetCode slug of one of the problems it hides,
      // so leaving it in let a learner type the withheld name and get the
      // group back — an inference the catalogue itself does not offer.
      // Measured, not guessed: "binary search" returned two of them before
      // this line. The rest of the slug stays searchable ("koko" still finds
      // koko-eating-bananas).
      hay: `${title} ${masked ? strip(extra, name) : `${extra} ${name}`}`.toLowerCase(),
    })
  }

  for (const p of PROBLEMS)
    hit(
      `p:${p.id}`,
      "problem",
      p.title,
      p.pattern,
      `/p/${p.pattern}/${p.id}`,
      p.leetcode,
      p.difficulty
    )

  for (const j of JOURNEYS) {
    const p = PROBLEMS.find((x) => x.id === j.problemId)
    hit(
      `j:${j.slug}`,
      "journey",
      j.title,
      p?.pattern ?? "",
      `/journey/${j.slug}`,
      j.slug,
      p?.difficulty
    )
  }
  return hits
}

/** every token must appear somewhere; a title match outranks a slug match */
export function search(index: Hit[], query: string, limit = 8): Hit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const tokens = q.split(/\s+/)
  const scored: { hit: Hit; score: number }[] = []
  for (const h of index) {
    if (!tokens.every((t) => h.hay.includes(t))) continue
    const title = h.title.toLowerCase()
    const score = title.startsWith(q) ? 0 : title.includes(q) ? 1 : 2
    scored.push({ hit: h, score })
  }
  // stable: equal scores keep catalogue order (patterns ramp by difficulty)
  return scored
    .map((s, i) => ({ ...s, i }))
    .sort((a, b) => a.score - b.score || a.i - b.i)
    .slice(0, limit)
    .map((s) => s.hit)
}

export const hitByKey = (index: Hit[], key: string) =>
  index.find((h) => h.key === key)
