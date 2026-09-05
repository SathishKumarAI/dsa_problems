// A browser, driven from node, with no dependencies: it starts `vite preview`
// on a free port, launches the system Chrome headless with its own profile,
// and talks CDP over node's built-in WebSocket. Owns process lifecycle and
// the four calls the tests need (goto, eval, storage, errors). Owns no
// assertions — those live in the .test.mjs files.
//
// Why not jsdom: the things that break on this page are layout, scroll
// containers and FLIP — none of which jsdom has. Why not Playwright: one
// more 100 MB dependency for a browser this machine already has.

import { spawn } from "node:child_process"
import { existsSync, mkdtempSync, rmSync } from "node:fs"
import { createServer } from "node:net"
import { tmpdir } from "node:os"
import { join } from "node:path"

const CHROME_CANDIDATES =
  process.platform === "win32"
    ? [
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
        "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
        join(
          process.env.LOCALAPPDATA ?? "",
          "Google/Chrome/Application/chrome.exe"
        ),
      ]
    : process.platform === "darwin"
      ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
      : [
          "/usr/bin/google-chrome",
          "/usr/bin/chromium",
          "/usr/bin/chromium-browser",
          "/snap/bin/chromium",
        ]

export const chromePath = () =>
  (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)
    ? process.env.CHROME_PATH
    : CHROME_CANDIDATES.find((p) => p && existsSync(p))) ?? null

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function until(fn, { tries = 60, gap = 500, what = "condition" } = {}) {
  for (let i = 0; i < tries; i++) {
    try {
      if (await fn()) return true
    } catch {
      // not ready yet
    }
    await wait(gap)
  }
  throw new Error(`timed out waiting for ${what}`)
}

// ---------- the server under test ----------

/** an OS-assigned free port, so a stale run never collides with this one */
const freePort = () =>
  new Promise((resolve, reject) => {
    const s = createServer()
    s.on("error", reject)
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address()
      s.close(() => resolve(port))
    })
  })

/** kill the whole tree — on Windows child.kill() leaves the node grandchild
 *  holding the port, which is how a "port in use" ghost outlives a test run */
function killTree(child) {
  if (!child.pid) return
  if (process.platform === "win32")
    spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    })
  else
    try {
      process.kill(-child.pid, "SIGKILL")
    } catch {
      child.kill("SIGKILL")
    }
}

export async function startServer({ port } = {}) {
  const p = port ?? (await freePort())
  const child = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["vite", "preview", "--port", String(p), "--strictPort"],
    {
      stdio: "ignore",
      shell: process.platform === "win32",
      detached: process.platform !== "win32",
    }
  )
  const base = `http://localhost:${p}`
  await until(async () => (await fetch(`${base}/api/journeys`)).ok, {
    tries: 40,
    what: `vite preview on ${p}`,
  })
  return { base, stop: () => killTree(child) }
}

// ---------- the browser ----------

export async function launch({ port, width = 1440, height = 1000 } = {}) {
  const exe = chromePath()
  if (!exe) throw new Error("no Chrome found (set CHROME_PATH)")
  port = port ?? (await freePort())
  const profile = mkdtempSync(join(tmpdir(), "dsa-ui-"))
  const child = spawn(
    exe,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      `--window-size=${width},${height}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  )
  await until(async () => (await fetch(`http://localhost:${port}/json/version`)).ok, {
    what: "chrome devtools port",
  })

  const page = await newPage(port, width, height)
  return {
    page,
    async stop() {
      await page.close()
      killTree(child)
      try {
        rmSync(profile, { recursive: true, force: true })
      } catch {
        // Windows may still hold a handle; the temp dir is disposable
      }
    },
  }
}

async function newPage(port, width, height) {
  const target = await (
    await fetch(`http://localhost:${port}/json/new?about:blank`, {
      method: "PUT",
    })
  ).json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r) => (ws.onopen = r))

  let id = 0
  const pending = new Map()
  let errors = []
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
      return
    }
    if (
      msg.method === "Runtime.exceptionThrown" ||
      (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") ||
      (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error")
    )
      errors.push(describe(msg))
  }
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const i = ++id
      pending.set(i, resolve)
      ws.send(JSON.stringify({ id: i, method, params }))
    })

  await send("Runtime.enable")
  await send("Log.enable")
  await send("Page.enable")
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 700,
  })

  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })
    const ex = r.result?.exceptionDetails
    if (ex) throw new Error(ex.exception?.description ?? JSON.stringify(ex))
    return r.result?.result?.value
  }

  return {
    /** navigate and wait for React to have painted something.
     *  A cache-busting query before the hash forces a real document load —
     *  changing only the hash would leave the previous React tree mounted,
     *  and several deep-link behaviours only run on mount. */
    async goto(url, { settle = 900 } = {}) {
      errors = []
      const [path, hash = ""] = url.split("#")
      const sep = path.includes("?") ? "&" : "?"
      await send("Page.navigate", {
        url: `${path}${sep}_=${Date.now()}${hash ? "#" + hash : ""}`,
      })
      await wait(settle)
      await until(() => evaluate("!!document.querySelector('main')?.innerText"), {
        tries: 20,
        gap: 200,
        what: `content at ${url}`,
      })
    },
    /** run an async body in the page; `return` its value */
    run: (body) => evaluate(`(async () => { ${body} })()`),
    /** poll an expression until it is truthy — beats a fixed sleep, which is
     *  where flake comes from */
    waitFor: (expression, opts = {}) =>
      until(() => evaluate(expression), {
        tries: 25,
        gap: 200,
        what: expression.slice(0, 60),
        ...opts,
      }),
    eval: evaluate,
    async resize(w, h = 1000) {
      await send("Emulation.setDeviceMetricsOverride", {
        width: w,
        height: h,
        deviceScaleFactor: 1,
        mobile: w < 700,
      })
    },
    errors: () => errors,
    close: async () => {
      await send("Page.close")
      ws.close()
    },
  }
}

const describe = (msg) => {
  if (msg.method === "Runtime.exceptionThrown")
    return (
      msg.params.exceptionDetails?.exception?.description ??
      msg.params.exceptionDetails?.text ??
      "exception"
    )
  if (msg.method === "Log.entryAdded") return msg.params.entry.text
  return (msg.params.args ?? [])
    .map((a) => a.value ?? a.description ?? a.type)
    .join(" ")
}
