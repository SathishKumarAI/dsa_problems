// Generic timeline player over a precomputed frame array. Owns: position,
// play/pause timer, per-frame hold. Owns no pedagogy — the journey hook
// wraps it to intercept predictions; the algorithms page uses it bare.

import { useCallback, useEffect, useState } from "react"

export interface Playable {
  hold?: number
}

// slider 1..100 -> ~2s..0.1s per step; 50 ≈ 1.1s, slow enough to read
export const delayFor = (speed: number) => Math.max(100, 2100 - speed * 20)

export interface PlayerOptions {
  // called before advancing to `next`; return false to refuse (pauses playback)
  beforeStep?: (next: number, playing: boolean) => boolean
  // position to open the FIRST loaded timeline at (deep links); later timelines open at 0
  initialPos?: number
}

export function usePlayer<F extends Playable>(
  frames: F[],
  delay: number,
  { beforeStep, initialPos = 0 }: PlayerOptions = {}
) {
  const [pos, setPos] = useState(0)
  const [playing, setPlaying] = useState(false)
  const last = Math.max(0, frames.length - 1)
  const atEnd = pos >= last

  // a new timeline rewinds and pauses — adjusted during render, not in an effect
  const [prevFrames, setPrevFrames] = useState<F[] | null>(null)
  if (frames !== prevFrames) {
    const first = !prevFrames || prevFrames.length === 0
    setPrevFrames(frames)
    setPos(first ? Math.max(0, Math.min(initialPos, last)) : 0)
    setPlaying(false)
  }

  const seek = useCallback(
    (i: number) => setPos(Math.max(0, Math.min(i, last))),
    [last]
  )

  // returns false when a guard (prediction) refused the advance
  const step = useCallback(() => {
    if (pos >= last) return false
    if (beforeStep && !beforeStep(pos + 1, playing)) {
      setPlaying(false)
      return false
    }
    setPos(pos + 1)
    return true
  }, [pos, last, beforeStep, playing])

  useEffect(() => {
    if (!playing) return
    if (pos >= last) {
      const t = setTimeout(() => setPlaying(false), 0)
      return () => clearTimeout(t)
    }
    const hold = frames[pos]?.hold ?? 1
    const t = setTimeout(step, delay * hold)
    return () => clearTimeout(t)
  }, [playing, pos, last, delay, frames, step])

  const play = useCallback(() => {
    if (pos >= last) setPos(0)
    setPlaying(true)
  }, [pos, last])
  const pause = useCallback(() => setPlaying(false), [])
  const toggle = useCallback(
    () => (playing ? pause() : play()),
    [playing, pause, play]
  )
  const back = useCallback(() => {
    setPlaying(false)
    setPos((p) => Math.max(0, p - 1))
  }, [])
  const reset = useCallback(() => {
    setPlaying(false)
    setPos(0)
  }, [])

  return {
    pos,
    last,
    atEnd,
    playing,
    seek,
    step,
    play,
    pause,
    toggle,
    back,
    reset,
    setPlaying,
    setPos,
  }
}
