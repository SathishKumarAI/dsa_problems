// Solved-problem tracking. One key in lib/store ("solved"), a JSON array of ids.
import { useMemo } from "react"
import { K, updateStored, useStored } from "./store"

export function toggleSolved(id: string) {
  updateStored<string[]>(K.solved, [], (ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
}

export function useSolved(): Set<string> {
  const ids = useStored<string[]>(K.solved, [])
  return useMemo(() => new Set(ids), [ids])
}
