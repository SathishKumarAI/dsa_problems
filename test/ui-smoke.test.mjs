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
      await page.waitFor(
        `/act 05/i.test(document.querySelector('[aria-label=stage]')?.innerText ?? '')`
      )
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
        for (let i = 0; i < 20 && !/act 03/i.test(document.querySelector('[aria-label=stage]').innerText); i++)
          await wait(150);
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

    test("the problem is one click away from a later act (R3)", async () => {
      // act 05 is deep in the journey: before R3 the statement and the corner
      // cases were on act 1 only, so reading them cost the step you were on
      await page.goto(`${server.base}/#/`)
      await page.run(`localStorage.setItem('dsa:unlocked:two-sum', '7'); return 1`)
      await page.goto(`${server.base}/#/journey/two-sum?act=hash`)
      await page.waitFor(
        `/act 05/i.test(document.querySelector('[aria-label=stage]')?.innerText ?? '')`
      )
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const aside = document.querySelector('[aria-label="approach"]');
        const trigger = () => [...aside.querySelectorAll('[data-slot=accordion-trigger]')]
          .find(b => /the problem/i.test(b.innerText));
        const closed = aside.innerText;
        trigger().click();
        await wait(400);
        const opened = aside.innerText;
        const cases = () => aside.querySelector('[aria-label="corner cases"]');
        const casesClosed = !cases();
        [...aside.querySelectorAll('[data-slot=accordion-trigger]')]
          .find(b => /bring three inputs/i.test(b.innerText))?.click();
        await wait(400);
        return {
          hasTrigger: !!trigger(),
          grew: opened.length > closed.length,
          statement: /nums/i.test(opened),
          casesClosed,
          casesOpen: !!cases(),
        };
      `)
      assert.ok(out.hasTrigger, "no 'the problem' section on act 05")
      assert.ok(out.grew, "opening the section revealed nothing")
      assert.ok(out.statement, "the statement did not appear")
      assert.ok(out.casesClosed, "corner cases should start closed past act 1")
      assert.ok(out.casesOpen, "corner cases did not open")
      assert.deepEqual(page.errors(), [])
    })

    test("the test-case drawer pushes the stage instead of covering it (R4)", async () => {
      await page.goto(`${server.base}/#/journey/two-sum?act=story`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const stage = () => document.querySelector('[aria-label=stage]').getBoundingClientRect();
        const flask = () => document.querySelector('[aria-label="test cases"][aria-controls]');
        const drawer = () => document.getElementById('test-cases');
        const before = stage().width;
        const closedWidth = drawer().getBoundingClientRect().width;
        flask().click();
        await wait(600);
        const after = stage().width;
        const box = drawer().getBoundingClientRect();
        const preset = drawer().querySelector('[aria-label="input preset"]');
        return {
          before, after,
          closedWidth,
          drawerWidth: box.width,
          overlaps: box.left < stage().right - 1,
          hasPreset: !!preset,
          inert: drawer().hasAttribute('inert'),
        };
      `)
      assert.equal(out.closedWidth, 0, "a closed drawer should take no width")
      assert.ok(
        out.after < out.before - 100,
        `the stage did not give way: ${out.before} → ${out.after}`
      )
      assert.ok(out.drawerWidth > 200, "the drawer did not open")
      assert.equal(out.overlaps, false, "the drawer covered the stage")
      assert.ok(out.hasPreset, "no preset select inside the drawer")
      assert.equal(out.inert, false, "an open drawer must not be inert")
      assert.deepEqual(page.errors(), [])
      // the pref persists; later checks measure the stage, so put it back
      await page.run(`
        document.querySelector('[aria-label="test cases"][aria-controls]').click();
        return 1;
      `)
    })

    test("the quiz answers from the keyboard, and Esc closes the drawer (R7)", async () => {
      // single-number, whose story quiz no earlier check has passed — but an
      // earlier one left the ledger at 2, and the gate only shows while the
      // next act is still locked, so put the ledger back first
      await page.goto(`${server.base}/#/`)
      await page.run(`
        localStorage.removeItem('dsa:unlocked:single-number');
        localStorage.removeItem('dsa:quizzes:single-number');
        return 1;
      `)
      await page.goto(`${server.base}/#/journey/single-number`)
      await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        for (let i = 0; i < 24; i++) {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
          await wait(110);
        }
        return 1;
      `)
      await page.waitFor(
        `!!document.querySelector('[role=radiogroup][aria-label=answers]')`
      )
      const quiz = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const g = document.querySelector('[role=radiogroup][aria-label=answers]');
        if (!g) return { found: false };
        const radios = [...g.querySelectorAll('[role=radio]')];
        const pos = () => document.querySelector('[aria-label=timeline]').value;
        radios[0].focus();
        const first = document.activeElement.innerText.trim();
        const posBefore = pos();
        g.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await wait(200);
        const second = document.activeElement.innerText.trim();
        g.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        await wait(200);
        return {
          found: true,
          tabstops: radios.filter(r => r.tabIndex === 0).length,
          moved: first !== second,
          returned: document.activeElement.innerText.trim() === first,
          // the journey's own ArrowRight must not also step the player
          stepped: pos() !== posBefore,
        };
      `)
      assert.ok(quiz.found, "the quiz gate never appeared")
      assert.equal(quiz.tabstops, 1, "the group should be one tab stop")
      assert.ok(quiz.moved, "ArrowDown did not move focus")
      assert.ok(quiz.returned, "ArrowUp did not come back")
      assert.equal(quiz.stepped, false, "the arrow keys also stepped the player")

      const esc = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const flask = document.querySelector('[aria-label="test cases"][aria-controls]');
        flask.click();
        await wait(600);
        const d = document.getElementById('test-cases');
        const opened = d.getBoundingClientRect().width;
        const sel = d.querySelector('[aria-label="input preset"]');
        sel.focus();
        sel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await wait(600);
        return {
          opened,
          closed: d.getBoundingClientRect().width,
          focusBack: document.activeElement.getAttribute('aria-label'),
          inert: d.hasAttribute('inert'),
        };
      `)
      assert.ok(esc.opened > 200, "the drawer did not open")
      assert.equal(esc.closed, 0, "Esc did not close the drawer")
      assert.equal(esc.focusBack, "test cases", "focus was left in a closed drawer")
      assert.equal(esc.inert, true, "a closed drawer should be inert")
      assert.deepEqual(page.errors(), [])
    })

    test("XOR fades each pair as it annihilates, leaving the loner lit (R5)", async () => {
      await page.goto(`${server.base}/#/`)
      await page.run(
        `localStorage.setItem('dsa:unlocked:single-number', '7'); return 1`
      )
      await page.goto(`${server.base}/#/journey/single-number?act=xor&step=0`)
      await page.waitFor(
        `/act 05/i.test(document.querySelector('[aria-label=stage]')?.innerText ?? '')`
      )
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const t = document.querySelector('[aria-label=timeline]');
        const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const seek = async k => {
          set.call(t, String(k));
          t.dispatchEvent(new Event('input', { bubbles: true }));
          await wait(600);
        };
        // value + whether the chip is faded, in array order
        const row = () => [...document.querySelectorAll('[aria-label=array] [data-k]')]
          .map(c => ({
            v: c.innerText.split(String.fromCharCode(10))[0],
            dim: getComputedStyle(c.querySelector('div')).opacity !== '1',
            answer: c.querySelector('div').className.includes('chart-3'),
          }));
        const frames = [];
        for (let k = 0; k <= Number(t.max); k++) { await seek(k); frames.push(row()); }
        const last = frames[frames.length - 1];
        // every value that appears twice must be faded by the end, and the one
        // that appears once must not be
        const counts = {};
        for (const c of last) counts[c.v] = (counts[c.v] ?? 0) + 1;
        return {
          pairsFaded: last.filter(c => counts[c.v] === 2).every(c => c.dim),
          lonerLit: last.filter(c => counts[c.v] === 1).every(c => !c.dim && c.answer),
          // a pair must not fade before its second member is reached
          fadedEarly: frames.some(f =>
            f.some((c, i) => c.dim && f.filter(o => o.v === c.v).length === 2 &&
              f.findLastIndex(o => o.v === c.v) > i && !f[f.findLastIndex(o => o.v === c.v)].dim)),
          steps: frames.length,
        };
      `)
      assert.ok(out.steps > 5, "the XOR act did not load its frames")
      assert.ok(out.pairsFaded, "a pair was still lit after it annihilated")
      assert.ok(out.lonerLit, "the loner should stay lit and become the answer")
      assert.equal(out.fadedEarly, false, "a pair faded before its twin arrived")
      assert.deepEqual(page.errors(), [])
    })

    test("every transition takes one curve and one of two durations (R6)", async () => {
      const audit = `
        const durs = {}, eases = {};
        for (const el of document.querySelectorAll('main *')) {
          const s = getComputedStyle(el);
          if (s.transitionDuration === '0s') continue;
          durs[s.transitionDuration] = (durs[s.transitionDuration] ?? 0) + 1;
          eases[s.transitionTimingFunction] = (eases[s.transitionTimingFunction] ?? 0) + 1;
        }
        return { durs, eases };
      `
      for (const route of [
        "#/journey/single-number?act=xor&step=3",
        "#/algorithms?algo=quick",
        "#/",
      ]) {
        await page.goto(`${server.base}/${route}`)
        const out = await page.run(audit)
        const durations = Object.keys(out.durs).sort()
        const curves = Object.keys(out.eases)
        assert.ok(durations.length > 0, `${route}: nothing transitions at all`)
        assert.deepEqual(
          durations.filter((d) => d !== "0.15s" && d !== "0.32s"),
          [],
          `${route}: a duration outside the two tokens — ${JSON.stringify(out.durs)}`
        )
        assert.deepEqual(
          curves,
          ["cubic-bezier(0.2, 0, 0, 1)"],
          `${route}: more than one easing curve — ${JSON.stringify(out.eases)}`
        )
      }
      assert.deepEqual(page.errors(), [])
    })

    // ---------- 3b. the catalogue keeps the secret ----------

    test("a pattern a started journey is still teaching is masked, and earning it reveals the name", async () => {
      const read = `
        return {
          sidebar: document.querySelector('[data-slot=sidebar]')?.innerText ?? '',
          heading: document.querySelector('h1')?.innerText ?? '',
        };
      `
      // not started: nothing was promised, so the catalogue reads normally
      await page.goto(`${server.base}/#/`)
      await page.run(`${FRESH} return 1`)
      await page.goto(`${server.base}/#/p/two-pointers`)
      const fresh = await page.run(read)
      assert.match(fresh.sidebar, /two pointers/i)
      assert.match(fresh.heading, /two pointers/i)

      // started and unfinished: the name is withheld everywhere
      await page.run(`localStorage.setItem('dsa:unlocked:two-sum', '3'); return 1`)
      await page.goto(`${server.base}/#/p/two-pointers`)
      const mid = await page.run(read)
      assert.doesNotMatch(mid.sidebar, /two pointers/i, "the sidebar leaked the name")
      assert.doesNotMatch(mid.heading, /two pointers/i, "the pattern page leaked the name")
      assert.match(mid.heading, /· · ·/)

      // finished: earned, so it is shown again
      await page.run(`localStorage.setItem('dsa:unlocked:two-sum', '7'); return 1`)
      await page.goto(`${server.base}/#/p/two-pointers`)
      const done = await page.run(read)
      assert.match(done.sidebar, /two pointers/i)
      assert.match(done.heading, /two pointers/i)
      assert.deepEqual(page.errors(), [])
    })

    test("\"show names anyway\" turns masking off for good", async () => {
      await page.goto(`${server.base}/#/`)
      await page.run(`${FRESH} localStorage.setItem('dsa:unlocked:two-sum', '3'); return 1`)
      await page.goto(`${server.base}/#/p/two-pointers`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const btn = [...document.querySelectorAll('button')]
          .find(b => /show names anyway/i.test(b.innerText));
        btn?.click();
        await wait(500);
        return {
          found: !!btn,
          heading: document.querySelector('h1')?.innerText ?? '',
          stored: localStorage.getItem('dsa:spoilers'),
        };
      `)
      assert.ok(out.found, "the opt-out button was not offered")
      assert.match(out.heading, /two pointers/i)
      assert.equal(out.stored, "true")
      // and it survives a reload
      await page.goto(`${server.base}/#/p/two-pointers`)
      const after = await page.eval("document.querySelector('h1').innerText")
      assert.match(after, /two pointers/i)
    })

    // ---------- 3c. the code challenge actually runs code ----------

    test("the reference solution passes every case of a value-answer challenge", async () => {
      await page.goto(`${server.base}/#/`)
      await page.run(
        `${FRESH} localStorage.setItem('dsa:unlocked:single-number', '7'); return 1`
      )
      await page.goto(`${server.base}/#/journey/single-number?act=challenge`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const ta = document.querySelector('textarea');
        const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
        // for..of on purpose: the counting proxy sees Symbol.iterator, and a
        // regex test on a Symbol used to throw for every case
        set.call(ta, ['let acc = 0;', 'for (const x of nums) acc ^= x;', 'return acc;'].join(String.fromCharCode(10)));
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        await wait(300);
        [...document.querySelectorAll('button')].find(b => /run tests/i.test(b.innerText))?.click();
        await wait(2500);
        const rows = [...document.querySelectorAll('.font-mono.text-xs > div')]
          .map(e => e.innerText);
        return {
          rows: rows.length,
          green: rows.filter(t => t.startsWith('✓')).length,
          xp: localStorage.getItem('dsa:xp'),
        };
      `)
      assert.equal(out.rows, 6, "expected six cases")
      assert.equal(out.green, 6, "the reference solution did not pass")
      assert.equal(out.xp, "25", "a first green challenge awards 25 XP")
      assert.deepEqual(page.errors(), [])
    })

    // ---------- 3d. one source of truth for a journeyed problem ----------

    test("a journeyed problem draws its walkthrough from the engine, capped by the ledger", async () => {
      const openTab = `
        const wait = ms => new Promise(r => setTimeout(r, ms));
        [...document.querySelectorAll('[role=tab]')].find(t => /walkthrough/i.test(t.innerText))?.click();
        await wait(1200);
        const panel = document.querySelector('[role=tabpanel]:not([hidden])') ?? document.querySelector('main');
        return {
          act: panel.querySelector('b')?.innerText ?? '',
          note: [...panel.querySelectorAll('[aria-live=polite]')].pop()?.innerText ?? '',
          chips: panel.querySelectorAll('[data-k]').length,
          capped: /best approach you have earned/i.test(panel.innerText),
        };
      `
      // never opened the journey → the optimal approach, uncapped
      await page.goto(`${server.base}/#/`)
      await page.run(`${FRESH} return 1`)
      await page.goto(`${server.base}/#/p/arrays-hashing/pair-sum`)
      const fresh = await page.run(openTab)
      assert.match(fresh.act, /one-pass hash/i)
      assert.ok(fresh.chips > 0, "the engine stage did not render")
      assert.ok(fresh.note.length > 10, "no narration")
      assert.equal(fresh.capped, false)

      // midway through the journey → only the approach already earned
      await page.run(`localStorage.setItem('dsa:unlocked:two-sum', '2'); return 1`)
      await page.goto(`${server.base}/#/p/arrays-hashing/pair-sum`)
      const mid = await page.run(openTab)
      assert.match(mid.act, /brute force/i, "the page spoiled an unearned approach")
      assert.equal(mid.capped, true)
      assert.deepEqual(page.errors(), [])
    })

    // ---------- 3e. the UX-audit corrections ----------

    test("the visualizer follows an `?algo=` link changed while the page is open (U3)", async () => {
      await page.goto(`${server.base}/#/algorithms?algo=quick`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const shape = () => ({
          bars: document.querySelectorAll('[data-k^=v]').length,
          graph: document.querySelectorAll('main svg circle').length,
        });
        const before = shape();
        location.hash = '#/algorithms?algo=dijkstra';
        for (let i = 0; i < 20 && shape().bars > 0; i++) await wait(150);
        return { before, after: shape() };
      `)
      assert.ok(out.before.bars > 0, "the sort view did not render to begin with")
      assert.equal(out.after.bars, 0, "the hash changed but the bars stayed")
      assert.ok(out.after.graph > 0, "the graph view never appeared")
      assert.deepEqual(page.errors(), [])
    })

    test("journey progress reads the same on the sidebar and the home card (U5)", async () => {
      await page.goto(`${server.base}/#/`)
      await page.run(`${FRESH} localStorage.setItem('dsa:unlocked:two-sum', '3'); return 1`)
      await page.goto(`${server.base}/#/`)
      const out = await page.run(`
        const has = (el, word) => el.innerText.toLowerCase().includes(word);
        const row = [...document.querySelectorAll('[data-slot=sidebar-menu-item]')]
          .find(li => has(li, 'two sum'));
        const badgeEl = row?.querySelector('[data-slot=sidebar-menu-badge]');
        const card = [...document.querySelectorAll('main a')]
          .find(a => has(a, 'two sum') && a.innerText.includes('earned') && !has(a, 'pick up'));
        const line = (card?.innerText ?? '').split(String.fromCharCode(10)).find(t => t.includes('earned')) ?? '';
        return { badge: badgeEl?.innerText.trim(), cardText: line.trim(), title: badgeEl?.getAttribute('title') };
      `)
      assert.equal(out.badge, "2/6", "sidebar should count acts earned, not acts unlocked")
      assert.equal(out.cardText, "2/6 earned", "the home card should agree with the sidebar")
      assert.match(out.title ?? "", /2 of 6 acts earned/)
    })

    test("prose stays inside a readable measure (U7)", async () => {
      await page.goto(`${server.base}/#/p/arrays-hashing/pair-sum`)
      const ch = await page.run(`
        const p = [...document.querySelectorAll('main p')]
          .filter(e => e.textContent.trim().length > 120)
          .map(e => Math.round(e.getBoundingClientRect().width / (parseFloat(getComputedStyle(e).fontSize) * 0.5)));
        return Math.max(...p);
      `)
      assert.ok(ch <= 80, `longest measure is ${ch}ch, want <= 80`)
    })

    test("the narration stays on screen even on a long panel (U1)", async () => {
      await page.goto(`${server.base}/#/`)
      await page.run(`localStorage.setItem('dsa:unlocked:two-sum', '7'); return 1`)
      await page.goto(`${server.base}/#/journey/two-sum?act=recap&step=1`)
      const out = await page.run(`
        const stage = document.querySelector('[aria-label=stage]');
        const note = [...stage.querySelectorAll('[aria-live=polite]')].pop();
        const nb = note.getBoundingClientRect();
        const sb = stage.getBoundingClientRect();
        return {
          text: note.innerText.trim().slice(0, 20),
          insideStage: nb.bottom <= sb.bottom + 2,
          inViewport: nb.top >= 0 && nb.bottom <= innerHeight + 2,
        };
      `)
      assert.ok(out.text.length > 3, "no narration rendered")
      assert.ok(out.insideStage, "the narration is below the stage's own fold")
      assert.ok(out.inViewport, "the narration is off screen")
    })

    test("the reading-column toggle does not sit on top of the text (U8)", async () => {
      await page.goto(`${server.base}/#/journey/two-sum?act=recap&step=1`)
      const out = await page.run(`
        const btn = document.querySelector('[aria-label$="reading column"]');
        const r = btn.getBoundingClientRect();
        const behind = document.elementFromPoint(r.left - 10, r.top + r.height / 2);
        const lane = btn.closest('div');
        return {
          laneHasBorder: getComputedStyle(lane).borderTopWidth !== '0px',
          behindText: (behind?.innerText ?? '').trim().slice(0, 30),
        };
      `)
      assert.ok(out.laneHasBorder, "the toggle has no lane of its own")
      assert.equal(out.behindText, "", "the toggle overlaps content")
    })

    test("no sentence is set below the ui step, and the measure holds (U6, U7, U12)", async () => {
      const probe = `
        const px = v => parseFloat(v) || 0;
        const own = el => [...el.childNodes].filter(n => n.nodeType === 3)
          .map(n => n.textContent.trim()).join(' ');
        const els = [...document.querySelectorAll('main *, [role=dialog] *')];
        const small = els.filter(e => {
          const cs = getComputedStyle(e);
          return own(e).length > 55 && px(cs.fontSize) < 14 && !cs.fontFamily.includes('mono');
        }).map(e => own(e).slice(0, 40));
        const wide = [...document.querySelectorAll('main p')]
          .filter(e => e.textContent.trim().length > 110)
          .map(e => Math.round(e.getBoundingClientRect().width / (px(getComputedStyle(e).fontSize) * 0.5)));
        return { small, maxCh: Math.max(0, ...wide) };
      `
      for (const route of [
        "#/",
        "#/journey/two-sum?act=story&step=2",
        "#/p/arrays-hashing/pair-sum",
        "#/algorithms?algo=quick",
      ]) {
        await page.goto(`${server.base}/${route}`)
        const out = await page.run(probe)
        assert.deepEqual(out.small, [], `${route}: prose set below 14px`)
        assert.ok(out.maxCh <= 80, `${route}: longest measure ${out.maxCh}ch`)
      }
    })

    test("a phone spends less chrome on the way to the stage, and the stepper is one row (U2, U14, U11)", async () => {
      await page.resize(390, 844)
      await page.goto(`${server.base}/#/`)
      await page.run(`localStorage.setItem('dsa:unlocked:two-sum', '7'); return 1`)
      await page.goto(`${server.base}/#/journey/two-sum?act=hash&step=6`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const header = document.querySelector('header').getBoundingClientRect();
        const stage = document.querySelector('[aria-label=stage]').getBoundingClientRect();
        const pill = [...document.querySelectorAll('header button')]
          .find(b => b.getAttribute('aria-haspopup') === 'dialog');
        const transport = ['Play', 'Step back', 'Step forward', 'Restart act']
          .map(l => document.querySelector('[aria-label="' + l + '"]'))
          .filter(Boolean)
          .map(el => Math.round(el.getBoundingClientRect().height));
        pill?.click();
        await wait(600);
        const sheetActs = document.querySelectorAll('[role=dialog] nav button').length;
        return {
          headerH: Math.round(header.height),
          stageTop: Math.round(stage.top),
          pillH: pill ? Math.round(pill.getBoundingClientRect().height) : 0,
          transport,
          sheetActs,
          scrollW: document.documentElement.scrollWidth,
        };
      `)
      await page.resize(1440)
      assert.ok(out.headerH <= 220, `header is ${out.headerH}px of chrome`)
      assert.ok(out.stageTop <= 320, `the stage starts at ${out.stageTop}px`)
      assert.ok(out.pillH >= 44, "the act pill is not a touch target")
      assert.ok(
        out.transport.every((h) => h >= 44),
        `transport heights ${out.transport.join(", ")}`
      )
      assert.ok(out.sheetActs >= 7, "the sheet did not list the acts")
      assert.equal(out.scrollW, 390)
    })

    test("the visualizer fills the viewport it is given (U9)", async () => {
      await page.goto(`${server.base}/#/algorithms?algo=quick`)
      const out = await page.run(`
        const bars = document.querySelector('[aria-label="array as bars"]');
        const stage = document.querySelector('[aria-label=stage]');
        return {
          barsH: Math.round(bars.getBoundingClientRect().height),
          stageBottom: Math.round(stage.getBoundingClientRect().bottom),
          viewport: innerHeight,
          pageScroll: document.documentElement.scrollHeight,
        };
      `)
      assert.ok(out.barsH >= 300, `the bars are only ${out.barsH}px tall`)
      assert.ok(
        out.viewport - out.stageBottom < 120,
        `${out.viewport - out.stageBottom}px of dead space under the stage`
      )
    })

    test("home offers to resume a started journey, and only then (U13)", async () => {
      const read = `
        const card = [...document.querySelectorAll('main a')]
          .find(a => a.innerText.toLowerCase().includes('pick up where you left off'));
        return { has: !!card, href: card?.getAttribute('href') ?? '', text: (card?.innerText ?? '').split(String.fromCharCode(10)).join(' ') };
      `
      await page.goto(`${server.base}/#/`)
      await page.run(`${FRESH} return 1`)
      await page.goto(`${server.base}/#/`)
      const fresh = await page.run(read)
      assert.equal(fresh.has, false, "a fresh learner was offered a resume card")

      await page.run(`localStorage.setItem('dsa:unlocked:two-sum', '3'); return 1`)
      await page.goto(`${server.base}/#/`)
      const mid = await page.run(read)
      assert.ok(mid.has, "a started journey was not offered")
      assert.match(mid.href, /#\/journey\/two-sum\?act=/)
      assert.match(mid.text, /2 of 6 acts earned/)

      await page.run(`localStorage.setItem('dsa:unlocked:two-sum', '7'); return 1`)
      await page.goto(`${server.base}/#/`)
      const done = await page.run(read)
      assert.equal(done.has, false, "a finished journey was still offered")
    })

    // ---------- 4. the shell ----------

    test("`f` closes both rails and reopens them; `?` opens the shortcuts dialog", async () => {
      await page.goto(`${server.base}/#/journey/two-sum?act=story`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const w = s => document.querySelector(s)?.getBoundingClientRect().width ?? 0;
        const key = k => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
        const read = 'aside[aria-label^=approach]';
        const open = { side: w('[data-slot=sidebar-container]'), read: w(read) };
        key('f'); await wait(600);
        const shut = { side: w('[data-slot=sidebar-container]'), read: w(read) };
        key('f'); await wait(600);
        const back = { side: w('[data-slot=sidebar-container]'), read: w(read) };
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
        const seg = [...document.querySelectorAll('[role=dialog] [role=radio]')]
          .find(b => b.textContent.trim() === 'cinematic');
        if (!seg) return { opened: false };
        seg.click();
        await wait(300);
        return {
          opened: true,
          checked: seg.getAttribute('aria-checked'),
          stored: JSON.parse(localStorage.getItem('dsa:prefs') ?? '{}').motion,
        };
      `)
      assert.ok(set.opened, "the settings dialog did not open")
      assert.equal(set.checked, "true", "the segmented control did not select")
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
