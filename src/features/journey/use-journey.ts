// The journey state machine. Owns every policy the page enforces:
//   - frames come from the API (api.run) for the current act + data
//   - predictions pause playback BEFORE the frame renders; scrubbing skips them
//   - finishing an act (last frame, or a green code challenge for gate:"pass")
//     opens the quiz gate, then the reveal button; only that click advances
//     `unlocked:<slug>` in the store
//   - hints appear after 45s without progress or 2+ wrong quiz answers
//   - XP: +5 quiz, +10 unlock, +25 first green challenge
//   - ?act=&step= mirrors the current moment for deep links
// Owns no rendering. journey-page.tsx is the only consumer.

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { api } from "@/api/client"
import type { Data } from "@/api/client"
import type {
  AnyJourney,
  BaseFrame,
  Predict,
  StageModel,
  Trace,
} from "@/engine"
import { replaceQuery, useRoute } from "@/lib/route"
import {
  K,
  awardXP,
  getStored,
  recordActivity,
  setPref,
  setStored,
  updateStored,
  usePrefs,
  useStored,
} from "@/lib/store"
import type { ChartRow } from "./steps-chart"
import { delayFor, usePlayer } from "./use-player"

const IDLE_MS = 45000
// how long a destroyed ledger is held before restart becomes final (B19)
const UNDO_MS = 5000

export function useJourney(journey: AnyJourney) {
  const route = useRoute()
  const prefs = usePrefs()
  const delay = delayFor(prefs.speed)
  const slug = journey.slug

  const unlocked = Math.min(
    Math.max(useStored<number>(K.unlocked(slug), 1), 1),
    journey.acts.length
  )
  const xp = useStored<number>(K.xp, 0)

  // ---- data: a preset request is state; the effect fetches it ----
  const [presetReq, setPresetReq] = useState({
    key: journey.defaultPreset,
    nonce: 0,
  })
  const [data, setData] = useState<Data | null>(null)
  const [info, setInfo] = useState("")
  const [warning, setWarning] = useState<string | null>(null)
  const [trace, setTraceState] = useState<Trace | null>(null)

  const applyData = useCallback(
    async (d: Data, banner = "") => {
      const v = await api.classify(slug, d)
      setData(d)
      setTraceState(null)
      setWarning(v.ok ? null : (v.warning ?? "contract broken"))
      setInfo(v.ok ? banner : "")
    },
    [slug]
  )

  useEffect(() => {
    recordActivity()
  }, [])

  useEffect(() => {
    let live = true
    api.preset(slug, presetReq.key).then((r) => {
      if (live) applyData(r.data, r.info ?? "")
    })
    return () => {
      live = false
    }
  }, [slug, presetReq, applyData])

  const applyPreset = useCallback(
    (key: string) => setPresetReq((p) => ({ key, nonce: p.nonce + 1 })),
    []
  )

  const applyCustom = useCallback(
    async (text: string, params: Record<string, string>) => {
      try {
        const r = await api.parse(slug, text, params)
        await applyData(r.data)
        return true
      } catch {
        return false
      }
    },
    [slug, applyData]
  )

  // ---- act + frames ----
  const linked = route.query.get("act")
  const linkedIndex = journey.acts.findIndex((a) => a.key === linked)
  const [actKey, setActKey] = useState(
    linkedIndex > -1 && linkedIndex < unlocked ? linked! : journey.acts[0].key
  )
  const [linkedStep] = useState(() => Number(route.query.get("step")) || 0)
  // A deep link pasted while this journey is already open changes only the
  // hash, so nothing remounts. Follow it here (render-time adjust, not an
  // effect) — but only into an act the learner has earned, and never over
  // the ?act= this hook writes back itself.
  const [prevLinked, setPrevLinked] = useState(linked)
  if (linked !== prevLinked) {
    setPrevLinked(linked)
    if (
      linked &&
      linkedIndex > -1 &&
      linkedIndex < unlocked &&
      linked !== actKey
    )
      setActKey(linked)
  }
  const actIndex = journey.acts.findIndex((a) => a.key === actKey)
  const act = journey.acts[actIndex]
  const [frames, setFrames] = useState<BaseFrame[]>([])
  const asked = useRef(new Set<number>()) // prediction positions already asked on this timeline
  const [done, setDone] = useState<Set<string>>(() => new Set())
  const [revealed, setRevealed] = useState<string | null>(null)
  const [chart, setChart] = useState<ChartRow[]>([])
  const [quizPassed, setQuizPassed] = useState(false)
  const [challengePassed, setChallengePassed] = useState(false)
  const [adaptive, setAdaptive] = useState<{
    label: string
    preset: string
  } | null>(null)
  // B19. Restart is one click and it re-locks every act. A confirm dialog in
  // front of it would tax the 99 clicks that meant it to protect the one that
  // did not, so the click goes through and the ledger it destroyed is held for
  // five seconds instead.
  const [undo, setUndo] = useState<{
    unlocked: number
    quizzes: string[]
    act: string
  } | null>(null)
  const [hintTier, setHintTier] = useState(0)
  const [hintsOffered, setHintsOffered] = useState(false)
  const [quizWrongs, setQuizWrongs] = useState(0)
  const pageWrongs = useRef(0)

  useEffect(() => {
    if (!data) return
    let live = true
    api.run(slug, actKey, data, trace).then(({ frames: f }) => {
      if (!live) return
      asked.current = new Set()
      // frame 0 is a synthetic "press play"; inherit noChips so a need-first story opens empty
      setFrames([
        {
          line: -1,
          noChips: f[0]?.noChips,
          note: "press play — or step through at your own pace",
        },
        ...f,
      ])
    })
    return () => {
      live = false
    }
  }, [slug, actKey, data, trace])

  useEffect(() => {
    if (!data) return
    let live = true
    api.chart(slug, data, unlocked).then((rows) => live && setChart(rows))
    return () => {
      live = false
    }
  }, [slug, data, unlocked])

  // ---- prediction gate ----
  const [pending, setPending] = useState<{
    predict: Predict
    wasPlaying: boolean
  } | null>(null)
  const guard = useCallback(
    (next: number, playing: boolean) => {
      const nf = frames[next]
      if (!nf?.predict || asked.current.has(next)) return true
      setPending({ predict: nf.predict, wasPlaying: playing })
      return false
    },
    [frames]
  )
  const player = usePlayer(frames, delay, {
    beforeStep: guard,
    initialPos: linkedStep,
  })

  const resolvePredict = useCallback(() => {
    if (!pending) return
    asked.current.add(player.pos + 1)
    setPending(null)
    player.seek(player.pos + 1)
    if (pending.wasPlaying) player.setPlaying(true)
  }, [pending, player])

  // ---- hints: idle timer resets on every shown frame ----
  useEffect(() => {
    const t = setTimeout(() => setHintsOffered(true), IDLE_MS)
    return () => clearTimeout(t)
  }, [player.pos, actKey])

  // ---- the undo window closes on its own ----
  useEffect(() => {
    if (!undo) return
    const t = setTimeout(() => setUndo(null), UNDO_MS)
    return () => clearTimeout(t)
  }, [undo])

  // ---- act switching ----
  const setAct = useCallback((key: string) => {
    setActKey(key)
    setPending(null)
    setHintTier(0)
    setHintsOffered(false)
    setQuizWrongs(0)
    setQuizPassed(false)
    setChallengePassed(false)
  }, [])

  // ---- finish → quiz → reveal ----
  const gated = act.gate === "pass" && !challengePassed
  const finished = frames.length > 1 && player.atEnd && !gated
  const next = journey.acts[actIndex + 1]

  // an act counts as done the moment its last frame shows — adjusted during render
  if (finished && !done.has(actKey)) setDone(new Set(done).add(actKey))

  const quizPassedRecorded = useStored<string[]>(K.quizzes(slug), []).includes(
    actKey
  )
  const showQuiz =
    finished &&
    !!next &&
    actIndex + 1 >= unlocked &&
    !!act.quiz?.length &&
    !quizPassed &&
    !quizPassedRecorded

  const nextButton = useMemo(() => {
    if (!finished || !next) return null
    if (actIndex + 1 < unlocked)
      return {
        label: `Next: ${next.name} ▸`,
        reveal: false,
        onClick: () => setAct(next.key),
      }
    if (showQuiz) return null
    return {
      label:
        act.nextLabel ??
        (actIndex === 0
          ? "I understand the problem — try solving it ▸"
          : "I get it — what's the weakness? ▸"),
      reveal: true,
      onClick: () => {
        setStored(K.unlocked(slug), actIndex + 2)
        awardXP(10)
        setAct(next.key)
        setRevealed(next.key)
        setTimeout(() => setRevealed(null), 1400)
      },
    }
  }, [
    finished,
    next,
    actIndex,
    unlocked,
    showQuiz,
    act.nextLabel,
    slug,
    setAct,
  ])

  const quiz = showQuiz
    ? {
        quiz: act.quiz!,
        onWrong: () => {
          pageWrongs.current++
          setQuizWrongs(quizWrongs + 1)
          if (quizWrongs + 1 >= 2) setHintsOffered(true) // struggling — offer the ladder
        },
        onPass: () => {
          updateStored<string[]>(K.quizzes(slug), [], (q) =>
            q.includes(actKey) ? q : [...q, actKey]
          )
          awardXP(5)
          setQuizPassed(true)
        },
      }
    : null

  const onChallengePass = useCallback(
    (attempts: number) => {
      if (challengePassed) return
      setChallengePassed(true)
      awardXP(25)
      // adaptive difficulty: flawless quizzes + first-try green earns the harder input, offered, never forced
      if (
        pageWrongs.current === 0 &&
        attempts === 1 &&
        journey.harder &&
        journey.presets[journey.harder.preset]
      )
        setAdaptive({
          label: journey.harder.label,
          preset: journey.harder.preset,
        })
    },
    [challengePassed, journey]
  )

  // ---- deep links: mirror act/step ----
  useEffect(() => {
    const t = setTimeout(
      () => replaceQuery({ act: actKey, step: String(player.pos) }),
      300
    )
    return () => clearTimeout(t)
  }, [actKey, player.pos])

  // ---- keyboard ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      // A key pressed while a control has focus belongs to that control, not
      // to the player: space on a focused trace row or button would otherwise
      // fire the button AND toggle playback, and arrows would drive the stage
      // while the learner is tabbing through the reading column.
      if (
        ["INPUT", "SELECT", "TEXTAREA", "BUTTON", "A"].includes(t.tagName) ||
        t.isContentEditable
      )
        return
      if (e.key === " ") {
        e.preventDefault()
        player.toggle()
      } else if (e.key === "ArrowRight") {
        player.pause()
        player.step()
      } else if (e.key === "ArrowLeft") {
        setPending(null)
        player.back()
      } else if (e.key === "r") {
        setPending(null)
        player.reset()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [player])

  const frame = frames[player.pos]
  const model: StageModel | null = useMemo(
    () => (frame && data ? act.view(frame, data) : null),
    [frame, data, act]
  )

  return {
    journey,
    act,
    actKey,
    actIndex,
    unlocked,
    done,
    revealed,
    xp,
    data,
    info,
    warning,
    presetKey: presetReq.key,
    applyPreset,
    applyCustom,
    newFromPreset: () => applyPreset(presetReq.key),
    frames,
    frame,
    model,
    delay,
    player,
    seek: (i: number) => {
      setPending(null)
      player.pause()
      player.seek(i)
    },
    predict: pending
      ? { predict: pending.predict, resolve: resolvePredict }
      : null,
    quiz,
    nextButton,
    hints:
      hintsOffered && act.hints?.length
        ? {
            hints: act.hints,
            tier: hintTier,
            more: () => setHintTier((t) => Math.min(t + 1, act.hints!.length)),
          }
        : null,
    chart,
    trace,
    setTrace: (t: Trace) => setTraceState(t),
    onChallengePass,
    adaptive: adaptive
      ? {
          label: adaptive.label,
          go: () => {
            applyPreset(adaptive.preset)
            setAdaptive(null)
          },
        }
      : null,
    setAct,
    speed: prefs.speed,
    setSpeed: (v: number) => setPref("speed", v),
    restart: () => {
      setUndo({
        unlocked: getStored<number>(K.unlocked(slug), 1),
        quizzes: getStored<string[]>(K.quizzes(slug), []),
        act: actKey,
      })
      setStored(K.unlocked(slug), 1)
      setStored(K.quizzes(slug), [])
      setDone(new Set())
      setAct(journey.acts[0].key)
    },
    /** null once the window has closed; the banner reads this to decide
     *  whether it is on screen at all */
    undoRestart: undo
      ? () => {
          setStored(K.unlocked(slug), undo.unlocked)
          setStored(K.quizzes(slug), undo.quizzes)
          setDone(new Set(undo.quizzes))
          setAct(undo.act)
          setUndo(null)
        }
      : null,
    dismissUndo: () => setUndo(null),
    solvedBefore: getStored<number>(K.unlocked(slug), 1) >= journey.acts.length,
  }
}

export type JourneyController = ReturnType<typeof useJourney>
