// Every outbound URL this site shows a reader, hit for real.
//
// Why this is a SCRIPT and not a test: it needs the network, and a gate that
// fails on a train is a gate people learn to ignore. Run it when you add
// reading links, and before a release.
//
//   node scripts/check-links.mjs              # glossary + problems + patterns
//   node scripts/check-links.mjs --only glossary
//   node scripts/check-links.mjs --json       # machine-readable, for CI
//
// It is IDEMPOTENT and cacheable: results go to
// `.cache/link-check.json`, and a URL checked OK within the last 30 days is
// not re-fetched unless `--fresh` is passed. Re-running it costs nothing, so
// running it often is cheap.
//
// Two things learned writing it, both of which cost a wrong answer first:
//
//   * Wikipedia rate-limits an unidentified client. Five URLs in a row came
//     back 429 and read as dead links; with a User-Agent and a small delay
//     between requests, all five are 200. A link checker with no delay
//     reports the CHECKER's problem as the content's.
//   * A HEAD request is not always honoured. Some hosts answer 403 or 405 to
//     HEAD and 200 to GET, so a failing HEAD is retried as a ranged GET
//     before it is called a failure.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { PROBLEMS } from "../src/data/index.ts"
import { PATTERNS } from "../src/data/patterns.ts"
import { TERMS } from "../src/glossary/index.ts"

const CACHE = ".cache/link-check.json"
const MAX_AGE_DAYS = 30
const DELAY_MS = 350

const arg = (name) => {
  const i = process.argv.indexOf(name)
  return i === -1 ? undefined : (process.argv[i + 1] ?? true)
}
const has = (name) => process.argv.includes(name)

/** every URL the app can send a reader to, with who is responsible for it */
function collect(only) {
  const out = []
  const add = (url, owner) => url && out.push({ url, owner })
  if (!only || only === "glossary")
    for (const t of TERMS)
      for (const r of t.reading ?? []) add(r.url, `glossary/${t.slug}`)
  // TWO FIELD NAMES, on purpose rather than by accident: a glossary source is
  // `url`, a `Reference` (problem and pattern reading lists) is `href`. The
  // first cut of this script read `url` everywhere and reported 35 links for a
  // corpus that has hundreds — a checker that silently checks nothing passes
  // every time.
  if (!only || only === "problems")
    for (const p of PROBLEMS)
      for (const r of p.reading ?? []) add(r.href ?? r.url, `problem/${p.id}`)
  if (!only || only === "patterns")
    for (const p of PATTERNS)
      for (const r of p.references ?? []) add(r.href ?? r.url, `pattern/${p.id}`)
  return out
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function hit(url) {
  const headers = {
    // an unidentified client is the one Wikipedia rate-limits
    "User-Agent":
      "patternsmith-link-check/1.0 (+https://github.com/SathishKumarAI/dsa_problems)",
    Accept: "*/*",
  }
  for (const init of [
    { method: "HEAD", headers, redirect: "follow" },
    // a host that refuses HEAD still answers a ranged GET, and one byte is
    // enough to know the page is there
    { method: "GET", headers: { ...headers, Range: "bytes=0-0" }, redirect: "follow" },
  ]) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(20000) })
      if (res.ok || res.status === 206) return { status: res.status, ok: true }
      if (init.method === "GET") return { status: res.status, ok: false }
    } catch (e) {
      if (init.method === "GET") return { status: 0, ok: false, error: String(e.message ?? e) }
    }
  }
  return { status: 0, ok: false }
}

async function main() {
  const only = typeof arg("--only") === "string" ? arg("--only") : undefined
  const fresh = has("--fresh")
  const links = collect(only)
  const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {}
  const cutoff = Date.now() - MAX_AGE_DAYS * 86400_000

  const seen = new Map()
  for (const { url, owner } of links) {
    if (!seen.has(url)) seen.set(url, [])
    seen.get(url).push(owner)
  }

  const bad = []
  let checked = 0
  let cached = 0
  for (const [url, owners] of seen) {
    const prior = cache[url]
    if (!fresh && prior?.ok && prior.at > cutoff) {
      cached++
      continue
    }
    const result = await hit(url)
    cache[url] = { ok: result.ok, status: result.status, at: Date.now() }
    checked++
    if (!result.ok) bad.push({ url, owners, ...result })
    await sleep(DELAY_MS)
  }

  mkdirSync(dirname(CACHE), { recursive: true })
  writeFileSync(CACHE, JSON.stringify(cache, null, 2))

  if (has("--json")) {
    console.log(JSON.stringify({ total: seen.size, checked, cached, bad }, null, 2))
  } else {
    console.log(
      `\n  ${seen.size} distinct URLs — ${checked} fetched, ${cached} still fresh in the cache\n`
    )
    for (const b of bad) {
      console.log(`  ✗ ${b.status || "no response"}  ${b.url}`)
      console.log(`      owned by: ${b.owners.join(", ")}`)
      if (b.error) console.log(`      ${b.error}`)
    }
    console.log(
      bad.length
        ? `\n  ${bad.length} dead. A reading link that 404s is worse than no link.\n`
        : "\n  every link answered.\n"
    )
  }
  process.exit(bad.length ? 1 : 0)
}

await main()
