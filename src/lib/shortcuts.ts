// The keyboard map, in one place: the `?` dialog renders it and the handlers
// (use-journey.ts, algorithms-page.tsx, components/global-keys.tsx) must
// agree with it. Add a key → add a row here in the same commit.

export interface Shortcut {
  keys: string[]
  does: string
}

export const SHORTCUTS: { scope: string; items: Shortcut[] }[] = [
  {
    scope: "everywhere",
    items: [
      { keys: ["?"], does: "this list" },
      {
        keys: ["Ctrl K", "⌘ K"],
        does: "search every problem and journey — type, ↑ ↓ to move, ↵ to open (works while you are typing in a filter)",
      },
      {
        keys: ["f"],
        does: "focus — close the sidebar and the reading column, or open both again",
      },
      { keys: ["Esc"], does: "close a dialog" },
      {
        keys: ["d"],
        does: "dark / light — same switch as the one in settings",
      },
    ],
  },
  {
    scope: "journey and algorithm visualizer",
    items: [
      { keys: ["space"], does: "play / pause" },
      {
        keys: ["→"],
        does: "one step forward (a prediction ahead opens the predict card first)",
      },
      { keys: ["←"], does: "one step back (skips a pending prediction)" },
      { keys: ["r"], does: "restart the act from step 0" },
    ],
  },
  {
    scope: "mouse",
    items: [
      {
        keys: ["hover a closed rail"],
        does: "peeks it open over the stage; it closes when you leave",
      },
      { keys: ["drag the timeline"], does: "scrub; pauses playback" },
    ],
  },
]
