import { launch, startServer } from "./test/browser.mjs"
import { writeFileSync } from "node:fs"
const server = await startServer()
const { page } = await launch({ width: 1440, height: 1000 })
await page.goto(`${server.base}/#/learn/cycle-detect`)
await new Promise(r => setTimeout(r, 1200))
const out = await page.run(`
  const main = document.querySelector('main');
  return {
    text: main.innerText,
    headings: [...main.querySelectorAll('h1,h2,h3')].map(h => h.tagName + ' ' + h.innerText.trim()),
    codeBlocks: [...main.querySelectorAll('pre')].map(p => p.innerText.trim()),
    tables: [...main.querySelectorAll('table')].map(t => t.innerText.trim()),
    links: [...main.querySelectorAll('a')].map(a => a.getAttribute('href') + ' :: ' + a.innerText.trim()),
  };
`)
writeFileSync(process.argv[2], JSON.stringify(out, null, 1))
console.log("headings", out.headings.length, "| code", out.codeBlocks.length, "| tables", out.tables.length, "| links", out.links.length, "| chars", out.text.length)
process.exit(0)
