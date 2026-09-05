// The UI smoke test (backlog B2). One browser, one preview server, the
// journeys the app actually ships. It checks the things node tests
// structurally cannot see: that a route renders at all, that the console is
// clean, that the earn loop writes the ledger, that the rails and dialogs
// respond, and that a phone-width viewport does not scroll sideways.
//
// Run: npm run test:ui   (builds first; needs a system Chrome — CHROME_PATH
// overrides the search). It is NOT part of `npm test`, which must stay
// hermetic and fast; it IS part of the definition of done for a UI change.

import assert from "node:assert/strict"
import { after, before, describe, test } from "node:test"
import { JOURNEYS } from "../src/engine/index.ts"
import { chromePath, launch, startServer } from "./browser.mjs"

const exe = chromePath()
if (!exe) {
  // A check nobody can run is a check that is off — say so loudly rather
  // than passing quietly.
  console.error(
    "\n  UI SMOKE TEST SKIPPED — no Chrome found. Set CHROME_PATH to enable.\n"
  )
  process.exitCode = 0
}

const FRESH = `
  localStorage.clear();
  document.cookie = 'sidebar_state=true; path=/';
`

describe(
  "ui smoke",
  { skip: exe ? false : "no Chrome (set CHROME_PATH)", concurrency: 1 },
  () => {
    let server
    let browser
    let page

    before(async () => {
      server = await startServer()
      browser = await launch()
      page = browser.page
      await page.goto(`${server.base}/`)
      await page.run(`${FRESH} return 1`)
    })

    after(async () => {
      await browser?.stop()
      server?.stop()
    })

    // ---------- 1. every route renders, console stays clean ----------

    const routes = [
      ["home", "#/", "dsa.patterns"],
      ["pattern list", "#/p/arrays-hashing", "Arrays & Hashing"],
      ["problem page", "#/p/arrays-hashing/pair-sum", "Pair With Target Sum"],
      ["visualizer", "#/algorithms?algo=quick", "Algorithm visualizer"],
      ["sql drills", "#/sql", "SQL"],
      ["flashcards", "#/flashcards", ""],
      ...JOURNEYS.map((j) => [`journey ${j.slug}`, `#/journey/${j.slug}`, j.title]),
    ]

    for (const [name, hash, expect] of routes) {
      test(`${name} renders with no console errors`, async () => {
        await page.goto(`${server.base}/${hash}`)
        const text = await page.eval("document.body.innerText")
        assert.ok(text.length > 40, `${name} rendered almost nothing`)
        if (expect)
          assert.ok(
            text.toLowerCase().includes(expect.toLowerCase()),
            `${name} is missing "${expect}"`
          )
        assert.deepEqual(page.errors(), [], `${name} logged console errors`)
      })
    }

    test("an unknown route falls back to home instead of a blank page", async () => {
      await page.goto(`${server.base}/#/no/such/place`)
      const text = await page.eval("document.body.innerText")
      assert.ok(text.includes("dsa.patterns"))
      assert.deepEqual(page.errors(), [])
    })

    // ---------- 2. the earn loop writes the ledger ----------

    test("story act → quiz → reveal unlocks act 2 and awards XP", async () => {
      // clear on one page load, then navigate: a reload *inside* an evaluate
      // kills the execution context and the call never resolves
      await page.goto(`${server.base}/#/`)
      await page.run(`${FRESH} return 1`)
      await page.goto(`${server.base}/#/journey/two-sum`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const before = { unlocked: localStorage.getItem('dsa:unlocked:two-sum') };
        // step to the end of the story act
        for (let i = 0; i < 20; i++) {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
          await wait(90);
        }
        // answer the quiz: a wrong choice explains and lets you retry, a right
        // one advances — so cycling the choices always gets through
        const quizCard = () => [...document.querySelectorAll('[aria-live=polite]')]
          .find(e => /check yourself/i.test(e.innerText));
        let asked = quizCard() ? 1 : 0;
        for (let click = 0; click < 12 && quizCard(); click++) {
          const card = quizCard();
          const seen = card.innerText;
          const choices = [...card.querySelectorAll('button')];
          choices[click % choices.length]?.click();
          await wait(700);
          const now = quizCard();
          if (now && now.innerText !== seen && /2\\/2/.test(now.innerText)) asked = 2;
        }
        const reveal = [...document.querySelectorAll('button')]
          .find(b => /I understand the problem/i.test(b.innerText));
        reveal?.click();
        await wait(900);
        return {
          before,
          asked,
          revealFound: !!reveal,
          unlocked: localStorage.getItem('dsa:unlocked:two-sum'),
          quizzes: localStorage.getItem('dsa:quizzes:two-sum'),
          xp: localStorage.getItem('dsa:xp'),
          act: new URLSearchParams(location.hash.split('?')[1]).get('act'),
        };
      `)
      assert.equal(out.before.unlocked, null, "started from a fresh ledger")
      assert.ok(out.asked > 0, "the quiz gate never appeared")
      assert.ok(out.revealFound, "the reveal button never appeared")
      assert.equal(out.unlocked, "2", "unlocked:two-sum should be 2")
      assert.match(out.quizzes ?? "", /story/, "the quiz pass was not recorded")
      assert.equal(out.xp, "15", "expected +5 quiz and +10 unlock")
      assert.equal(out.act, "brute", "the page should switch to the next act")
      assert.deepEqual(page.errors(), [])
    })

    test("a deep link restores the act and the step", async () => {
      // a link into a locked act is ignored on purpose (disclosure), so the
      // ledger has to say the act is earned before the link can be honoured
      await page.goto(`${server.base}/#/`)
      await page.run(`localStorage.setItem('dsa:unlocked:two-sum', '7'); return 1`)
      await page.goto(`${server.base}/#/journey/two-sum?act=hash&step=6`)
      const out = await page.run(`
        return {
          act: document.querySelector('[aria-label=stage]').innerText.slice(0, 40),
          pos: document.querySelector('[aria-label=timeline]')?.value ?? null,
        };
      `)
      assert.match(out.act, /act 05/i)
      assert.equal(out.pos, "6")
      assert.deepEqual(page.errors(), [])
    })

    test("a deep link followed *while the journey is open* switches acts", async () => {
      await page.goto(`${server.base}/#/journey/two-sum?act=brute&step=0`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const before = document.querySelector('[aria-label=stage]').innerText.slice(0, 24);
        location.hash = '#/journey/two-sum?act=twoptr&step=2';
        await wait(1200);
        return { before, after: document.querySelector('[aria-label=stage]').innerText.slice(0, 24) };
      `)
      assert.match(out.before, /act 02/i)
      assert.match(out.after, /act 03/i, "the hash changed but the act did not")
    })

    test("a deep link into a locked act is ignored (progressive disclosure)", async () => {
      await page.goto(`${server.base}/#/`)
      await page.run(`localStorage.setItem('dsa:unlocked:single-number', '2'); return 1`)
      await page.goto(`${server.base}/#/journey/single-number?act=xor&step=3`)
      const act = await page.eval(
        "document.querySelector('[aria-label=stage]').innerText.slice(0, 24)"
      )
      assert.match(act, /act 01/i, "a locked act was reachable by URL")
    })

    // ---------- 3. corner cases are reachable and explained ----------

    test("story act lists corner cases; loading one changes the input", async () => {
      await page.goto(`${server.base}/#/journey/three-sum?act=story`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const cards = [...document.querySelectorAll('[aria-label="corner cases"] > li')];
        const before = document.querySelector('[aria-label="input preset"]')?.value;
        // one card holds the preset that is already loaded ("loaded ✓") —
        // pick a different one so the click has something to change
        const load = cards
          .map(li => li.querySelector('button'))
          .find(b => b && b.getAttribute('aria-pressed') !== 'true');
        load?.click();
        await wait(900);
        return {
          count: cards.length,
          before,
          after: document.querySelector('[aria-label="input preset"]')?.value,
          pressed: load?.getAttribute('aria-pressed'),
        };
      `)
      assert.ok(out.count >= 3, "expected at least three corner cases")
      assert.notEqual(out.after, out.before, "loading a case changed nothing")
      assert.equal(out.pressed, "true")
      assert.deepEqual(page.errors(), [])
    })

    // ---------- 4. the shell ----------

    test("`f` closes both rails and reopens them; `?` opens the shortcuts dialog", async () => {
      await page.goto(`${server.base}/#/journey/two-sum?act=story`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const w = s => document.querySelector(s)?.getBoundingClientRect().width ?? 0;
        const key = k => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
        const open = { side: w('[data-slot=sidebar-container]'), read: w('aside') };
        key('f'); await wait(600);
        const shut = { side: w('[data-slot=sidebar-container]'), read: w('aside') };
        key('f'); await wait(600);
        const back = { side: w('[data-slot=sidebar-container]'), read: w('aside') };
        key('?'); await wait(500);
        const dialog = document.querySelector('[role=dialog]')?.innerText ?? '';
        return { open, shut, back, dialog: dialog.slice(0, 40) };
      `)
      assert.ok(out.open.side > 200 && out.open.read > 200, "rails did not start open")
      assert.ok(out.shut.side < 80 && out.shut.read < 80, "`f` did not close both rails")
      assert.ok(out.back.side > 200 && out.back.read > 200, "`f` did not reopen them")
      assert.match(out.dialog, /keyboard shortcuts/i)
      assert.deepEqual(page.errors(), [])
    })

    test("settings writes a preference that survives a reload", async () => {
      await page.goto(`${server.base}/#/`)
      const set = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        document.querySelector('[aria-label=settings]')?.click();
        await wait(500);
        const sel = document.querySelector('[role=dialog] select');
        if (!sel) return { opened: false };
        const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
        setter.call(sel, 'cinematic');
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        await wait(300);
        return { opened: true, stored: JSON.parse(localStorage.getItem('dsa:prefs') ?? '{}').motion };
      `)
      assert.ok(set.opened, "the settings dialog did not open")
      assert.equal(set.stored, "cinematic")
      await page.goto(`${server.base}/#/journey/two-sum`)
      const after = await page.run(
        `return JSON.parse(localStorage.getItem('dsa:prefs') ?? '{}').motion;`
      )
      assert.equal(after, "cinematic", "the preference did not survive a reload")
    })

    // ---------- 5. phone width ----------

    test("390 px wide: no horizontal scroll on the journey page", async () => {
      await page.resize(390)
      await page.goto(`${server.base}/#/journey/two-sum?act=hash&step=6`)
      const out = await page.run(`
        return {
          scrollW: document.documentElement.scrollWidth,
          clientW: document.documentElement.clientWidth,
        };
      `)
      await page.resize(1440)
      assert.equal(out.scrollW, out.clientW, "the page scrolls sideways at 390 px")
      assert.deepEqual(page.errors(), [])
    })
  }
)
