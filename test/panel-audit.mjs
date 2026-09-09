// Panel audit (2026-09-09). Not a test — a MEASURING TOOL.
//
// Seventy-nine journeys now share eight panel kinds, and every one of them was
// designed against a handful of small presets. This walks each panel kind at
// its LARGEST preset, on a real Chrome, and reports the numbers a reviewer
// would otherwise have to guess at: cell sizes, overlaps, overflow past the
// stage, the smallest font on the stage, and how much room the panel actually
// gets.
//
// It asserts nothing. Its output is evidence for docs/UX-AUDIT.md; anything it
// finds that should never regress becomes a check in ui-smoke.test.mjs.
//
// Run: node test/panel-audit.mjs

import { chromePath, launch, startServer } from "./browser.mjs"

// slug → the panel kind it is here to exercise. The last act of each journey
// is the one that draws the real structure; the story act is mostly prose.
const CASES = [
  ["the-smallest-of-the-big-ones", "heap on the tree view"],
  ["one-row-at-a-time", "tree"],
  ["the-window-every-ancestor-leaves-open", "tree (bounds)"],
  ["take-the-smaller-front", "list"],
  ["two-runners-one-track", "list with a back-edge"],
  ["how-big-is-the-biggest", "grid"],
  ["everything-rots-at-once", "grid (multi-source)"],
  ["same-order-gaps-allowed", "DP table"],
  ["above-plus-left", "DP row"],
  ["settle-the-nearest-first", "distance table"],
  ["take-what-is-available", "in-degree table"],
  ["who-belongs-with-whom", "adjacency matrix"],
  ["container-water", "bars"],
  ["two-sum", "chip row + hash map"],
]

const PROBE = `
  const stage = document.querySelector('[aria-label=stage]');
  if (!stage) return { error: 'no stage' };
  const cells = [...stage.querySelectorAll('[data-k]')];
  const boxes = cells.map(c => c.getBoundingClientRect());
  let overlaps = 0;
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (a.left < b.right - 1 && b.left < a.right - 1 &&
          a.top < b.bottom - 1 && b.top < a.bottom - 1) overlaps++;
    }
  const sb = stage.getBoundingClientRect();
  const fonts = [...stage.querySelectorAll('*')]
    .filter(e => e.children.length === 0 && (e.textContent || '').trim())
    .map(e => parseFloat(getComputedStyle(e).fontSize));
  return {
    act: stage.innerText.split('\\n')[0],
    cells: cells.length,
    overlaps,
    outsideStage: boxes.filter(b => b.right > sb.right + 1 || b.left < sb.left - 1).length,
    minCellW: cells.length ? Math.min(...boxes.map(b => Math.round(b.width))) : 0,
    minCellH: cells.length ? Math.min(...boxes.map(b => Math.round(b.height))) : 0,
    minFont: fonts.length ? Math.min(...fonts) : 0,
    minFontEl: (() => {
      const els = [...stage.querySelectorAll('*')]
        .filter(e => e.children.length === 0 && (e.textContent || '').trim());
      if (!els.length) return null;
      const worst = els.reduce((a, b) =>
        parseFloat(getComputedStyle(a).fontSize) <= parseFloat(getComputedStyle(b).fontSize) ? a : b);
      return worst.tagName + ' .' + (worst.className || '').toString().slice(0, 44) +
        ' :: ' + worst.textContent.trim().slice(0, 22);
    })(),
    stage: [Math.round(sb.width), Math.round(sb.height)],
    sidewaysScrollers: [...stage.querySelectorAll('*')]
      .filter(e => e.scrollWidth > e.clientWidth + 2).length,
    verticalOverflow: stage.scrollHeight > stage.clientHeight + 2,
  };
`

const exe = chromePath()
if (!exe) {
  console.error("\n  PANEL AUDIT SKIPPED — no Chrome found.\n")
  process.exit(0)
}

const server = await startServer()
const browser = await launch()
const page = browser.page
await page.resize(1536, 864)

const rows = []
for (const [slug, kind] of CASES) {
  // A full navigation is what makes the ledger write stick: the store caches
  // per key, so writing localStorage while the journey is mounted is undone.
  await page.goto(`${server.base}/#/`)
  await page.run(`localStorage.setItem('dsa:unlocked:${slug}', '9'); return 1`)
  await page.goto(`${server.base}/#/journey/${slug}`)
  await page.waitFor(`!!document.querySelector('[aria-label=stage]')`)

  // the drawer takes 288px from the stage when open; measure what a learner
  // gets by default, which is closed
  await page.run(`
    const f = document.querySelector('[aria-label="test cases"]');
    if (f && f.getAttribute('aria-expanded') === 'true') f.click();
    return 1;
  `)

  // …at its biggest preset
  const preset = await page.run(`
    const s = document.querySelector('select[aria-label="input preset"]');
    if (!s) return '-';
    const vals = [...s.options].map(o => o.value);
    const big = vals.includes('long') ? 'long' : vals[vals.length - 1];
    const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    set.call(s, big);
    s.dispatchEvent(new Event('change', { bubbles: true }));
    return big;
  `)
  await page.run(`return new Promise(r => setTimeout(() => r(1), 1200))`)

  // The LAST act in the stepper is the optimal one — that is where the real
  // structure is drawn. The stepper lives INSIDE the page header, so the only
  // thing to exclude is the sidebar's own numbered rows.
  const acts = await page.run(`
    const btns = [...document.querySelectorAll('button')]
      .filter(b => /^\\d\\d/.test(b.textContent.trim()) && b.closest('[data-sidebar]') === null);
    btns[btns.length - 1]?.click();
    return btns.length;
  `)
  await page.run(`return new Promise(r => setTimeout(() => r(1), 700))`)

  // …and part-way through, where the panel is at its busiest
  await page.run(`
    const t = document.querySelector('input[aria-label=timeline]');
    if (t) {
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      set.call(t, String(Math.max(1, Math.floor(Number(t.max) * 0.6))));
      t.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return 1;
  `)
  await page.run(`return new Promise(r => setTimeout(() => r(1), 600))`)

  const out = await page.run(PROBE)
  rows.push({ kind, slug, acts, preset, ...out })
}

const pad = (s, n) => String(s).padEnd(n)
console.log(
  `\n${pad("panel", 26)} ${pad("preset", 10)} ${pad("act", 8)} cells  overlap  outside  minW  minFont  stage`
)
for (const r of rows)
  console.log(
    `${pad(r.kind, 26)} ${pad(r.preset, 10)} ${pad(r.act ?? "-", 8)} ${pad(r.cells, 6)} ${pad(r.overlaps, 8)} ${pad(r.outsideStage, 8)} ${pad(r.minCellW, 5)} ${pad(r.minFont, 8)} ${(r.stage ?? []).join("x")}`
  )

const bad = rows.filter(
  (r) => r.overlaps > 0 || r.outsideStage > 0 || (r.minFont && r.minFont < 12)
)
console.log(
  bad.length
    ? `\n${bad.length} panel(s) with overlap, overflow or sub-12px text:\n` +
        bad.map((b) => `  · ${b.kind} (${b.slug})`).join("\n")
    : "\nno overlaps, no overflow past the stage, nothing under 12px."
)
const empty = rows.filter((r) => !r.cells)
if (empty.length)
  console.log(
    `\n${empty.length} panel(s) drew no cells at all — check the act reached:\n` +
      empty.map((b) => `  · ${b.kind}: ${b.act} (${b.acts} act buttons)`).join("\n")
  )

await browser.stop()
server.stop()

// the smallest text on each stage, named — a size alone costs an afternoon
console.log("\nsmallest text on each stage:")
for (const r of rows)
  if (r.minFontEl) console.log(`  ${String(r.minFont).padEnd(5)} ${r.kind}: ${r.minFontEl}`)
