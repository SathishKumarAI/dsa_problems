// The journey's stage, embedded on a practice-set problem page (backlog B1).
// One source of truth for "how this problem works": the same generators, the
// same chip grammar, the same panels — no hand-written frames to drift.
//
// It respects the ledger. A learner midway through the journey sees only the
// best approach they have EARNED, with a nudge back to the journey; someone
// who never opened it (or already finished) sees the optimal act. Owns the
// picking and the small layout; owns no content.

import { useEffect, useState } from "react"
import { RouteIcon } from "lucide-react"
import { api } from "@/api/client"
import type { Data } from "@/api/client"
import type { AnyJourney, BaseFrame, StageModel } from "@/engine"
import { href } from "@/lib/route"
import { K, setPref, usePrefs, useStored } from "@/lib/store"
import { Transport } from "./controls"
import { Stage } from "./panels"
import { delayFor, usePlayer } from "./use-player"

/** the best act this learner is allowed to watch, and whether more is hidden */
function pickAct(journey: AnyJourney, unlocked: number) {
  // never the story act (no algorithm), never the challenge or the recap
  const shown = journey.acts.filter(
    (a) => a.chart !== false && a.key !== journey.acts[0].key
  )
  const finished = unlocked >= journey.acts.length
  const earned = shown.filter((a) => journey.acts.indexOf(a) < unlocked)
  const act =
    finished || earned.length === 0
      ? shown[shown.length - 1]
      : earned[earned.length - 1]
  return {
    act,
    capped: !finished && earned.length > 0 && earned.length < shown.length,
  }
}

export function MiniPlayer({ journey }: { journey: AnyJourney }) {
  const unlocked = Math.max(useStored<number>(K.unlocked(journey.slug), 1), 1)
  const { act, capped } = pickAct(journey, unlocked)
  const { speed } = usePrefs()
  const delay = delayFor(speed)
  const data = journey.sample as Data
  const [frames, setFrames] = useState<BaseFrame[]>([])

  useEffect(() => {
    let live = true
    api.run(journey.slug, act.key, data).then(({ frames: f }) => {
      if (live) setFrames(f)
    })
    return () => {
      live = false
    }
  }, [journey.slug, act.key, data])

  const player = usePlayer(frames, delay)
  const frame = frames[player.pos]
  const model: StageModel | null = frame ? act.view(frame, data) : null

  return (
    <div className="flex flex-col gap-3 pt-2">
      <div className="flex flex-wrap items-baseline gap-x-3 text-ui">
        <b>{act.name}</b>
        <span className="font-mono text-meta text-muted-foreground">
          {act.complexity}
        </span>
        <a
          href={href(`/journey/${journey.slug}`)}
          className="ml-auto inline-flex min-h-11 items-center gap-1 text-meta text-chart-1 underline-offset-2 lg:min-h-0 hover:underline"
        >
          <RouteIcon className="size-3.5" />
          {capped ? "continue the journey" : "build it up in the journey"}
        </a>
      </div>

      <div className="flex flex-col gap-4 overflow-hidden rounded-xl border bg-card px-2 py-5">
        {model ? (
          <Stage model={model} stepDelay={delay} />
        ) : (
          <div className="py-8 text-center text-meta text-muted-foreground">
            loading…
          </div>
        )}
        <p
          className="mx-auto min-h-12 max-w-[35em] border-t px-4 pt-3 text-center text-ui leading-relaxed"
          aria-live="polite"
        >
          <span className="mr-1 text-primary">›</span>
          {frame?.note ?? ""}
        </p>
        <div className="px-3">
          <Transport
            pos={player.pos}
            last={player.last}
            playing={player.playing}
            onToggle={player.toggle}
            onStep={() => {
              player.pause()
              player.step()
            }}
            onBack={player.back}
            onReset={player.reset}
            onSeek={(i) => {
              player.pause()
              player.seek(i)
            }}
            speed={speed}
            onSpeed={(v) => setPref("speed", v)}
          />
        </div>
      </div>

      {capped && (
        <p className="max-w-[35em] text-ui text-muted-foreground">
          This is the best approach you have earned so far. The journey has more
          — each one opens when the previous one runs out of road.
        </p>
      )}
    </div>
  )
}
