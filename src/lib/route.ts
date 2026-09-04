// Hash router, no dependency. Owns: parsing `#/path?query`, navigation,
// and the one hook views use. Routes are matched in App.tsx.
//
//   #/                         home
//   #/p/<pattern>              problem list
//   #/p/<pattern>/<problem>    problem page (static walkthrough)
//   #/journey/<slug>?act=&step= learning journey (deep-linkable moment)
//   #/algorithms?algo=quick    sorting / search / graph visualizer
//   #/sql   #/flashcards

import { useSyncExternalStore } from "react"

export interface Route {
  path: string
  parts: string[]
  query: URLSearchParams
}

function parse(): Route {
  const raw = location.hash.replace(/^#/, "") || "/"
  const [path, q = ""] = raw.split("?")
  return {
    path,
    parts: path.split("/").filter(Boolean),
    query: new URLSearchParams(q),
  }
}

let current =
  typeof location !== "undefined"
    ? parse()
    : { path: "/", parts: [], query: new URLSearchParams() }
const listeners = new Set<() => void>()

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    current = parse()
    listeners.forEach((l) => l())
  })
}

export function navigate(path: string, query?: Record<string, string>) {
  const q = query ? "?" + new URLSearchParams(query).toString() : ""
  location.hash = path + q
}

// mirror state into the URL without a history entry or a re-render
export function replaceQuery(query: Record<string, string>) {
  const q = new URLSearchParams(query).toString()
  history.replaceState(null, "", `#${current.path}${q ? "?" + q : ""}`)
  current = parse()
}

export const useRoute = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current
  )

export const href = (path: string) => "#" + path
