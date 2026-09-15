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
import { existsSync, readdirSync, statSync } from "node:fs"
import { PROBLEMS } from "../src/data/index.ts"
import { PATTERNS } from "../src/data/patterns.ts"

// Which problems have a long explanation, read from disk rather than listed
// here, so this file cannot go stale as documents are written. Two sources,
// the same two the app forks on: a TYPED document in `src/problems/<id>/`, or
// a generated Markdown one in `docs/learn/`.
const EXPLAINED = new Set([
  ...readdirSync("docs/learn")
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => f.replace(/\.md$/, "")),
  ...readdirSync("src/problems", { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(`src/problems/${d.name}/doc.ts`))
    .map((d) => d.name),
])

// The biggest problem whose explanation is still MARKDOWN, chosen from disk.
// Naming one was fine until a batch converted it: this check asked for
// `max-depth` and got the typed renderer, so it failed on a document that had
// simply graduated. The typed half is checked separately, by name, because
// there the point is the fields — here the point is the parser.
const markdownOnly = readdirSync("docs/learn")
  .filter((f) => f.endsWith(".md") && f !== "README.md")
  .map((f) => f.replace(/\.md$/, ""))
  .filter((id) => !existsSync(`src/problems/${id}/doc.ts`))
  .map((id) => ({ id, size: statSync(`docs/learn/${id}.md`).size }))
  .sort((a, b) => b.size - a.size)
const RICHEST_MARKDOWN = markdownOnly[0]?.id

/** the one route a problem has, now that the explanation is a section of it */
const pageOf = (p) => `/#/p/${p.pattern}/${p.id}`
/** the explanation is FETCHED, so every check on it has to wait for it */
const EXPLANATION_READY =
  '!!document.getElementById("explanation") && ' +
  '!!document.querySelector("#explanation h3, #explanation table, #explanation pre") && ' +
  '!/loading the explanation/.test(document.body.innerText)'

/**
 * Open the explanation, then wait for it.
 *
 * It is COLLAPSED on arrival and not fetched until asked for: open, `pair-sum`
 * measures 33.8 screens against 4.3 closed, which made the ladder the first
 * twelve percent of its own page. Every check below that reads the document has
 * to press the door first, exactly as a reader does.
 */
const openExplanation = async (page) => {
  await page.run(`
    const b = [...document.querySelectorAll('button')]
      .find(x => /learn this problem|read it/i.test(x.innerText))
    if (b) b.click()
    return !!b
  `)
  await page.waitFor(EXPLANATION_READY, { tries: 60 })
}
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
      ...JOURNEYS.map((j) => [
        `journey ${j.slug}`,
        `#/journey/${j.slug}`,
        j.title,
      ]),
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

    // The journeys disclosure used to call setAllJourneys(true) and then hide
    // itself, so expanding was a one-way door and the only way back was a
    // reload. Round-trip it, in both places that carry one.
    // Home is a front door, not a second catalogue. It used to carry a list
    // of all 93 journeys behind a "show all" chevron, sitting directly above a
    // practice set of the same problems grouped by pattern — two lists of one
    // thing on the landing page, and the journey you were resuming appearing
    // in both the dock and the list beneath it.
    test("home offers one catalogue, and does not repeat the dock", async () => {
      const read = `
        const main = document.querySelector('main');
        const links = [...main.querySelectorAll('a[href]')].map(a => a.getAttribute('href') || '');
        const dock = main.querySelector('[data-testid=dock]');
        const dockHref = dock ? dock.getAttribute('href') || '' : '';
        const slugOf = h => (h.split('/journey/')[1] || '').split('?')[0];
        const journeys = links.filter(h => h.includes('/journey/'));
        return {
          patterns: links.filter(h => new RegExp('p/[a-z-]+$').test(h)).length,
          journeys: journeys.length,
          dockSlug: slugOf(dockHref),
          // the dock's own journey must not appear a second time in a list
          repeatsDock: journeys.filter(h => slugOf(h) === slugOf(dockHref)).length - 1,
        };
      `

      await page.goto(`${server.base}/#/`)
      await page.run(`${FRESH} return 1`)
      await page.goto(`${server.base}/#/`)
      const fresh = await page.run(read)
      assert.ok(fresh.patterns >= 8, `home lists only ${fresh.patterns} patterns`)
      assert.equal(
        fresh.journeys,
        1,
        `a fresh learner is offered ${fresh.journeys} journey links; only the dock belongs`
      )

      // two in play: the dock takes one, "also in play" takes the other, and
      // neither shows the same journey twice
      await page.goto(`${server.base}/#/`)
      await page.run(`
        localStorage.setItem('dsa:unlocked:two-sum', '3');
        localStorage.setItem('dsa:unlocked:single-number', '2');
        return 1
      `)
      await page.goto(`${server.base}/#/`)
      const busy = await page.run(read)
      await page.goto(`${server.base}/#/`)
      await page.run(`${FRESH} return 1`)
      assert.equal(busy.journeys, 2, `two in play should offer two rows, got ${busy.journeys}`)
      assert.equal(
        busy.repeatsDock,
        0,
        "the journey in the dock is listed again underneath it"
      )
      assert.deepEqual(page.errors(), [])
    })

    // The catalogue is the way into every problem, and a catalogue you cannot
    // middle-click is a catalogue you cannot open two of side by side. Both
    // rows were `<button onClick>`: no new-tab on middle-click, none offered on
    // right-click, and no destination in the status bar. The sidebar's own
    // header has stated the rule all along — "every entry a hash link so
    // back/forward and middle-click work" — and the catalogue was the one place
    // that broke it.
    test("every catalogue row is a real link", async () => {
      await page.goto(`${server.base}/#/p/arrays-hashing`)
      const list = await page.run(`
        const main = document.querySelector('main');
        return {
          links: main.querySelectorAll('a[href*="/p/arrays-hashing/"]').length,
          buttons: [...main.querySelectorAll('button')]
            .filter(b => (b.innerText || '').length > 12).length,
        };
      `)
      assert.ok(
        list.links >= 15,
        `the problem list offers ${list.links} links — the rows are not anchors`
      )

      await page.goto(`${server.base}/#/`)
      const home = await page.run(`
        const main = document.querySelector('main');
        return { patterns: main.querySelectorAll('a[href]').length &&
          [...main.querySelectorAll('a[href]')]
            .filter(a => new RegExp('p/[a-z-]+$').test(a.getAttribute('href') || '')).length };
      `)
      assert.ok(
        home.patterns >= 8,
        `home offers ${home.patterns} pattern links — the rows are not anchors`
      )
      assert.deepEqual(page.errors(), [])
    })

    // The sidebar stopped at PATTERNS when the journey catalogue went: ten rows,
    // and no way to reach a problem from it at all. A catalogue whose leaves are
    // unreachable is a table of contents with no page numbers.
    test("the sidebar reaches a problem, not just a pattern", async () => {
      const read = `
        const root = document.querySelector('[data-slot="sidebar"]');
        const links = [...root.querySelectorAll('a[href]')].map(a => a.getAttribute('href') || '');
        return {
          patterns: links.filter(h => new RegExp('p/[a-z-]+$').test(h)).length,
          problems: links.filter(h => new RegExp('p/[a-z-]+/[a-z0-9-]+').test(h)).length,
        };
      `
      await page.goto(`${server.base}/#/`)
      const home = await page.run(read)
      assert.ok(home.patterns >= 8, `home lists ${home.patterns} patterns`)
      assert.equal(
        home.problems,
        0,
        "every pattern's problems are listed at once — that is the catalogue again"
      )

      // inside a pattern, its own problems are there; the other nine stay shut
      await page.goto(`${server.base}/#/p/two-pointers`)
      const open = await page.run(read)
      assert.ok(
        open.problems >= 10,
        `the open pattern lists only ${open.problems} of its problems`
      )
      assert.equal(open.patterns, home.patterns, "the pattern rows moved")

      // and they stay while you work one of them, so you can move sideways
      await page.goto(`${server.base}/#/p/two-pointers/move-zeroes`)
      const onProblem = await page.run(read)
      assert.equal(
        onProblem.problems,
        open.problems,
        "the siblings vanish once you open one of them"
      )
      assert.deepEqual(page.errors(), [])
    })

    // A reference is attached to a PATTERN and not to a problem on purpose —
    // there is an authoritative page on hash tables and none on "Pair With
    // Target Sum". But the moment a reader wants it is the moment they are
    // stuck on a problem, not the moment they are choosing one.
    test("the reading list is on the problem, the playbook on the pattern", async () => {
      await page.goto(`${server.base}/#/p/two-pointers`)
      const pattern = await page.run(`
        const m = document.querySelector('main').innerText;
        return { readFurther: /read further/i.test(m), playbook: /the playbook/i.test(m) };
      `)
      assert.ok(pattern.playbook, "the pattern page lost its playbook")
      assert.equal(
        pattern.readFurther,
        false,
        "the reading list is still on the pattern page"
      )

      await page.goto(`${server.base}/#/p/two-pointers/move-zeroes`)
      const problem = await page.run(`
        const m = document.querySelector('main').innerText;
        return { readFurther: /read further/i.test(m), playbook: /the playbook/i.test(m) };
      `)
      assert.ok(problem.readFurther, "the problem page has no reading list")
      assert.equal(
        problem.playbook,
        false,
        "the playbook followed it onto the problem page"
      )
      assert.deepEqual(page.errors(), [])
    })

    // The IA rule, asserted because nothing was watching it and it drifted for
    // months: a problem is ONE noun. The sidebar used to open with a list of
    // journeys and carry a list of patterns below it, so 93 of the 127 problems
    // appeared twice under two headings and the app read as two products.
    test("the sidebar is one catalogue, and Continue is progress not navigation", async () => {
      const slug = "two-sum"
      await page.goto(`${server.base}/#/`)
      await page.run(`localStorage.removeItem('dsa:unlocked:${slug}'); return 1`)
      await page.goto(`${server.base}/#/`)
      const read = `
        const root = document.querySelector('[data-slot="sidebar"]') || document.querySelector('aside');
        const links = [...root.querySelectorAll('a[href]')].map(a => a.getAttribute('href') || '');
        return {
          journeys: links.filter(h => h.includes('/journey/')).length,
          patterns: links.filter(h => new RegExp('p/[a-z-]+$').test(h)).length,
          hasContinue: /Continue/.test(root.textContent || ''),
        };
      `
      const fresh = await page.run(read)
      assert.equal(
        fresh.journeys,
        0,
        "a fresh learner is offered a second catalogue of journeys in the sidebar"
      )
      assert.ok(fresh.patterns >= 8, `only ${fresh.patterns} patterns listed`)
      assert.equal(fresh.hasContinue, false, "Continue appears with nothing to continue")

      // started and unfinished: Continue appears, with exactly that one
      await page.goto(`${server.base}/#/`)
      await page.run(`localStorage.setItem('dsa:unlocked:${slug}', '3'); return 1`)
      await page.goto(`${server.base}/#/`)
      const started = await page.run(read)
      await page.goto(`${server.base}/#/`)
      await page.run(`localStorage.removeItem('dsa:unlocked:${slug}'); return 1`)
      assert.ok(started.hasContinue, "a started journey is not offered for resuming")
      assert.equal(
        started.journeys,
        1,
        `Continue listed ${started.journeys} journeys; only the started one belongs there`
      )
      assert.deepEqual(page.errors(), [])
    })

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
      await page.run(
        `localStorage.setItem('dsa:unlocked:two-sum', '7'); return 1`
      )
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
      await page.run(
        `localStorage.setItem('dsa:unlocked:single-number', '2'); return 1`
      )
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
        // the reading column is tabs now (spec 5.2) — the corner cases have
        // a tab of their own, one click away
        [...document.querySelectorAll('[role=tab]')]
          .find(t => /edge cases/i.test(t.textContent))?.click();
        await wait(500);
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
      await page.run(
        `localStorage.setItem('dsa:unlocked:two-sum', '7'); return 1`
      )
      await page.goto(`${server.base}/#/journey/two-sum?act=hash`)
      await page.waitFor(
        `/act 05/i.test(document.querySelector('[aria-label=stage]')?.innerText ?? '')`
      )
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const aside = document.querySelector('[aria-label="approach"]');
        // ONE click each. The reading column is tabs now, and the tab IS the
        // disclosure: Explain holds the statement, Edge cases holds the
        // corner cases, and neither is nested behind a second control.
        const tab = re => [...aside.querySelectorAll('[role=tab]')]
          .find(b => re.test(b.textContent));
        const trigger = () => tab(/explain/i);
        const cases = () => aside.querySelector('[aria-label="corner cases"]');
        const casesClosed = !cases();
        trigger().click();
        await wait(500);
        const opened = aside.innerText;
        const beforeCases = aside.innerText.length;
        tab(/edge cases/i)?.click();
        await wait(500);
        return {
          hasTrigger: !!trigger(),
          // one click on Edge cases has to reveal something that was not there
          grew: aside.innerText.length !== beforeCases,
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

    // B59, decided 2026-09-09. It used to take a column of the row, and that
    // cost the stage 862px → 574px at 1536px — a third of its width, to show a
    // short list of preset names. The stage is the product and the drawer is a
    // control, so the control floats now and the stage keeps its width.
    // B61 said KEEP the static walkthrough player, on the grounds that a
    // problem must be allowed to ship without a journey. Batch 6 is the first
    // batch to actually do it — 20 problems, no journeys — so this is the
    // first run in which `step-player.tsx` is reachable at all. If the
    // decision was wrong, it is wrong here.
    test("a problem with no journey draws its static walkthrough (B61, batch 6)", async () => {
      // COMPUTED, not hard-coded. This list used to name four problems by id,
      // and B67 falsified it the moment one of them (reorder-list) got a
      // journey — which correctly deleted the very walkthrough this asserts.
      // A fixture that goes stale every time the product improves is a gate
      // that cries wolf, so ask the data which problems still have no journey.
      const journeyed = new Set(JOURNEYS.map((j) => j.problemId))
      const unjourneyed = PROBLEMS.filter((p) => !journeyed.has(p.id))
        .slice(0, 4)
        .map((p) => [p.pattern, p.id])
      assert.ok(
        unjourneyed.length > 0,
        "every problem has a journey now — this test, and B61's static player, are done"
      )
      for (const [pattern, id] of unjourneyed) {
        await page.goto(`${server.base}/#/p/${pattern}/${id}`)
        const out = await page.run(`
          const player = document.querySelector('[aria-label^="walkthrough,"]');
          const heading = [...document.querySelectorAll('h1')][0];
          return {
            title: heading ? heading.textContent.trim() : '',
            hasPlayer: !!player,
            // the player narrates each frame; an empty caption is the failure
            // that renders as a blank strip rather than an error
            caption: player ? player.innerText.trim().length : 0,
            rungs: document.body.innerText.match(/ways in/) ? true : false,
          };
        `)
        assert.ok(out.title.length > 3, `${id}: no title rendered`)
        assert.ok(out.hasPlayer, `${id}: no static walkthrough player`)
        assert.ok(out.caption > 20, `${id}: the player rendered nothing`)
        assert.ok(out.rungs, `${id}: the approach ladder is missing`)
        assert.deepEqual(page.errors(), [], `${id} logged console errors`)
      }
    })

    // B85, moved. The playbook lived on `#/resources`, a SECOND page about a
    // pattern — its moves, its references and a list of its problems, beside a
    // pattern page carrying the name, the same references and a filterable list
    // of the same problems. One noun, one page: the moves are on
    // `#/p/<pattern>` now and the route redirects.
    //
    // The half worth testing is unchanged and it is the disclosure rule. A
    // playbook is a pattern's name written a dozen different ways ("Two
    // pointers converging", "Hash map as an index"), so a pattern whose journey
    // is mid-flight must show NO playbook at all — not one with the name
    // swapped for the mask.
    test("the pattern page renders a playbook, and masks a live pattern (B85)", async () => {
      // DRIVEN BY the ledger, so this is one of the few checks here that cannot
      // inherit one: an earlier test leaving a journey armed used to mask the
      // pattern and make the failure read as "only 1 move rendered", which is
      // the empty-state copy rather than a bug.
      await page.goto(`${server.base}/#/`)
      await page.run(`${FRESH} return 1`)
      await page.goto(`${server.base}/#/p/linked-list`)
      const out = await page.run(`
        const main = document.querySelector('main').innerText;
        return {
          moves: (main.match(/the tell/gi) || []).length,
          mistakes: (main.match(/the classic mistake/gi) || []).length,
          practise: [...document.querySelectorAll('a')]
            .filter(a => (a.getAttribute('href') || '').indexOf('#/p/') === 0).length,
          hasReferences: /read further/i.test(main),
          hasFacts: /with a journey/i.test(main),
        };
      `)
      assert.ok(out.moves >= 4, `only ${out.moves} playbook moves rendered`)
      assert.equal(out.moves, out.mistakes, "a move rendered without its mistake")
      assert.ok(out.practise >= 5, "no links into the problems")
      assert.equal(
        out.hasReferences,
        false,
        "the reading list is still on the pattern page — it moved to the problem"
      )
      assert.ok(out.hasFacts, "the orient bar did not render")
      assert.deepEqual(page.errors(), [])

      const ll = await page.eval(`document.querySelector('main').innerText`)
      assert.match(ll, /Dummy head/, "the linked-list playbook did not render")
      assert.match(ll, /Reverse in place/, "a move is missing")

      // EVERY pattern has one now — the empty frame is the mechanism for a
      // pattern added later, not the state eight of ten are in.
      const thin = []
      for (const id of PATTERNS.map((x) => x.id)) {
        await page.goto(`${server.base}/#/p/${id}`)
        const n = await page.run(`
          return (document.querySelector('main').innerText.match(/the tell/gi) || []).length
        `)
        if (n < 4) thin.push(`${id}:${n}`)
      }
      assert.deepEqual(thin, [], `patterns with fewer than four moves: ${thin.join(", ")}`)

      // the retired route still lands, with its pattern honoured
      await page.goto(`${server.base}/#/resources?pattern=linked-list`)
      await page.run(`return new Promise(r => setTimeout(() => r(1), 600))`)
      const redirected = await page.eval(`location.hash`)
      assert.match(
        redirected,
        /p\/linked-list/,
        `#/resources did not redirect — landed on ${redirected}`
      )

      // now start a journey that REVEALS linked-list and leave it unfinished:
      // the playbook must vanish, not merely lose its name.
      //
      // `add-two-numbers`, not `cycle-detect`: the mask is driven by a
      // journey's `reveals`, and cycle-detect declares none, so an earlier
      // version of this set a ledger key that masked nothing and asserted
      // against a mask that was never armed.
      //
      // Written on another route and then navigated for real, because the store
      // caches per key and a write while the page is mounted is undone.
      await page.goto(`${server.base}/#/`)
      // the ledger key is the journey's SLUG, not its filename:
      // add-two-numbers.ts declares slug "add-them-the-way-you-were-taught".
      const slug = JOURNEYS.find((j) => j.problemId === "add-two-numbers").slug
      assert.ok(
        (JOURNEYS.find((j) => j.problemId === "add-two-numbers").reveals ?? [])
          .includes("linked-list"),
        "this test needs a journey that reveals linked-list"
      )
      await page.eval(
        `localStorage.setItem('dsa:unlocked:' + ${JSON.stringify(slug)}, '2'); true`
      )
      await page.goto(`${server.base}/#/p/linked-list`)
      const masked = await page.eval(`document.querySelector('main').innerText`)
      await page.eval(`localStorage.clear(); true`)
      assert.equal(
        /Dummy head|Reverse in place|Split and weave/.test(masked),
        false,
        "a masked pattern's playbook leaked onto its own page"
      )
      assert.equal(
        /the tell/i.test(masked),
        false,
        "the playbook section rendered for a masked pattern"
      )
    })

    // The Run button used to do nothing a reader could see. Measured in this
    // browser on 2026-09-15: three of the four buttons on balanced-brackets gave
    // "exit 0 · 5 ms" and "the script printed nothing", because every approach
    // fence in every teaching document is a bare function definition.
    //
    // Two halves, and both are asserted here because neither is visible from the
    // code alone: every block is EDITABLE (a reader learns by changing a line),
    // and every block PRINTS (the button appends a call on the problem's own
    // first test case, with the document's scaffolding in front of it).
    test("every code block is editable, and Run prints an answer", async () => {
      const problem = PROBLEMS.find((p) => p.id === "balanced-brackets")
      await page.goto(`${server.base}${pageOf(problem)}`)
      await openExplanation(page)

      const shape = await page.run(`
        return {
          runs: [...document.querySelectorAll('button')]
            .filter(b => b.innerText.trim() === 'Run').length,
          editors: document.querySelectorAll('textarea').length,
        };
      `)
      assert.ok(shape.runs >= 3, `only ${shape.runs} Run buttons`)
      assert.equal(
        shape.editors,
        shape.runs,
        "a block can be run but not edited — every block is the reader's to change"
      )

      // press the FIRST one: an ordinary approach block, not the full script
      await page.run(`
        const runs = [...document.querySelectorAll('button')]
          .filter(b => b.innerText.trim() === 'Run');
        runs[0].click();
        return true;
      `)
      await page.waitFor(`!!document.body.innerText.match(/exit 0|error ·/)`, {
        tries: 90,
        gap: 1000,
      })
      const out = await page.run(`
        const text = document.body.innerText;
        return {
          ok: /exit 0/.test(text),
          nothing: /printed nothing/.test(text),
          broke: /NameError|TypeError|SyntaxError|Traceback/.test(text),
        };
      `)
      assert.ok(out.ok, "the first block did not exit cleanly")
      assert.equal(
        out.nothing,
        false,
        "an approach block still prints nothing — the appended call is missing"
      )
      assert.equal(
        out.broke,
        false,
        "the block raised — a fence needs the document's scaffolding in front of it"
      )
      assert.deepEqual(page.errors(), [])
    })

    // B82 / B83. The one check that matters for the Python runtime: a real
    // browser, a real fetch of 10.6 MB of CPython, real output. Everything
    // else about this feature is a claim.
    //
    // The script it runs is the SAME one `scripts/verify-deep.mjs` executes in
    // CI — every approach in the document plus a differential test over random
    // inputs — so agreement here and agreement there are the same fact, and
    // this test fails if the two ever stop being the same code.
    test("the problem page runs the document's Python, and it agrees (B82)", async () => {
      const problem = PROBLEMS.find((p) => p.id === "cycle-detect")
      await page.goto(`${server.base}${pageOf(problem)}`)
      await openExplanation(page)

      const before = await page.run(`
        const runs = [...document.querySelectorAll('button')]
          .filter(b => b.innerText.trim() === 'Run');
        return {
          buttons: runs.length,
          editors: document.querySelectorAll(
            'textarea[aria-label="the script, yours to change"]'
          ).length,
          // nothing may be RUNNING before a press: the whole case for
          // self-hosting 10.6 MB is that a reader who never runs never pays.
          // Measured on the page, not on performance.getEntriesByType:
          // because the runtime is fetched INSIDE the worker and a worker's
          // resource timeline is its own — the main thread never sees it, so
          // that check read zero whether or not CPython had loaded.
          started: /fetching CPython|loading Python/.test(document.body.innerText),
          output: !!document.querySelector('pre + div, [class*="output"]') ||
            [...document.querySelectorAll('span')].some(s => s.innerText.trim() === 'output'),
        };
      `)
      assert.ok(before.buttons >= 2, `only ${before.buttons} Run buttons`)
      // every block is editable now, not only the full script — a reader learns
      // by changing a line, and the draft is component state, so nothing is saved
      assert.equal(
        before.editors,
        before.buttons,
        "a block can be run but not edited"
      )
      assert.equal(before.started, false, "CPython started before Run was pressed")
      assert.equal(before.output, false, "an output panel rendered before any run")

      // press the LAST Run — the full runnable script
      await page.run(`
        const runs = [...document.querySelectorAll('button')]
          .filter(b => b.innerText.trim() === 'Run');
        runs[runs.length - 1].click();
        return true;
      `)

      // booting CPython is seconds, not milliseconds
      await page.waitFor(
        `!!document.body.innerText.match(/exit 0|error \u00b7/)`,
        { tries: 90, gap: 1000 }
      )

      const out = await page.run(`
        const text = document.body.innerText;
        return {
          ok: /exit 0/.test(text),
          agreed: /ALL APPROACHES AGREED/i.test(text),
          // the four rung names the document's script exercises, so this
          // fails if the page ever runs a DIFFERENT script than the one CI does
          rungs: ['nested_walk', 'visited_set', 'floyd', 'value_marking']
            .filter(n => text.includes(n)).length,
          tail: text.slice(-400),
        };
      `)
      assert.ok(out.ok, `the script did not exit 0 — page ended: ${out.tail}`)
      assert.equal(
        out.rungs,
        4,
        `the script ran only ${out.rungs} of the document's four approaches`
      )
      assert.ok(
        out.agreed,
        `it ran but did not report agreement — page ended: ${out.tail}`
      )
      assert.deepEqual(page.errors(), [], "the problem page logged console errors")
    })

    // B79 / B87. The promotion and the comparator are both claims about what a
    // page RENDERS, so neither is settled by a node test: `ladderOf` returning
    // four rungs and the page drawing four rungs are different facts.
    test("a promoted rung renders, and compares against the one below it", async () => {
      await page.goto(`${server.base}/#/p/linked-list/cycle-detect`)
      const out = await page.run(`
        const text = document.body.innerText;
        const ladder = document.querySelector('[aria-label="approach ladder"]');
        return {
          count: (text.match(/([0-9]+) ways in/) || [])[1],
          brute: /Nested walk/i.test(text),
          mark: /Value-marking/i.test(text),
          asides: (ladder.innerText.match(/reading only/gi) || []).length,
          compares: [...ladder.querySelectorAll('button')]
            .filter(b => /^compare with/i.test(b.innerText)).length,
        };
      `)
      assert.equal(out.count, "4", "the ladder does not show four rungs")
      assert.ok(out.brute, "the promoted nested walk did not render")
      assert.ok(out.mark, "the promoted value-marking rung did not render")
      assert.equal(out.asides, 2, "the reading-only marks are wrong")
      assert.equal(out.compares, 3, "a compare control is missing")
      assert.deepEqual(page.errors(), [], "cycle-detect logged console errors")

      // and the comparator itself: a route, so it survives a reload
      await page.goto(
        `${server.base}/#/p/linked-list/cycle-detect?compare=set,floyd`
      )
      const cmp = await page.run(`
        const text = document.body.innerText;
        const lit = document.querySelectorAll('pre span[class*="border-chart-1"]');
        return {
          heading: /lines in common/i.test(text),
          both: /Floyd/i.test(text) && /set/i.test(text),
          marked: lit.length,
        };
      `)
      assert.ok(cmp.heading, "the comparator did not render its count")
      assert.ok(cmp.both, "the comparator is missing a side")
      assert.ok(
        cmp.marked >= 6,
        `only ${cmp.marked} lines marked as differing — expected most of both`
      )
      assert.deepEqual(page.errors(), [], "compare logged console errors")
    })

    // Every new problem page must at least render with a clean console. Twenty
    // pages arrived in one batch and the cheapest way to be wrong about all of
    // them at once is to check none of them.
    test("every problem page in batch 6 renders cleanly", async () => {
      const ids = [
        ["arrays-hashing", "missing-number"],
        ["arrays-hashing", "find-all-duplicates"],
        ["arrays-hashing", "plus-one"],
        ["arrays-hashing", "summary-ranges"],
        ["arrays-hashing", "intersection-of-arrays"],
        ["two-pointers", "remove-element"],
        ["two-pointers", "reverse-string"],
        ["two-pointers", "merge-sorted-array"],
        ["two-pointers", "three-sum-closest"],
        ["two-pointers", "boats-to-save"],
        ["two-pointers", "next-permutation"],
        ["linked-list", "add-two-numbers"],
        ["linked-list", "odd-even-list"],
        ["linked-list", "remove-list-elements"],
        ["linked-list", "swap-pairs"],
        ["linked-list", "rotate-list"],
      ]
      for (const [pattern, id] of ids) {
        await page.goto(`${server.base}/#/p/${pattern}/${id}`)
        const text = await page.eval("document.body.innerText")
        assert.ok(text.length > 200, `${id}: rendered almost nothing`)
        assert.ok(
          /5 ways in/.test(text),
          `${id}: the ladder does not show five rungs — ${text.slice(0, 80)}`
        )
        assert.deepEqual(page.errors(), [], `${id} logged console errors`)
      }
    })

    // B43. A derived act's Java and C++ are faithful translations of the same
    // rung and rarely the same LENGTH, so they used to be dropped: 36 of 304
    // acts had a Java tab. They render now with the highlight off and a line
    // saying so — 208 of 304.
    test("a derived act shows Java and C++, and says when no row is lit (B43)", async () => {
      await page.goto(`${server.base}/#/`)
      await page.run(`
        localStorage.clear();
        localStorage.setItem('dsa:unlocked:best-contiguous-run', '9');
        return 1;
      `)
      await page.goto(`${server.base}/#/journey/best-contiguous-run?act=brute`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        // two tablists on this page — the reading column's, and the code
        // panel's. Pick the one that carries the pseudocode tab.
        const strip = () => [...document.querySelectorAll('[role=tablist]')]
          .find(s => /pseudocode/i.test(s.textContent || ''));
        const names = () => [...strip().querySelectorAll('[role=tab]')]
          .map(b => b.textContent.trim().toLowerCase());
        const before = names();
        const java = [...strip().querySelectorAll('[role=tab]')]
          .find(b => /java/i.test(b.textContent));
        java.click();
        await wait(400);
        const pre = document.querySelector('pre');
        const lit = [...pre.children].filter(d => /shadow-chart-1|bg-chart-1/.test(d.className)).length;
        return {
          before,
          javaSelected: java.getAttribute('aria-selected'),
          says: document.body.innerText.includes('not the same lines'),
          lit,
          codeLines: pre.children.length,
        };
      `)
      assert.ok(out.before.includes("java"), `no Java tab: ${out.before}`)
      assert.ok(out.before.includes("c++"), `no C++ tab: ${out.before}`)
      assert.ok(
        !out.before.includes("unsynced"),
        "`unsynced` leaked into the tab strip"
      )
      assert.equal(out.javaSelected, "true", "the Java tab did not select")
      assert.ok(out.codeLines > 3, "the Java tab rendered no code")
      assert.equal(out.says, true, "nothing explains why no row is lit")
      assert.equal(out.lit, 0, "a row was lit on a tab that does not line up")
      await page.goto(`${server.base}/#/`)
      await page.run(`${FRESH} return 1`)
      assert.deepEqual(page.errors(), [])
    })

    // F5. Autoplay on a narrative frame waits `hold` times the usual delay with
    // nothing moving, and a still screen reads as a broken one. The bar under
    // Play counts the real wait down.
    test("the Play button shows the wait it is counting (F5)", async () => {
      await page.goto(`${server.base}/#/journey/two-sum`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const bar = () => document.querySelector('[data-testid="hold-bar"]');
        const paused = !!bar();
        document.querySelector('[aria-label="Play"]').click();
        await wait(300);
        const b = bar();
        const style = b ? getComputedStyle(b) : null;
        const out = {
          paused,
          playing: !!b,
          duration: style ? style.animationDuration : null,
          name: style ? style.animationName : null,
          hidden: b ? b.getAttribute('aria-hidden') : null,
          insideButton: b ? !!b.closest('button') : false,
        };
        document.querySelector('[aria-label="Pause"]')?.click();
        await wait(200);
        out.goneWhenPaused = !bar();
        return out;
      `)
      assert.equal(out.paused, false, "a paused player has nothing to count")
      assert.equal(out.playing, true, "no hold bar while playing")
      assert.equal(out.name, "hold-fill", `wrong animation: ${out.name}`)
      assert.ok(
        parseFloat(out.duration) > 0,
        `the bar has no duration: ${out.duration}`
      )
      assert.equal(out.hidden, "true", "the bar must not be read out")
      assert.equal(out.insideButton, true, "the bar is not on the Play button")
      assert.equal(out.goneWhenPaused, true, "the bar outlived the playback")
      assert.deepEqual(page.errors(), [])
    })

    // B19. Restart is one click and it re-locks every act. Rather than a
    // confirm dialog in front of every restart, the ledger it destroyed is
    // held for five seconds and offered back.
    test("restart can be undone, and the ledger comes back exactly (B19)", async () => {
      await page.goto(`${server.base}/#/`)
      await page.run(`
        localStorage.clear();
        localStorage.setItem('dsa:unlocked:two-sum', '4');
        localStorage.setItem('dsa:quizzes:two-sum', JSON.stringify(['story']));
        return 1;
      `)
      await page.goto(`${server.base}/#/journey/two-sum`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const banner = () => document.querySelector('[aria-label="restart undo"]');
        const before = localStorage.getItem('dsa:unlocked:two-sum');
        document.querySelector('[aria-label="restart journey"]').click();
        await wait(400);
        const afterRestart = localStorage.getItem('dsa:unlocked:two-sum');
        const offered = !!banner();
        [...banner().querySelectorAll('button')]
          .find(b => /^undo$/i.test(b.textContent.trim())).click();
        await wait(400);
        return {
          before, afterRestart, offered,
          restored: localStorage.getItem('dsa:unlocked:two-sum'),
          quizzes: localStorage.getItem('dsa:quizzes:two-sum'),
          gone: !banner(),
        };
      `)
      assert.equal(out.before, "4")
      assert.equal(out.afterRestart, "1", "restart did not re-lock the acts")
      assert.equal(out.offered, true, "no undo was offered")
      assert.equal(out.restored, "4", "undo did not put the ledger back")
      assert.equal(out.quizzes, '["story"]', "the quiz record was not restored")
      assert.equal(out.gone, true, "the banner stayed after undo")
      assert.deepEqual(page.errors(), [])
    })

    test("the undo window closes on its own, and restart is then final (B19)", async () => {
      await page.goto(`${server.base}/#/`)
      await page.run(`
        localStorage.setItem('dsa:unlocked:two-sum', '4');
        return 1;
      `)
      await page.goto(`${server.base}/#/journey/two-sum`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const banner = () => document.querySelector('[aria-label="restart undo"]');
        document.querySelector('[aria-label="restart journey"]').click();
        await wait(400);
        const offered = !!banner();
        await wait(5200);
        return { offered, gone: !banner(),
                 unlocked: localStorage.getItem('dsa:unlocked:two-sum') };
      `)
      assert.equal(out.offered, true, "no undo was offered")
      assert.equal(out.gone, true, "the undo window never closed")
      assert.equal(out.unlocked, "1", "the restart did not stick")
      await page.goto(`${server.base}/#/`)
      await page.run(`${FRESH} return 1`)
    })

    // B45. The catalogue has masked a pattern name under an active promise
    // since B8; the problem page named it twice anyway — in the back link and
    // in the glyph strip. Measured 2026-09-09: sorted-pair-sum and
    // container-water both read "Two Pointers" with the journey unfinished.
    test("the problem page masks a pattern its journey has not revealed (B45)", async () => {
      await page.goto(`${server.base}/#/`)
      await page.run(`
        localStorage.clear();
        localStorage.setItem('dsa:unlocked:sorted-pair-sum', '2');
        return 1;
      `)
      await page.goto(`${server.base}/#/p/two-pointers/sorted-pair-sum`)
      const midFlight = await page.eval("document.body.innerText")
      assert.ok(
        !midFlight.toLowerCase().includes("two pointers"),
        "the problem page named the pattern the journey is still teaching"
      )
      assert.ok(
        midFlight.includes("· · ·"),
        "nothing was masked, so the page is not using the mask at all"
      )

      // and it comes back the moment the journey is finished
      await page.goto(`${server.base}/#/`)
      await page.run(`
        localStorage.setItem('dsa:unlocked:sorted-pair-sum', '99');
        return 1;
      `)
      await page.goto(`${server.base}/#/p/two-pointers/sorted-pair-sum`)
      const earned = await page.eval("document.body.innerText")
      assert.ok(
        earned.toLowerCase().includes("two pointers"),
        "the name was earned and still hidden"
      )
      await page.goto(`${server.base}/#/`)
      await page.run(`${FRESH} return 1`)
      assert.deepEqual(page.errors(), [])
    })

    test("the test-case drawer floats over the stage instead of shrinking it (R4, B59)", async () => {
      await page.goto(`${server.base}/#/journey/two-sum?act=story`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const stage = () => document.querySelector('[aria-label=stage]').getBoundingClientRect();
        const flask = () => document.querySelector('[aria-label="test cases"][aria-controls]');
        const drawer = () => document.getElementById('test-cases');
        const before = stage().width;
        const closedPointer = getComputedStyle(drawer()).pointerEvents;
        const closedInert = drawer().hasAttribute('inert');
        flask().click();
        await wait(600);
        const after = stage().width;
        const box = drawer().getBoundingClientRect();
        const preset = drawer().querySelector('[aria-label="input preset"]');
        return {
          before, after,
          closedPointer, closedInert,
          drawerWidth: box.width,
          overStage: box.left < stage().right - 1,
          inViewport: box.right <= window.innerWidth + 1,
          hasPreset: !!preset,
          inert: drawer().hasAttribute('inert'),
        };
      `)
      assert.equal(
        out.closedPointer,
        "none",
        "a closed drawer must not swallow clicks meant for the stage"
      )
      assert.equal(out.closedInert, true, "a closed drawer must be inert")
      assert.equal(
        out.after,
        out.before,
        `the stage lost width to a control: ${out.before} → ${out.after}`
      )
      assert.ok(out.drawerWidth > 200, "the drawer did not open")
      assert.equal(out.overStage, true, "the drawer is not over the stage")
      assert.equal(out.inViewport, true, "the drawer ran off the right edge")
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
      assert.equal(
        quiz.stepped,
        false,
        "the arrow keys also stepped the player"
      )

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
          // it floats now (B59), so "closed" is invisible and inert rather
          // than zero-width
          closedOpacity: getComputedStyle(d).opacity,
          closedPointer: getComputedStyle(d).pointerEvents,
          focusBack: document.activeElement.getAttribute('aria-label'),
          inert: d.hasAttribute('inert'),
        };
      `)
      assert.ok(esc.opened > 200, "the drawer did not open")
      assert.equal(esc.closedOpacity, "0", "Esc did not close the drawer")
      assert.equal(
        esc.closedPointer,
        "none",
        "a closed drawer still takes clicks"
      )
      assert.equal(
        esc.focusBack,
        "test cases",
        "focus was left in a closed drawer"
      )
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
      assert.equal(
        out.fadedEarly,
        false,
        "a pair faded before its twin arrived"
      )
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

    test("a step chip flashes the moment its act is done (R8)", async () => {
      await page.goto(`${server.base}/#/journey/two-sum?act=story`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const node = () => document.querySelector('nav[aria-label="learning journey"] button');
        const bg = () => getComputedStyle(node()).backgroundColor;
        const t = document.querySelector('[aria-label=timeline]');
        const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        // park one frame short, so the act finishes on a single step
        set.call(t, String(Number(t.max) - 1));
        t.dispatchEvent(new Event('input', { bubbles: true }));
        await wait(500);
        const resting = bg();
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await wait(60);
        const flashing = { bg: bg(), animation: getComputedStyle(node()).animationName };
        await wait(600);
        return { resting, flashing, settled: bg(), tick: node().innerText.slice(0, 1) };
      `)
      assert.equal(
        out.flashing.animation,
        "step-done",
        "no flash on completion"
      )
      assert.notEqual(out.flashing.bg, out.resting, "the flash changed nothing")
      assert.equal(out.settled, out.resting, "the flash did not settle back")
      assert.equal(out.tick, "✓", "the act was not marked done")
      assert.deepEqual(page.errors(), [])
    })

    test("a problem states its constraints, and a corner case cites one (R2)", async () => {
      await page.goto(`${server.base}/#/p/arrays-hashing/single-number`)
      const page1 = await page.run(`
        const c = document.querySelector('[aria-label=constraints]');
        return {
          found: !!c,
          lines: c ? [...c.querySelectorAll('li')].map(l => l.innerText.trim()) : [],
        };
      `)
      assert.ok(page1.found, "no constraints block on the problem page")
      assert.ok(page1.lines.length >= 2, "expected at least two constraints")
      assert.ok(
        page1.lines.some((l) => /nums\.length/.test(l)),
        `constraints do not mention the input's bounds: ${JSON.stringify(page1.lines)}`
      )

      await page.goto(`${server.base}/#/journey/single-number?act=story`)
      const cited = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        // corner cases sit in their own tab now (spec 5.2)
        [...document.querySelectorAll('[role=tab]')]
          .find(t => /edge cases/i.test(t.textContent))?.click();
        await wait(500);
        const li = [...document.querySelectorAll('[aria-label="corner cases"] > li')];
        return li.map(l => l.innerText.split(String.fromCharCode(10))
          .filter(x => x.startsWith('from')).length);
      `)
      assert.ok(cited.length >= 3, "expected at least three corner cases")
      assert.deepEqual(
        cited.filter((n) => n === 0),
        [],
        "a corner case does not cite the constraint it comes from"
      )
      assert.deepEqual(page.errors(), [])
    })

    test("the approach ladder reads worst → best and obeys the ledger (R1)", async () => {
      const read = `
        const wait = ms => new Promise(r => setTimeout(r, ms));
        [...document.querySelectorAll('[role=tab]')]
          .find(t => /approaches/i.test(t.innerText))?.click();
        await wait(600);
        const l = document.querySelector('[aria-label="approach ladder"]');
        const cta = [...document.querySelectorAll('a')]
          .find(a => /solve on leetcode/i.test(a.innerText));
        return {
          names: l ? [...l.querySelectorAll('b')].map(b => b.innerText) : [],
          capped: l ? /still ahead of you/.test(l.innerText) : false,
          cta: cta ? cta.href : null,
          // No editor ABOVE the explanation. The page explains and hosts no
          // editor — that is why the primary action leaves for LeetCode — but
          // the document's own full runnable script at the foot IS editable
          // (B83), and it moved onto this page when the two routes merged. So
          // the question is where the textarea is, not whether one exists.
          editor: [...document.querySelectorAll('textarea')].some(
            t => !t.closest('#explanation')
          ),
        };
      `
      // never opened the journey: the whole ladder, ending on the best rung
      await page.goto(`${server.base}/#/`)
      await page.run(
        `localStorage.removeItem('dsa:unlocked:single-number'); return 1`
      )
      await page.goto(`${server.base}/#/p/arrays-hashing/single-number`)
      const all = await page.run(read)
      assert.ok(
        all.names.length >= 3,
        `expected several rungs, got ${all.names.length}`
      )
      assert.equal(
        all.names[all.names.length - 1],
        "XOR",
        "the best rung should be last"
      )
      assert.equal(
        all.capped,
        false,
        "nothing should be held back before starting"
      )
      assert.equal(all.cta, "https://leetcode.com/problems/single-number/")
      assert.equal(
        all.editor,
        false,
        "an editor appeared above the explanation — this page hosts none"
      )

      // midway through the journey: only what has been earned
      await page.goto(`${server.base}/#/`)
      await page.run(
        `localStorage.setItem('dsa:unlocked:single-number', '3'); return 1`
      )
      await page.goto(`${server.base}/#/p/arrays-hashing/single-number`)
      const capped = await page.run(read)
      assert.ok(
        capped.names.length < all.names.length,
        `the ledger did not cap the ladder: ${JSON.stringify(capped.names)}`
      )
      assert.equal(capped.capped, true, "no nudge back to the journey")
      assert.equal(
        capped.names.includes("XOR"),
        false,
        "an unearned rung leaked"
      )
      assert.deepEqual(page.errors(), [])
    })

    test("the bars panel draws water between the two walls, capped by the shorter (#5)", async () => {
      await page.goto(`${server.base}/#/`)
      await page.run(
        `localStorage.setItem('dsa:unlocked:container-water', '5'); return 1`
      )
      await page.goto(`${server.base}/#/journey/container-water?act=squeeze`)
      await page.waitFor(
        `/act 03/i.test(document.querySelector('[aria-label=stage]')?.innerText ?? '')`
      )
      // the textbook row, so the numbers below are fixed rather than random
      await page.run(`
        const sel = document.querySelector('[aria-label="input preset"]');
        const set = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        set.call(sel, 'classic');
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        return 1;
      `)
      await page.waitFor(
        `document.querySelectorAll('[aria-label="heights as bars"] > div').length === 9`
      )
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        // scrub rather than step: a predict card interrupts the walk, and
        // scrubbing is the documented way past it
        const t = document.querySelector('[aria-label=timeline]');
        const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const seek = async k => {
          set.call(t, String(k));
          t.dispatchEvent(new Event('input', { bubbles: true }));
          await wait(500);
        };
        const cols = () => [...document.querySelectorAll('[aria-label="heights as bars"] > div')];
        const wet = () => cols().filter(c => c.querySelector('[aria-hidden]')).length;
        const stage = () => document.querySelector('[aria-label=stage]').innerText;
        const area = () => (stage().match(/width \\d+ . height \\d+ = \\d+/) ?? [])[0] ?? null;
        const seen = [];
        for (let k = 0; k <= 5; k++) { await seek(k); seen.push({ k, wet: wet(), area: area() }); }
        return {
          columns: cols().length,
          seen,
          best: (stage().match(/best so far \\d+/) ?? [])[0] ?? null,
        };
      `)
      assert.equal(out.columns, 9, "the textbook row has nine posts")
      const [dry, opening] = out.seen
      assert.equal(dry.wet, 0, "the synthetic first frame holds no water yet")
      assert.equal(
        opening.wet,
        9,
        "the opening container spans the whole row, so every column holds water"
      )
      // [1, 8, 6, 2, 5, 4, 8, 3, 7]: the ends are 8 apart and capped at 1
      assert.equal(opening.area, "width 8 × height 1 = 8")
      // once the post of height 1 is retired the water narrows, and the pair
      // it settles on is 8 and 7 — the answer the problem statement quotes
      const narrowed = out.seen.find((f) => f.wet > 0 && f.wet < 9)
      assert.ok(
        narrowed,
        `retiring a post must narrow the water: ${JSON.stringify(out.seen)}`
      )
      assert.equal(narrowed.wet, 8)
      assert.equal(narrowed.area, "width 7 × height 7 = 49")
      assert.ok(out.best, "the best-so-far line disappeared")
      assert.deepEqual(page.errors(), [])
    })

    // ---------- 3b. the catalogue keeps the secret ----------

    test("the reading list is masked with the pattern it would name", async () => {
      // A references panel is a pattern name written five different ways —
      // "Hash table", "Dijkstra's algorithm", "Binary search tree" — so it can
      // leak the exact word B45 exists to withhold. The panel MOVED to the
      // problem page, where a reader reaches for it; the rule moved with it.
      const read = `
        const panel = [...document.querySelectorAll('section')]
          .find(s => /read further/i.test(s.innerText || ''));
        return {
          panel: !!panel,
          rows: panel ? panel.querySelectorAll('a[href^="http"]').length : 0,
          text: panel ? panel.innerText : '',
        };
      `
      await page.goto(`${server.base}/#/`)
      await page.run(`${FRESH} return 1`)
      await page.goto(`${server.base}/#/p/two-pointers/move-zeroes`)
      const shown = await page.run(read)
      assert.ok(shown.panel, "no reading list on an unmasked pattern's problem")
      assert.ok(shown.rows >= 3, `only ${shown.rows} readings`)

      // mid-journey: the panel goes entirely, not merely its heading
      await page.run(
        `localStorage.setItem('dsa:unlocked:two-sum', '3'); return 1`
      )
      await page.goto(`${server.base}/#/p/two-pointers/move-zeroes`)
      const masked = await page.run(read)
      assert.equal(
        masked.panel,
        false,
        "the reading list rendered while the pattern was masked"
      )

      await page.goto(`${server.base}/#/`)
      await page.run(`localStorage.removeItem('dsa:unlocked:two-sum'); return 1`)
      assert.deepEqual(page.errors(), [])
    })

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
      await page.run(
        `localStorage.setItem('dsa:unlocked:two-sum', '3'); return 1`
      )
      await page.goto(`${server.base}/#/p/two-pointers`)
      const mid = await page.run(read)
      assert.doesNotMatch(
        mid.sidebar,
        /two pointers/i,
        "the sidebar leaked the name"
      )
      assert.doesNotMatch(
        mid.heading,
        /two pointers/i,
        "the pattern page leaked the name"
      )
      assert.match(mid.heading, /· · ·/)

      // finished: earned, so it is shown again
      await page.run(
        `localStorage.setItem('dsa:unlocked:two-sum', '7'); return 1`
      )
      await page.goto(`${server.base}/#/p/two-pointers`)
      const done = await page.run(read)
      assert.match(done.sidebar, /two pointers/i)
      assert.match(done.heading, /two pointers/i)
      assert.deepEqual(page.errors(), [])
    })

    test('"show names anyway" turns masking off for good', async () => {
      await page.goto(`${server.base}/#/`)
      await page.run(
        `${FRESH} localStorage.setItem('dsa:unlocked:two-sum', '3'); return 1`
      )
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
        // text-meta, not text-xs: the raw Tailwind sizes became roles on
        // 2026-09-12 (docs/DESIGN.md), and this selector names a real class
        const rows = [...document.querySelectorAll('.font-mono.text-meta > div')]
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
        // The problem page is stacked sections now, not tabs (B38) — the
        // walkthrough is open, so there is nothing to click. Find the section
        // by its own heading rather than by a tab that no longer exists.
        await wait(1200);
        const heading = [...document.querySelectorAll('h2')].find(
          e => /^walkthrough/i.test(e.innerText.trim())
        );
        const panel = heading?.closest('section') ?? document.querySelector('main');
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
      await page.run(
        `localStorage.setItem('dsa:unlocked:two-sum', '2'); return 1`
      )
      await page.goto(`${server.base}/#/p/arrays-hashing/pair-sum`)
      const mid = await page.run(openTab)
      assert.match(
        mid.act,
        /brute force/i,
        "the page spoiled an unearned approach"
      )
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
      assert.ok(
        out.before.bars > 0,
        "the sort view did not render to begin with"
      )
      assert.equal(out.after.bars, 0, "the hash changed but the bars stayed")
      assert.ok(out.after.graph > 0, "the graph view never appeared")
      assert.deepEqual(page.errors(), [])
    })

    test("journey progress reads the same on the sidebar and the home card (U5)", async () => {
      await page.goto(`${server.base}/#/`)
      await page.run(
        `${FRESH} localStorage.setItem('dsa:unlocked:two-sum', '3'); return 1`
      )
      await page.goto(`${server.base}/#/`)
      const out = await page.run(`
        const has = (el, word) => el.innerText.toLowerCase().includes(word);
        const row = [...document.querySelectorAll('[data-slot=sidebar-menu-item]')]
          .find(li => has(li, 'two sum'));
        const badgeEl = row?.querySelector('[data-slot=sidebar-menu-badge]');
        // The DOCK, not a card in a list. Home used to carry a catalogue of
        // journeys directly under the dock, so the journey you were halfway
        // through appeared twice on one screen — which is what this check was
        // unknowingly comparing. The dock is now the one home surface for a
        // journey in play.
        const card = document.querySelector('[data-testid=dock]');
        // The COUNT field, not the first line containing the word: Two Sum's
        // own subtitle ends "…each earned by the last one's weakness", so a
        // substring match reads the subtitle whenever the row happens to put it
        // above the count. The dock speaks the LONG form ("2 of 6 acts earned")
        // and the sidebar badge the short one ("2/6") with the long form in its
        // title — so the check is that the two agree on the same count, not
        // that they print the same string.
        const isCount = t => t.trim().endsWith(' acts earned') || t.trim() === 'all acts earned';
        const line = (card?.innerText ?? '').split(String.fromCharCode(10)).find(isCount) ?? '';
        return { badge: badgeEl?.innerText.trim(), cardText: line.trim(), title: badgeEl?.getAttribute('title') };
      `)
      assert.equal(
        out.badge,
        "2/6",
        "sidebar should count acts earned, not acts unlocked"
      )
      assert.equal(
        out.cardText,
        "2 of 6 acts earned",
        "the home dock should agree with the sidebar"
      )
      assert.match(out.title ?? "", /2 of 6 acts earned/)
      assert.equal(
        out.cardText,
        out.title,
        "the dock and the sidebar's own tooltip disagree about the same journey"
      )
    })

    // Checked on several routes, not one. The single-route version passed for
    // months while the walkthrough narration ran to 107ch and the SQL intro to
    // 110ch — a rule only holds where something looks.
    for (const route of [
      "/#/p/arrays-hashing/pair-sum",
      "/#/p/graphs/island-count",
      "/#/sql",
      "/#/journey/container-water",
    ])
      test(`prose stays inside a readable measure (U7) — ${route}`, async () => {
        await page.goto(`${server.base}${route}`)
        // Reports WHICH paragraph is too wide, not just that one is: the
        // first version of this test cost an afternoon of hunting because a
        // bare number says nothing about where to look.
        const worst = await page.run(`
        const rows = [...document.querySelectorAll('main p')]
          .filter(e => e.textContent.trim().length > 120)
          .map(e => ({
            ch: Math.round(e.getBoundingClientRect().width / (parseFloat(getComputedStyle(e).fontSize) * 0.5)),
            cls: e.className.toString().slice(0, 70),
            text: e.textContent.trim().slice(0, 40),
          }))
          .sort((a, b) => b.ch - a.ch);
        return rows[0] ?? { ch: 0, cls: '', text: '' };
      `)
        assert.ok(
          worst.ch <= 80,
          `longest measure is ${worst.ch}ch, want <= 80 — "${worst.text}…" [${worst.cls}]`
        )
      })

    test("the narration stays on screen even on a long panel (U1)", async () => {
      await page.goto(`${server.base}/#/`)
      await page.run(
        `localStorage.setItem('dsa:unlocked:two-sum', '7'); return 1`
      )
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

    // Two bugs that shipped together, both about an in-page jump. Written
    // after a user reported "the bar is hiding the text I want to see".
    //
    //   1. The ladder's "01 Brute Force" links were bare `#rung-…` hrefs. In a
    //      HASH-ROUTED app that is a route change: location.hash became
    //      "#rung-brute", the router parsed the route `rung-brute`, and the app
    //      rendered HOME. The problem page you were reading was gone.
    //   2. Even once it scrolled, the target landed at y=0 — under the phone's
    //      61px `sticky top-0` bar. `scroll-padding-top` (index.css) fixes that
    //      for every anchor in the app at once, which is why this asserts the
    //      LANDING and not the CSS.
    test("a jump to an approach scrolls, and lands clear of the sticky bar", async () => {
      await page.resize(390, 844)
      await page.goto(`${server.base}/#/p/arrays-hashing/pair-sum`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const bar = document.querySelector('.sticky.top-0');
        const barH = bar ? Math.round(bar.getBoundingClientRect().height) : 0;
        const link = [...document.querySelectorAll('nav a')]
          .find(a => /^0[0-9]/.test(a.innerText.trim()));
        if (!link) return { noLink: true };
        const target = document.getElementById(link.getAttribute('href').slice(1));
        link.click();
        await wait(900);
        const heading = target.querySelector('b');
        return {
          barH,
          route: location.hash,
          stillHere: !!document.querySelector('[aria-label="approach ladder"]'),
          headingTop: Math.round(heading.getBoundingClientRect().top),
          moved: Math.round(target.getBoundingClientRect().top) !== 0,
        };
      `)
      await page.resize(1440)
      assert.ok(!out.noLink, "the ladder drew no jump links to test")
      assert.equal(
        out.route,
        "#/p/arrays-hashing/pair-sum",
        "a bare #id href hijacked the hash ROUTE — the reader was thrown off the page"
      )
      assert.ok(out.stillHere, "the problem page unmounted on an in-page jump")
      assert.ok(
        out.headingTop >= out.barH,
        `the rung landed at ${out.headingTop}px, under a ${out.barH}px sticky bar`
      )
      assert.deepEqual(page.errors(), [])
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
      await page.run(
        `localStorage.setItem('dsa:unlocked:two-sum', '7'); return 1`
      )
      await page.goto(`${server.base}/#/journey/two-sum?act=hash&step=6`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const header = document.querySelector('header').getBoundingClientRect();
        const stage = document.querySelector('[aria-label=stage]').getBoundingClientRect();
        const pill = [...document.querySelectorAll('header button')]
          .find(b => b.getAttribute('aria-haspopup') === 'dialog');
        // There are two transports in the DOM now — one in the top bar from
        // lg, one at the foot of the stage below it — and exactly one is
        // displayed. Measure the VISIBLE one: querySelector would take the
        // first in document order, which on a phone is the hidden one.
        const shown = l => [...document.querySelectorAll('[aria-label="' + l + '"]')]
          .find(el => el.getBoundingClientRect().height > 0);
        const transport = ['Play', 'Step back', 'Step forward', 'Restart act']
          .map(shown)
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

    // The stage is the product. On a 390x844 phone it used to get 197px — 23%
    // of the viewport — because the reading column sat under it at
    // `max-h-[45svh]`, nearly twice the stage's size, to keep four tabs
    // permanently on screen. Below lg those four are a 53px bottom bar now and
    // each opens the same DrawerTabs in a sheet. This asserts the SHARE, not
    // the pixels, so it survives a different phone.
    test("on a phone the stage gets the screen, and reading is a bottom bar", async () => {
      await page.resize(390, 844)
      await page.goto(`${server.base}/#/journey/two-sum?act=story`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const h = el => el ? Math.round(el.getBoundingClientRect().height) : 0;
        const stage = document.querySelector('[aria-label=stage]');
        const nav = document.querySelector('nav[aria-label=reading]');
        const btns = nav ? [...nav.querySelectorAll('button')] : [];
        btns[2]?.click();
        await wait(700);
        return {
          stagePct: Math.round(h(stage) / window.innerHeight * 100),
          navH: h(nav),
          buttons: btns.length,
          allTouch: btns.every(b => b.getBoundingClientRect().height >= 44),
          columnHidden: h(document.querySelector('aside[aria-label="approach"]')) === 0,
          sheetOpened: !!document.querySelector('[role=dialog]'),
          landedOnEdges: !!document.querySelector('[aria-label="corner cases"]'),
          scrollW: document.documentElement.scrollWidth,
        };
      `)
      await page.resize(1440)
      assert.equal(out.buttons, 4, "the reading bar lost a destination")
      assert.ok(out.allTouch, "a reading-bar button is under the 44px touch target")
      assert.ok(out.columnHidden, "the reading COLUMN is still rendered on a phone")
      assert.ok(
        out.navH <= 80,
        `the reading bar is ${out.navH}px — it is a bar, not a column`
      )
      assert.ok(
        out.stagePct >= 50,
        `the stage gets only ${out.stagePct}% of a phone screen`
      )
      assert.ok(out.sheetOpened, "a reading-bar button did not open its sheet")
      assert.ok(out.landedOnEdges, "the sheet did not open on the tab that was tapped")
      assert.equal(out.scrollW, 390)
      assert.deepEqual(page.errors(), [])
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
      assert.equal(
        fresh.has,
        false,
        "a fresh learner was offered a resume card"
      )

      await page.run(
        `localStorage.setItem('dsa:unlocked:two-sum', '3'); return 1`
      )
      await page.goto(`${server.base}/#/`)
      const mid = await page.run(read)
      assert.ok(mid.has, "a started journey was not offered")
      assert.match(mid.href, /#\/journey\/two-sum\?act=/)
      assert.match(mid.text, /2 of 6 acts earned/)

      await page.run(
        `localStorage.setItem('dsa:unlocked:two-sum', '7'); return 1`
      )
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
      assert.ok(
        out.open.side > 200 && out.open.read > 200,
        "rails did not start open"
      )
      assert.ok(
        out.shut.side < 80 && out.shut.read < 80,
        "`f` did not close both rails"
      )
      assert.ok(
        out.back.side > 200 && out.back.read > 200,
        "`f` did not reopen them"
      )
      assert.match(out.dialog, /keyboard shortcuts/i)
      assert.deepEqual(page.errors(), [])
    })

    test("the theme switch is on screen, and light is a real palette", async () => {
      // The provider has offered dark/light/system since the shell was built
      // and nothing rendered it. Checks the control exists, that it changes
      // the page, and that light keeps the five chart roles DISTINCT —
      // colour is load-bearing here, so a grey light theme is a broken one.
      await page.goto(`${server.base}/#/`)
      const out = await page.run(`
        const wait = ms => new Promise(r => setTimeout(r, ms));
        document.querySelector('[aria-label=settings]')?.click();
        await wait(500);
        const dialog = document.querySelector('[role=dialog]');
        const options = [...dialog.querySelectorAll('button')]
          .map(b => b.textContent.trim())
          .filter(t => ['dark', 'light', 'system'].includes(t));
        const before = getComputedStyle(document.body).backgroundColor;
        [...dialog.querySelectorAll('button')].find(b => b.textContent.trim() === 'light')?.click();
        await wait(400);
        const after = getComputedStyle(document.body).backgroundColor;
        const role = name => {
          const probe = document.createElement('div');
          probe.style.color = 'var(--' + name + ')';
          document.body.appendChild(probe);
          const c = getComputedStyle(probe).color;
          probe.remove();
          return c;
        };
        const charts = ['chart-1','chart-2','chart-3','chart-4','chart-5'].map(role);
        return {
          options,
          before,
          after,
          theme: document.documentElement.className,
          distinctCharts: new Set(charts).size,
        };
      `)
      // put it back so later checks run on the theme they were written for
      await page.run(
        `localStorage.removeItem('ui-theme'); document.documentElement.className = 'dark'; return 1`
      )
      assert.deepEqual(out.options, ["dark", "light", "system"])
      assert.equal(out.theme, "light")
      assert.notEqual(out.before, out.after, "switching theme changed nothing")
      assert.equal(
        out.distinctCharts,
        5,
        "the light theme collapses the chart roles into fewer colours"
      )
      assert.deepEqual(page.errors(), [])
    })

    test("settings, shortcuts and collapse share one footer row", async () => {
      await page.goto(`${server.base}/#/`)
      const out = await page.run(`
        const box = l => {
          const el = [...document.querySelectorAll('button,a')]
            .find(e => (e.getAttribute('aria-label') || '').toLowerCase() === l);
          return el ? el.getBoundingClientRect() : null;
        };
        const s = box('settings'), k = box('keyboard shortcuts'), c = box('collapse sidebar');
        const footer = document.querySelector('[data-sidebar=footer]');
        return {
          ys: [s, k, c].map(b => b && Math.round(b.top)),
          xs: [s, k, c].map(b => b && Math.round(b.left)),
          footerH: Math.round(footer.getBoundingClientRect().height),
        };
      `)
      assert.ok(
        out.ys.every((y) => y !== null && y === out.ys[0]),
        `the three footer controls are on different rows: ${out.ys.join(", ")}`
      )
      assert.ok(
        new Set(out.xs).size === 3,
        "the three footer controls overlap horizontally"
      )
      assert.ok(out.footerH <= 96, `the footer is ${out.footerH}px tall`)
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
      assert.equal(
        after,
        "cinematic",
        "the preference did not survive a reload"
      )
    })

    // ---------- 5. phone width ----------

    test("the densest panel does not overlap, overflow or shrink below 12px", async () => {
      // 79 journeys share eight panel kinds, and every one was designed against
      // small presets. The DP table at its largest is the densest thing the
      // stage ever draws — 80 cells — so it is the one worth pinning.
      // `node test/panel-audit.mjs` walks all eight and prints the numbers.
      await page.goto(`${server.base}/#/`)
      await page.run(
        `localStorage.setItem('dsa:unlocked:same-order-gaps-allowed', '9'); return 1`
      )
      await page.goto(`${server.base}/#/journey/same-order-gaps-allowed`)
      await page.waitFor(`!!document.querySelector('[aria-label=stage]')`)
      // the preset first: applying one restarts the act
      await page.run(`
        const s = document.querySelector('select[aria-label="input preset"]');
        const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
        set.call(s, 'long');
        s.dispatchEvent(new Event('change', { bubbles: true }));
        return 1;
      `)
      await page.run(`return new Promise(r => setTimeout(() => r(1), 900))`)
      await page.run(`
        const btns = [...document.querySelectorAll('button')]
          .filter(b => /^[0-9][0-9]/.test(b.textContent.trim()) && b.closest('[data-sidebar]') === null);
        btns[btns.length - 1]?.click();
        return 1;
      `)
      await page.run(`return new Promise(r => setTimeout(() => r(1), 700))`)
      await page.run(`
        const t = document.querySelector('input[aria-label=timeline]');
        const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        set.call(t, String(Math.max(1, Math.floor(Number(t.max) * 0.6))));
        t.dispatchEvent(new Event('change', { bubbles: true }));
        return 1;
      `)
      const out = await page.run(`
        const stage = document.querySelector('[aria-label=stage]');
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
          cells: cells.length,
          overlaps,
          outside: boxes.filter(b => b.right > sb.right + 1 || b.left < sb.left - 1).length,
          minFont: Math.min(...fonts),
          act: stage.innerText.split('\\n')[0],
        };
      `)
      assert.ok(
        out.cells >= 40,
        `the dense preset drew only ${out.cells} cells (${out.act})`
      )
      assert.equal(
        out.overlaps,
        0,
        `${out.overlaps} pairs of panel cells overlap`
      )
      assert.equal(
        out.outside,
        0,
        `${out.outside} cells are drawn outside the stage`
      )
      assert.ok(
        out.minFont >= 12,
        `the smallest text on the stage is ${out.minFont}px`
      )
      assert.deepEqual(page.errors(), [])
    })

    test("every problem has a journey, so the static player is unreachable", async () => {
      // V9 fixed the legend in `step-player.tsx`, which no route renders any
      // more: all 87 problems have a journey now, so the problem page always
      // draws the engine stage instead. This check is what makes that a
      // FACT rather than an assumption — it fails the moment a problem is
      // added without a journey, which is exactly when the question "keep the
      // static player or delete it?" (B61) has to be answered.
      await page.goto(`${server.base}/#/p/arrays-hashing/group-anagrams`)
      const out = await page.run(`
        const walkthrough = [...document.querySelectorAll('h2, h3')]
          .find(h => /walkthrough/i.test(h.textContent || ''));
        return {
          hasSection: !!walkthrough,
          // the engine draws real chips and panels, which carry data-k keys;
          // the static player's cells never do
          engineStage: !!document.querySelector('[data-k]'),
          staticPlayer: !!document.querySelector('[aria-label^="walkthrough,"]'),
        };
      `)
      assert.ok(out.hasSection, "the walkthrough section is gone entirely")
      assert.ok(
        out.engineStage,
        "the problem page is not drawing the engine stage"
      )
      assert.equal(
        out.staticPlayer,
        false,
        "a static walkthrough player rendered — some problem has no journey (see B61)"
      )
      assert.deepEqual(page.errors(), [])
    })

    test("a Markdown explanation renders as a page, not as raw markdown", async () => {
      // The reader parses `docs/learn/<id>.md` in the browser, so the things
      // that can break are exactly the things node cannot see: an unclosed
      // fence swallowing the rest of the file, a table that never became a
      // table, a `#` heading printed literally.
      //
      // Whichever problem is still on MARKDOWN and has the most of it — read
      // from disk, because the batches keep converting whichever one is named.
      // The typed half is checked by the balanced-brackets test below, and both
      // halves have to render, so neither check stands in for the other.
      assert.ok(RICHEST_MARKDOWN, "no problem is still on a Markdown explanation")
      const problem = PROBLEMS.find((p) => p.id === RICHEST_MARKDOWN)
      await page.goto(`${server.base}${pageOf(problem)}`)
      await openExplanation(page)
      const out = await page.run(`
        // The PROSE elements only, each read live. Two things this had to
        // learn: a Python comment inside a code block legitimately starts
        // with '# ', so code is excluded rather than filtered; and innerText
        // on a DETACHED clone silently degrades to textContent — no layout,
        // so no line breaks — which made a per-line check see one long line.
        // Scoped to the explanation, not the page: the problem page's own
        // statement, constraints and hints are not markdown and never were.
        const root = document.getElementById('explanation');
        const prose = [...root.querySelectorAll(
          'h2, h3, p, li, td, th'
        )].map(el => el.innerText);
        // built from a string with NO backslashes on purpose: this whole
        // script is sent as a template literal, which eats them — '\\s' arrives
        // as 's' and '\\|' as '|', which turned an earlier version of this
        // pattern into one that matched every line
        const marker = new RegExp('^[ ]*(#{1,3}[ ]|[|][ ]*-{3})');
        return {
          headings: root.querySelectorAll('h2, h3').length,
          tables: root.querySelectorAll('table').length,
          codeBlocks: root.querySelectorAll('pre code').length,
          callouts: root.querySelectorAll('blockquote').length,
          // a literal marker on screen means a block was never parsed
          rawMarkers: prose.filter(line => marker.test(line)).slice(0, 5),
          // a backtick on screen means an inline span was not parsed — it is
          // how nested code inside bold ("**Time — \`O(n)\`.**") showed up
          backticks: prose.filter(line => line.includes('\`')).slice(0, 3),
          rawFence: prose.some(line => line.includes('\`\`\`')),
          // the merged page brought three constructs the parser had never
          // seen: an edit-me comment on every page, 2003 links and 879 folds
          rawComment: document.body.innerText.includes('<!--'),
          links: root.querySelectorAll('a[href]').length,
          // includes(), not a regex: this script is sent as a template literal
          // and backslashes do not survive it (it has bitten this file twice)
          rawBrackets: prose.filter(l => l.includes('](http')).length,
          scrollW: document.documentElement.scrollWidth,
          clientW: document.documentElement.clientWidth,
        };
      `)
      assert.ok(out.headings > 20, `only ${out.headings} section headings`)
      assert.ok(out.tables >= 4, `only ${out.tables} tables rendered`)
      assert.ok(out.codeBlocks >= 5, `only ${out.codeBlocks} code blocks`)
      assert.ok(out.callouts >= 4, `only ${out.callouts} callouts`)
      assert.deepEqual(
        out.rawMarkers,
        [],
        "markdown syntax reached the screen"
      )
      assert.equal(out.rawFence, false, "a code fence marker reached the screen")
      assert.equal(out.rawComment, false, "the edit-me banner reached the screen")
      // The hints fold is NOT checked here any more. It used to be emitted
      // into the generated page; the hints are an Accordion on the problem
      // page above, and emitting them twice was the duplication this change
      // removed.
      assert.ok(out.links >= 1, "no link rendered — markdown links reached the screen raw")
      assert.equal(out.rawBrackets, 0, "an unparsed markdown link is on screen")
      assert.deepEqual(
        out.backticks,
        [],
        "a backtick reached the screen — an inline code span was not parsed"
      )
      assert.equal(out.scrollW, out.clientW, "the problem page scrolls sideways")
      assert.deepEqual(page.errors(), [])
    })

    test("every problem has an explanation, and a started journey hides it", async () => {
      // The question that matters, and it got sharper when the two routes
      // merged: the explanation walks the whole climb and gives the ending
      // away, so a learner partway through a journey must not be shown it —
      // the same gate the arc and the ladder get. It used to be enough to hide
      // the LINK, because the content was on another route. It is on this page
      // now, so the section itself has to be absent.
      assert.equal(
        PROBLEMS.filter((p) => !EXPLAINED.has(p.id)).length,
        0,
        "a problem has no explanation — run npm run docs:learn"
      )

      const journeyed = PROBLEMS.find((p) =>
        JOURNEYS.some((j) => j.problemId === p.id && j.acts.length > 2)
      )
      const slug = JOURNEYS.find((j) => j.problemId === journeyed.id).slug

      // not started: the whole ladder shows, so the link is offered
      await page.goto(`${server.base}/#/`)
      await page.run(`localStorage.removeItem('dsa:unlocked:${slug}'); return 1`)
      await page.goto(`${server.base}/#/p/${journeyed.pattern}/${journeyed.id}`)
      // a BUTTON, not a link: the explanation opens in place rather than
      // navigating, so the door stopped being an anchor when the route merged
      const offered = await page.run(`
        return !![...document.querySelectorAll('a,button')]
          .find(e => /learn this problem/i.test(e.textContent || ''));
      `)

      // started and unfinished: the ladder is capped, so the link must go.
      // Written on another route first — the store caches per key, so a write
      // while the page is mounted is undone (CLAUDE.md).
      await page.goto(`${server.base}/#/`)
      await page.run(`localStorage.setItem('dsa:unlocked:${slug}', '2'); return 1`)
      await page.goto(`${server.base}/#/p/${journeyed.pattern}/${journeyed.id}`)
      const gated = await page.run(`
        return {
          link: !![...document.querySelectorAll('a,button')]
            .find(e => /learn this problem/i.test(e.textContent || '')),
          // the section itself, not just the door to it
          section: !!document.getElementById('explanation'),
          capped: /still ahead of you/.test(document.body.innerText),
        };
      `)
      await page.goto(`${server.base}/#/`)
      await page.run(`localStorage.removeItem('dsa:unlocked:${slug}'); return 1`)

      assert.ok(offered, `${journeyed.id}: no link on an unstarted journey`)
      assert.ok(gated.capped, `${journeyed.id}: unlocked=2 did not cap the ladder`)
      assert.equal(
        gated.link,
        false,
        `${journeyed.id}: the explanation was offered mid-journey — it gives the ending away`
      )
      assert.equal(
        gated.section,
        false,
        `${journeyed.id}: the door was hidden but the explanation rendered anyway`
      )
      assert.deepEqual(page.errors(), [])
    })

    // The route did not just change, it MERGED, and an id that used to be a
    // page is in every link written before the merge. A redirect that silently
    // 404s is the same as deleting them.
    test("#/learn/<id> lands on the problem page, at the explanation", async () => {
      const problem = PROBLEMS.find((p) => p.id === "balanced-brackets")
      await page.goto(`${server.base}/#/learn/${problem.id}`)
      // no click here on purpose: `?read=explanation` must open it by itself,
      // or every link written before the merge lands on a closed section
      await page.waitFor(EXPLANATION_READY, { tries: 60 })
      const out = await page.run(`
        const root = document.getElementById('explanation');
        return {
          hash: location.hash,
          // the typed document's own sections, rendered as sections rather
          // than round-tripped through a markdown string
          headings: [...root.querySelectorAll('h2')].map(h => h.innerText.trim()),
          tables: root.querySelectorAll('table').length,
          editors: document.querySelectorAll(
            'textarea[aria-label="the script, yours to change"]'
          ).length,
          // the problem page is still above it, exactly once
          statements: (document.body.innerText.match(
            /decide whether it is well-formed/g
          ) || []).length,
          rail: !!document.querySelector('nav[aria-label="contents"]'),
        };
      `)
      assert.match(
        out.hash,
        new RegExp(`/p/${problem.pattern}/${problem.id}`),
        `#/learn/ did not redirect — landed on ${out.hash}`
      )
      assert.ok(
        out.headings.some((h) => /failure modes/i.test(h)),
        `the typed document's sections are missing: ${out.headings.join(" | ")}`
      )
      assert.ok(out.tables >= 3, `only ${out.tables} tables in the explanation`)
      assert.ok(
        out.editors >= 1,
        "no block is editable — every one is the reader's to change"
      )
      assert.equal(
        out.statements,
        1,
        "the statement is on the page twice — the merge did not dedupe"
      )
      assert.ok(out.rail, "the contents rail did not render at 1440")
      assert.deepEqual(page.errors(), [])
    })

    test("390 px wide: an explanation does not scroll sideways", async () => {
      // Its tables are the widest things in the app; they must scroll inside
      // their own box rather than taking the page with them.
      await page.resize(390)
      const problem = PROBLEMS.find((p) => p.id === "balanced-tree")
      await page.goto(`${server.base}${pageOf(problem)}`)
      await openExplanation(page)
      const out = await page.run(`
        return {
          scrollW: document.documentElement.scrollWidth,
          clientW: document.documentElement.clientWidth,
          tables: document.querySelectorAll('table').length,
        };
      `)
      await page.resize(1440)
      assert.ok(out.tables >= 4, "the document did not render its tables")
      assert.equal(out.scrollW, out.clientW, "the page scrolls sideways at 390 px")
      assert.deepEqual(page.errors(), [])
    })

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
      assert.equal(
        out.scrollW,
        out.clientW,
        "the page scrolls sideways at 390 px"
      )
      assert.deepEqual(page.errors(), [])
    })

    // ---------- 10. a broken page beats a broken site (B96) ----------

    test("a route that names nothing renders not-found, not home", async () => {
      // Both shapes: a real pattern with a dead problem under it, and a root
      // that names nothing at all. Before B96 both rendered HOME — a working
      // page with no signal that the link had missed.
      for (const [hash, back] of [
        ["#/p/linked-list/no-such-problem", "#/p/linked-list"],
        ["#/nonsense", null],
        ["#/journey/no-such-journey", null],
      ]) {
        await page.goto(`${server.base}/${hash}`)
        const out = await page.run(`
          const main = document.querySelector('main');
          return {
            text: main.innerText,
            hrefs: [...main.querySelectorAll('a')].map(a => a.getAttribute('href')),
            // home's own furniture, to prove we are NOT looking at it
            home: /day streak|learning journeys/i.test(main.innerText),
          };
        `)
        assert.match(
          out.text,
          /nothing at that address/i,
          `${hash} did not render the not-found view`
        )
        // it names what was not found, verbatim, so the reader can see which
        // part of the path is wrong
        assert.ok(
          out.text.includes(hash),
          `${hash}: the not-found view did not name the route (${out.text.slice(0, 80)})`
        )
        assert.equal(out.home, false, `${hash} still rendered home`)
        assert.ok(out.hrefs.includes("#/"), `${hash}: no link home`)
        if (back)
          assert.ok(
            out.hrefs.includes(back),
            `${hash}: no link back to ${back}`
          )
        assert.deepEqual(page.errors(), [], `${hash} logged console errors`)
      }
    })

    test("a render error costs one page, not the site", async () => {
      // The honest trigger, with no test-only code in the app: a CORRUPT
      // stored record, which is the fault B96 was filed for. `prefs` is read
      // by problem-list as a string it lowercases, so a number there throws
      // during render — and only in that view (the rail and the palette read
      // other keys). Written on home and then navigated to for real, because
      // the store caches per key (CLAUDE.md).
      await page.goto(`${server.base}/#/`)
      await page.run(
        `localStorage.setItem('dsa:prefs', JSON.stringify({ filterQuery: 42 })); return 1`
      )
      await page.goto(`${server.base}/#/p/arrays-hashing`)
      const out = await page.run(`
        const main = document.querySelector('main');
        return {
          text: main.innerText,
          message: (main.querySelector('pre') || {}).innerText || '',
          hrefs: [...main.querySelectorAll('a')].map(a => a.getAttribute('href')),
          alerts: document.querySelectorAll('[role=alert]').length,
          // the shell has to survive: this is the whole point
          sidebar: document.querySelectorAll('[data-slot=sidebar]').length,
          rail: [...document.querySelectorAll('[data-slot=sidebar] a')].length,
        };
      `)
      // clean up before asserting, so a failure does not poison the run
      await page.goto(`${server.base}/#/`)
      await page.run(`localStorage.removeItem('dsa:prefs'); return 1`)

      assert.match(
        out.text,
        /this page hit an error/i,
        "the boundary did not catch — the page is blank or the throw stopped happening"
      )
      assert.ok(out.alerts >= 1, "the fallback is not announced as an alert")
      assert.match(
        out.message,
        /toLowerCase/,
        `the error message was not shown (got "${out.message}")`
      )
      assert.ok(out.hrefs.includes("#/"), "the fallback offers no way out")
      assert.equal(out.sidebar > 0, true, "the shell went down with the page")
      assert.ok(out.rail > 5, `the rail lost its links (${out.rail} left)`)

      // and the very next route is fine again: the boundary resets on the
      // route change rather than latching
      await page.goto(`${server.base}/#/p/arrays-hashing`)
      const after = await page.run(`return document.querySelector('main').innerText`)
      assert.ok(
        !/this page hit an error/i.test(after),
        "the boundary latched — a good route still shows the fallback"
      )
      assert.deepEqual(page.errors(), [], "the recovered page logged errors")
    })

    // ---------- a thumb can hit every control ----------

    test("on a phone, no visible control is under the touch floor", async () => {
      // DESIGN.md asks for 44px on touch and nothing was checking it, so four
      // controls had drifted to 28: the catalogue row link (the most-tapped
      // thing in the app, whose <a> filled only the text and not the row's own
      // padding), the difficulty filters, the sidebar trigger — the ONLY way to
      // reach navigation when the sidebar is a sheet — and the palette's
      // trigger, the only search a phone has. Measured at 360, the narrowest
      // width this app claims to support.
      const small = await launch({ width: 360, height: 900 })
      try {
        for (const path of ["#/", "#/p/arrays-hashing", "#/p/prefix-sums/subarray-sum-k"]) {
          await small.page.goto(`${server.base}/${path}`)
          await small.page.run(`return new Promise(r => setTimeout(() => r(1), 400))`)
          const under = await small.page.run(`
            const out = []
            for (const el of document.querySelectorAll('main a, main button')) {
              const r = el.getBoundingClientRect()
              if (r.width === 0 || r.height === 0 || r.height >= 40) continue
              const cs = getComputedStyle(el)
              // an inline link inside a run of prose is exempt (WCAG 2.5.8):
              // padding one to 44px would wreck the paragraph's leading
              const par = el.parentElement
              if (cs.display.startsWith('inline') && par &&
                  par.textContent.trim() !== el.textContent.trim()) continue
              const label = el.getAttribute('aria-label') || el.textContent.trim().slice(0, 30)
              out.push(Math.round(r.height) + 'px ' + el.tagName + ' "' + label + '"')
            }
            return [...new Set(out)]
          `)
          // The copy button is the one exemption, on purpose: it floats over a
          // code block the reader can now EDIT, so growing its hit box to 44
          // would swallow taps meant to place a cursor on the first line. At
          // 28x28 it still clears the WCAG 2.5.8 AA floor of 24x24, which the
          // 44 here exceeds for primary controls.
          const real = under.filter((d) => !/Copy code|Copied|Copying is blocked/.test(d))
          assert.deepEqual(real, [], `${path}: ${real.join(" · ")}`)
        }
      } finally {
        await small.stop()
      }
    })
  }
)
