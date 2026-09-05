import { useSyncExternalStore } from "react"

const MOBILE_BREAKPOINT = 768
const query = () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

export function useIsMobile() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = query()
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    () => query().matches,
    () => false
  )
}
