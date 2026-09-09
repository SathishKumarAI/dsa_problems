// Panel audit (2026-09-09; made a gate by B60).
//
// Seventy-nine journeys now share eight panel kinds, and every one of them was
// designed against a handful of small presets. This walks each panel kind at
// its LARGEST preset, on a real Chrome, and reports the numbers a reviewer
// would otherwise have to guess at: cell sizes, overlaps, overflow past the
// stage, the smallest font on the stage, and how much room the panel actually
// gets.
//
// It began as a measuring tool that asserted nothing, and a tool nobody runs is
// a tool that stops being true — its numbers were only correct on the day
// someone typed the command. It ASSERTS now, one test per panel kind, and runs
// inside `npm run test:ui` with everything else. The table is still printed:
// the numbers are the evidence, and a bare pass/fail throws them away.
//
// It costs about a minute, which is the price of the answer being current.
//
// Run: npm run test:ui   (or node --test test/panel-audit.test.mjs)

import assert from "node:assert/strict"
import { after, before, describe, test } from "node:test"
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
if (!exe) console.error("  PANEL AUDIT SKIPPED — no Chrome found.")

describe(
  "panel audit",
  { skip: exe ? false : "no Chrome (set CHROME_PATH)", concurrency: 1 },
  () => {
    let server
    let browser
    let page
    const rows = []

    // one browser, fourteen journeys, measured once — the tests below read the
    // rows rather than driving the page again
    before(async () => {
      server = await startServer()
      browser = await launch()
      page = browser.page
      await page.resize(1536, 864)
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
      // the smallest text on each stage, NAMED — a size alone costs an
      // afternoon, which is the whole lesson of the 128ch assertion
      console.log("\nsmallest text on each stage:")
      for (const r of rows)
        if (r.minFontEl)
          console.log(`  ${String(r.minFont).padEnd(5)} ${r.kind}: ${r.minFontEl}`)
    })

    after(async () => {
      await browser?.stop()
      server?.stop()
    })

    for (const [slug, kind] of CASES) {
      test(`${kind} (${slug}) fits its biggest preset`, () => {
        const r = rows.find((x) => x.slug === slug)
        assert.ok(r, `${kind}: never measured`)
        assert.equal(r.error, undefined, `${kind}: ${r.error}`)
        // a panel that drew nothing is the failure that reads as a pass: the
        // audit once measured the STORY act fourteen times and reported 0 cells
        assert.ok(r.cells > 0, `${kind}: drew no cells at all on ${r.act}`)
        assert.equal(r.overlaps, 0, `${kind}: ${r.overlaps} overlapping cells`)
        assert.equal(
          r.outsideStage,
          0,
          `${kind}: ${r.outsideStage} cells past the edge of the stage`
        )
        assert.ok(
          r.minCellW >= 40,
          `${kind}: smallest cell is ${r.minCellW}px wide, under the 40px floor`
        )
        assert.ok(
          r.minFont >= 12,
          `${kind}: ${r.minFont}px text — ${r.minFontEl}`
        )
      })
    }

    test("every panel kind in the list was reached", () => {
      assert.equal(rows.length, CASES.length)
    })
  }
)
