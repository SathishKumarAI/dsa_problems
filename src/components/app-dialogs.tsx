// The three app-level dialogs — help ("how to use this"), keyboard shortcuts,
// settings — mounted once in App, opened from lib/dialogs.ts. Owns their
// content and the settings form; owns no preference logic (lib/store.ts).
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { openDialog, useDialog } from "@/lib/dialogs"
import { SHORTCUTS } from "@/lib/shortcuts"
import {
  DEFAULT_PREFS,
  exportProgress,
  importProgress,
  resetProgress,
  setPref,
  usePrefs,
} from "@/lib/store"
import type { DialogName } from "@/lib/dialogs"
import { useTheme } from "@/components/theme-provider"
import type { Prefs } from "@/lib/store"

function Frame({
  name,
  title,
  description,
  children,
}: {
  name: DialogName
  title: string
  description: string
  children: React.ReactNode
}) {
  const open = useDialog() === name
  return (
    <Dialog open={open} onOpenChange={(o) => !o && openDialog(null)}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-2 text-meta tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
  )
}

// ---------- help ----------

export function HelpDialog() {
  return (
    <Frame
      name="help"
      title="How to use Patternsmith"
      description="Earn the insight, then the name. Two minutes to read; everything else is on the page."
    >
      <div className="flex max-w-measure flex-col gap-3 text-body">
        <H>the idea</H>
        <p>
          Every <b>journey</b> builds one problem all the way down. You start
          with the <i>need</i> — a story that makes the problem exist — then
          earn each approach by finding the previous one's weakness. Nothing is
          named before you have felt why it is needed; the pattern's name
          arrives at the reveal.
        </p>
        <H>reading a problem (act 1)</H>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            <b>How to read this problem</b> — reread the ask, formalize it as
            input → output, bring three inputs before any code.
          </li>
          <li>
            <b>Bring three inputs</b> — the corner cases. <i>load this input</i>{" "}
            puts one on the stage; every approach explains the case when it hits
            it (teal callout under the narration).
          </li>
        </ul>
        <H>the stage</H>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            <b>Play / step / scrub</b> with the transport or <Kbd>space</Kbd>{" "}
            <Kbd>←</Kbd> <Kbd>→</Kbd> <Kbd>r</Kbd>. Speed is a slider and is
            remembered.
          </li>
          <li>
            <b>Predict</b> cards pause playback before a key move and ask you to
            call it. <b>Quiz</b> cards gate the next act. Both give XP.
          </li>
          <li>
            <b>Presets</b> and the custom input box change the data; the chart
            on the right counts each approach's steps on that input.
          </li>
          <li>
            <b>Code It</b> (Two Sum) runs your own function in a worker, then{" "}
            <i>Watch my code</i> turns its array accesses into the animation.
          </li>
        </ul>
        <H>the layout</H>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            Sidebar, stage and reading column each scroll on their own on wide
            screens.
          </li>
          <li>
            Close either rail from the button at its foot, or press <Kbd>f</Kbd>{" "}
            to close both. A closed rail <b>peeks open on hover</b> and closes
            again when you leave.
          </li>
          <li>
            The reading column holds the approach's idea, what it is built from,
            the code in four languages with the live line lit, takeaways, the
            steps chart and the legend.
          </li>
        </ul>
        <H>progress</H>
        <p className="text-muted-foreground">
          Acts earned, quizzes passed, XP and your day streak live in this
          browser only. Settings (bottom of the sidebar) can copy them out as
          JSON and paste them back on another machine.
        </p>
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openDialog("shortcuts")}
          >
            keyboard shortcuts
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openDialog("settings")}
          >
            settings
          </Button>
        </div>
      </div>
    </Frame>
  )
}

// ---------- shortcuts ----------

export function ShortcutsDialog() {
  return (
    <Frame
      name="shortcuts"
      title="Keyboard shortcuts"
      description="Keys are ignored while an input, select or textarea has focus."
    >
      <div className="flex flex-col gap-4">
        {SHORTCUTS.map((g) => (
          <div key={g.scope}>
            <H>{g.scope}</H>
            <table className="mt-1 w-full text-body">
              <tbody>
                {g.items.map((s) => (
                  <tr key={s.does} className="border-t border-border/60">
                    <td className="w-44 py-1.5 pr-3 align-top whitespace-nowrap">
                      {s.keys.map((k) => (
                        <Kbd key={k} className="mr-1">
                          {k}
                        </Kbd>
                      ))}
                    </td>
                    <td className="py-1.5 text-muted-foreground">{s.does}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </Frame>
  )
}

// ---------- settings ----------

const FIELD =
  "rounded-md border bg-background px-2 py-1.5 text-ui focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"

// Four values you want to compare read better as segments than as a dropdown,
// and a dropdown here rendered in the browser's own chrome (UX audit U4).
function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  disabled,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  label: string
  disabled?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex flex-wrap gap-0.5 rounded-lg border bg-background p-0.5",
        disabled && "opacity-50"
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-2.5 py-1 text-ui transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            o.value === value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Row({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="grid items-center gap-x-4 gap-y-1 sm:grid-cols-[10rem_1fr]">
      <span className="text-ui">
        {label}
        {hint && (
          <span className="block text-meta text-muted-foreground">{hint}</span>
        )}
      </span>
      {children}
    </label>
  )
}

export function SettingsDialog() {
  const prefs = usePrefs()
  const { theme, setTheme } = useTheme()
  const [pasted, setPasted] = useState("")
  const [msg, setMsg] = useState("")
  const [armed, setArmed] = useState(false)

  const copy = async () => {
    const json = JSON.stringify(exportProgress(), null, 2)
    try {
      await navigator.clipboard.writeText(json)
      setMsg(`copied ${json.length} characters`)
    } catch {
      setPasted(json)
      setMsg(
        "clipboard blocked — the JSON is in the box below, copy it from there"
      )
    }
  }
  const paste = () => {
    try {
      const n = importProgress(JSON.parse(pasted) as Record<string, unknown>)
      setMsg(`imported ${n} keys`)
      setPasted("")
    } catch {
      setMsg("that is not the JSON this app exported")
    }
  }
  const reset = () => {
    if (!armed) {
      setArmed(true)
      setTimeout(() => setArmed(false), 4000)
      return
    }
    resetProgress()
    setArmed(false)
    setMsg("progress erased; preferences kept")
  }

  return (
    <Frame
      name="settings"
      title="Settings"
      description="Preferences are saved in this browser. Everything here has a sensible default."
    >
      <div className="flex flex-col gap-4">
        {/* The theme machinery has been in `theme-provider.tsx` since the
            shell was built — dark, light, system, a `d` shortcut and cross-tab
            sync — and nothing on screen ever offered it. Same shape of bug as
            `brief` and `difficulty` (B40, V10): stored, working, unrendered. */}
        <Row label="theme" hint="system follows your device; d toggles">
          <Segmented
            label="theme"
            value={theme}
            onChange={(v) => setTheme(v as "dark" | "light" | "system")}
            options={[
              { value: "dark", label: "dark" },
              { value: "light", label: "light" },
              { value: "system", label: "system" },
            ]}
          />
        </Row>
        <Row label="playback speed" hint={`${prefs.speed} / 100`}>
          <input
            type="range"
            min={1}
            max={100}
            value={prefs.speed}
            onChange={(e) => setPref("speed", Number(e.target.value))}
            aria-label="playback speed"
            className="h-1.5 w-full cursor-pointer accent-primary"
          />
        </Row>
        <Row
          label="reduce motion"
          hint="stop every transition and animation, whatever your system is set to"
        >
          <input
            type="checkbox"
            checked={prefs.reduceMotion}
            onChange={(e) => setPref("reduceMotion", e.target.checked)}
            aria-label="reduce motion"
            className="size-4 cursor-pointer justify-self-start accent-primary"
          />
        </Row>
        <Row
          label="motion"
          hint={
            prefs.reduceMotion
              ? "off while reduce motion is on"
              : "how far chips travel when they morph"
          }
        >
          <Segmented
            label="motion"
            disabled={prefs.reduceMotion}
            value={prefs.motion}
            onChange={(v) => setPref("motion", v)}
            options={[
              { value: "calm", label: "calm" },
              { value: "normal", label: "normal" },
              { value: "cinematic", label: "cinematic" },
              { value: "off", label: "off" },
            ]}
          />
        </Row>
        <Row label="code tab" hint="shared by every act and the visualizer">
          <Segmented
            label="code tab"
            value={prefs.codeTab}
            onChange={(v) => setPref("codeTab", v)}
            options={[
              { value: "pseudo", label: "pseudocode" },
              { value: "python", label: "Python 3" },
              { value: "java", label: "Java" },
              { value: "cpp", label: "C++" },
            ]}
          />
        </Row>
        <Row label="reading column" hint="on the journey page">
          <label className="flex items-center gap-2 text-ui">
            <Checkbox
              checked={prefs.reading}
              onCheckedChange={(v) => setPref("reading", v === true)}
            />
            open (closed = icon rail, peeks on hover)
          </label>
        </Row>
        <div>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() =>
              (Object.keys(DEFAULT_PREFS) as (keyof Prefs)[]).forEach((k) =>
                setPref(k, DEFAULT_PREFS[k])
              )
            }
          >
            reset preferences to defaults
          </Button>
        </div>

        <H>progress — this browser only</H>
        <p className="text-body text-muted-foreground">
          Acts earned, quizzes passed, XP, streak days, challenge scorecards.
          Copy the JSON here and paste it on another machine to carry it over.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={copy}>
            copy progress JSON
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={paste}
            disabled={!pasted.trim()}
          >
            import pasted JSON
          </Button>
          <Button
            size="sm"
            variant={armed ? "destructive" : "ghost"}
            onClick={reset}
          >
            {armed ? "click again to erase all progress" : "erase all progress"}
          </Button>
        </div>
        <textarea
          className={`${FIELD} min-h-24 font-mono text-meta`}
          placeholder="paste exported JSON here"
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          aria-label="progress JSON"
        />
        {msg && (
          <p className="text-ui text-muted-foreground" role="status">
            {msg}
          </p>
        )}
      </div>
    </Frame>
  )
}

export function AppDialogs() {
  return (
    <>
      <HelpDialog />
      <ShortcutsDialog />
      <SettingsDialog />
    </>
  )
}
