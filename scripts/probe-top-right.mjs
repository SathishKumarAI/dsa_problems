// What is in the top-right corner, and does pressing it do anything?
//
// A bug report says "a hamburger top right shows nothing when I click it".
// This walks the app at three widths and reports every control in the top
// strip: its label, its size, whether it is on screen, and what pressing it
// changes in the DOM. Read the page, not the diff.
import { launch, startServer } from "../test/browser.mjs"

const server = await startServer()
const browser = await launch()
const page = browser.page

const PROBE = `
  const strip = [...document.querySelectorAll('button, a[role=button], [aria-haspopup]')]
    .map(el => {
      const r = el.getBoundingClientRect();
      return { el, r };
    })
    .filter(({ r }) => r.top < 90 && r.width > 0 && r.height > 0)
    .sort((a, b) => a.r.left - b.r.left)
    .map(({ el, r }) => ({
      label: (el.getAttribute('aria-label') || el.innerText || el.className).slice(0, 48).replace(/\\s+/g, ' ').trim(),
      x: Math.round(r.left), y: Math.round(r.top),
      w: Math.round(r.width), h: Math.round(r.height),
      fromRight: Math.round(innerWidth - r.right),
      slot: el.dataset.slot || el.dataset.sidebar || '',
    }));
  return { width: innerWidth, strip };
`

const ROUTES = process.env.PROBE_ROUTES
  ? process.env.PROBE_ROUTES.split(",")
  : ["#/p/arrays-hashing/contains-duplicate"]
const SIZES = process.env.PROBE_SIZES
  ? process.env.PROBE_SIZES.split(",").map((s) => s.split("x").map(Number))
  : [
      [390, 844],
      [820, 1180],
      [1440, 1000],
    ]
for (const [w, h] of SIZES) {
  for (const route of ROUTES) {
    await page.resize(w, h)
    await page.goto(`${server.base}/${route}`)
    const out = await page.run(PROBE)
    console.log(`\n── ${w}×${h} ──────────────────────────────`)
    for (const c of out.strip) {
      console.log(
        `  ${String(c.x).padStart(5)}px  ${c.w}×${c.h}  ${String(c.fromRight).padStart(5)} from right  ${c.slot.padEnd(16)} ${c.label}`
      )
    }
    // press the RIGHTMOST control in the strip and see what changes
    const pressed = await page.run(`
    const tops = [...document.querySelectorAll('button')]
      .map(el => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.top < 90 && r.width > 0);
    if (!tops.length) return { pressed: null };
    const target = tops.sort((a, b) => b.r.right - a.r.right)[0];
    const before = document.querySelectorAll('[role=dialog], [data-slot=dialog-content], [data-slot=sheet-content]').length;
    target.el.click();
    await new Promise(r => setTimeout(r, 600));
    const after = [...document.querySelectorAll('[role=dialog], [data-slot=dialog-content], [data-slot=sheet-content]')];
    return {
      pressed: (target.el.getAttribute('aria-label') || target.el.innerText || '(no label)').slice(0, 40),
      before,
      after: after.length,
      visible: after.filter(d => d.getBoundingClientRect().height > 0).length,
      text: after.map(d => d.innerText.slice(0, 60).replace(/\\s+/g, ' ')),
    };
  `)
    console.log("  pressed rightmost:", JSON.stringify(pressed))
  }
}

console.log("\nconsole errors:", JSON.stringify(page.errors()))
await page.close()
await server.stop()
