// What the reading list actually measures, at three widths.
//
// "Two columns" and "smaller" are claims about rendered CSS, not about the
// markup, so they are read off the running page: how many columns each grid
// resolves to, how tall the whole section is, and the font size of every text
// node inside it.
import { launch, startServer } from "../test/browser.mjs"

const server = await startServer()
const browser = await launch()
const page = browser.page

const PROBE = `
  const sec = [...document.querySelectorAll('main section')]
    .find(s => /read further/i.test(s.innerText.slice(0, 40)));
  if (!sec) return { found: false };
  const grids = [...sec.querySelectorAll('ul')].map(ul => ({
    cols: getComputedStyle(ul).gridTemplateColumns.split(' ').length,
    rows: ul.children.length,
  }));
  const sizes = {};
  for (const el of sec.querySelectorAll('*')) {
    const own = [...el.childNodes].filter(n => n.nodeType === 3)
      .map(n => n.textContent.trim()).join('');
    if (!own) continue;
    const px = Math.round(parseFloat(getComputedStyle(el).fontSize));
    sizes[px] = (sizes[px] || 0) + 1;
  }
  const links = [...sec.querySelectorAll('a')];
  return {
    found: true,
    height: Math.round(sec.getBoundingClientRect().height),
    width: Math.round(sec.getBoundingClientRect().width),
    grids,
    sizes,
    links: links.length,
    // the underline is on the TITLE, not on the row: measuring the outer
    // span reported 0 underlined links on a list where every title is
    underlined: links.filter(a =>
      [a, ...a.querySelectorAll('span')].some(el =>
        getComputedStyle(el).textDecorationLine.includes('underline'))
    ).length,
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  };
`

for (const [w, h] of [
  [390, 844],
  [820, 1180],
  [1440, 1000],
]) {
  await page.resize(w, h)
  await page.goto(`${server.base}/#/p/arrays-hashing/pair-sum`)
  await page.run(
    `document.querySelector('main section:last-of-type')?.scrollIntoView(); return new Promise(r => setTimeout(() => r(1), 300));`
  )
  const out = await page.run(PROBE)
  console.log(`\n── ${w}×${h} ─────────────────────────`)
  console.log(JSON.stringify(out, null, 1))
}

console.log("\nconsole errors:", JSON.stringify(page.errors()))
await page.close()
await server.stop()
