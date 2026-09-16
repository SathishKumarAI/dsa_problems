// The journey's stage, embedded on a practice-set problem page (backlog B1).
// One source of truth for "how this problem works": the same generators, the
// same chip grammar, the same panels — no hand-written frames to drift.
//
// It respects the ledger. A learner midway through the journey sees only the
// approaches they have EARNED, with a nudge back to the journey; someone who
// never opened it (or already finished) sees all of them. Owns the picking and
// the small layout; owns no content.
//
// IT STEPS BETWEEN APPROACHES. It used to draw exactly one — the best earned,
// or the optimal — and that is the ladder's argument thrown away: the whole
// point of "each rung answers the one below it" is watching the one below it
// run out of road. `next approach` walks the same list the ladder does, in the
// same order, and it opens at the FOOT of that list so the climb runs forwards
// (see watchable.ts — opening at the top left `next` disabled on arrival).
//
// The cap is not a rendering detail. The list offered here is the EARNED list,
// never the full one, because an approach name is exactly what progressive
// disclosure withholds — offering "Ask a set" as a next step would name the
// answer to a learner still on the brute force.

import { useEffect, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, RouteIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/api/client"
import type { Data } from "@/api/client"
import type { AnyJourney, BaseFrame, StageModel } from "@/engine"
import { href } from "@/lib/route"
import { K, setPref, usePrefs, useStored } from "@/lib/store"
import { Transport } from "./controls"
import { Stage } from "./panels"
import { delayFor, usePlayer } from "./use-player"
// the disclosure rule, in a .ts so a node test can hold it — see watchable.ts
import { watchable } from "./watchable"

export function MiniPlayer({ journey }: { journey: AnyJourney }) {
  const unlocked = Math.max(useStored<number>(K.unlocked(journey.slug), 1), 1)
  const { acts, opens, capped } = watchable(journey, unlocked)
  // Which approach is on the stage. `null` means "whatever this opens on", so
  // earning an act moves the default forward instead of pinning the learner to
  // a rung they chose once — and a key that is no longer offered (the ledger
  // was reset) falls back the same way, in render, with no effect to sync.
  const [picked, setPicked] = useState<string | null>(null)
  const act = acts.find((a) => a.key === picked) ?? opens
  const at = acts.indexOf(act)
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
        <b className="font-semibold">{act.name}</b>
        <span className="font-mono text-meta text-muted-foreground">
          {act.complexity}
        </span>
        {acts.length > 1 && (
          <span className="flex items-center gap-0.5">
            <Button
              size="icon-sm"
              variant="ghost"
              className="size-11 lg:size-8"
              aria-label="previous approach"
              disabled={at <= 0}
              onClick={() => setPicked(acts[at - 1].key)}
            >
              <ChevronLeftIcon />
            </Button>
            <span className="font-mono text-meta text-dim tabular-nums">
              {at + 1}/{acts.length}
            </span>
            <Button
              size="icon-sm"
              variant="ghost"
              className="size-11 lg:size-8"
              aria-label="next approach"
              disabled={at >= acts.length - 1}
              onClick={() => setPicked(acts[at + 1].key)}
            >
              <ChevronRightIcon />
            </Button>
          </span>
        )}
        <a
          href={href(`/journey/${journey.slug}`)}
          className="ml-auto inline-flex min-h-11 items-center gap-1 text-meta text-chart-1 underline-offset-2 hover:underline lg:min-h-7"
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
          className="mx-auto min-h-12 max-w-measure border-t px-4 pt-3 text-center text-ui leading-relaxed"
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

      {capped ? (
        <p className="max-w-measure prose-set text-body text-muted-foreground">
          {acts.length > 1
            ? `These are the ${acts.length} approaches you have earned so far. The journey has more — each one opens when the previous one runs out of road.`
            : "This is the best approach you have earned so far. The journey has more — each one opens when the previous one runs out of road."}
        </p>
      ) : (
        acts.length > 1 && (
          <p className="max-w-measure prose-set text-body text-muted-foreground">
            Step through the approaches in build order and watch each one run
            out of road — that argument is what the ladder below is written on.
          </p>
        )
      )}
    </div>
  )
}
