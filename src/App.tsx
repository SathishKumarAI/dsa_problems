// Wiring only: hash route → view, inside the layout shell. No content, no
// rendering logic. Routes are documented in lib/route.ts.
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
// `@/data` is the barrel that builds PROBLEMS from all ten pattern folders, so
// importing it here put every statement, hint ladder and code block in the
// shell. The route only needs to know the id EXISTS; the record arrives with
// the problem page's own chunk.
import { PATTERNS } from "@/data/patterns"
import { cardOf } from "@/data/manifest"
// the MANIFEST answers "is this a route"; the journey itself arrives with the
// route's own chunk. Asking `@/engine` this question cost 567.7 KB in the shell.
import { cardBySlug } from "@/engine/manifest"
import { Suspense, lazy, useEffect } from "react"
import { navigate, useRoute } from "@/lib/route"
import { visited } from "@/lib/recent"
import { openDialog } from "@/lib/dialogs"
import { cn } from "@/lib/utils"
import { CircleHelpIcon, LoaderCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppDialogs } from "./components/app-dialogs"
import { ErrorBoundary } from "./components/error-boundary"
import { AppSidebar } from "./components/app-sidebar"
import { GlobalKeys } from "./components/global-keys"
import { CommandPalette, SearchTrigger } from "@/features/search/palette"

// the engine-heavy features load on first visit, not on the content pages (B22 / F1)
const JourneyPage = lazy(() =>
  import("@/features/journey/journey-page").then((m) => ({
    default: m.JourneyPage,
  }))
)
const AlgorithmsPage = lazy(() =>
  import("@/features/algorithms/algorithms-page").then((m) => ({
    default: m.AlgorithmsPage,
  }))
)
/**
 * `#/learn/<id>` -> the problem page, scrolled to the explanation.
 *
 * A component rather than a call at the match site: navigating during render
 * is a side effect, and React may render a route more than once. The effect
 * runs after commit, and `location.hash` is the app's router — assigning it is
 * the navigation.
 *
 * The scroll is separate from the route change because the section is at the
 * foot of a page that has not rendered yet, and its content is FETCHED. So the
 * anchor rides along in the hash and `problem-detail` honours it once the
 * explanation is on screen.
 */
function LearnRedirect({ id, pattern }: { id: string; pattern: string }) {
  useEffect(() => {
    navigate(`/p/${pattern}/${id}`, { read: "explanation" })
  }, [id, pattern])
  return <Loading />
}

/** a retired destination, kept working. Same reason as `LearnRedirect`: the id
 *  is in every link written before the merge, and in the repo's own documents. */
function Redirect({ to }: { to: string }) {
  useEffect(() => {
    navigate(to)
  }, [to])
  return <Loading />
}

const Loading = () => (
  <div className="flex items-center justify-center gap-2 py-16 text-ui text-muted-foreground">
    <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
    loading…
  </div>
)
import { FlashcardsView } from "./components/flashcards-view"
import { HomeView } from "./components/home-view"
import { NotFound } from "./components/not-found"
// LAZY, because it is the other holder of `@/engine`: the problem page draws
// the journey's own stage and caps its ladder by the ledger, so it needs the
// real journey — and a route may fetch what it needs. Eager, it put every
// journey in the shell.
const ProblemDetail = lazy(() =>
  import("./components/problem-detail").then((m) => ({
    default: m.ProblemDetail,
  }))
)
import { ProblemList } from "./components/problem-list"
// lazy too: it carries every pattern's playbook prose
import { SqlView } from "./components/sql-view"

function View() {
  const { parts, path, query } = useRoute()
  const [root, a, b] = parts
  // home is the empty path and nothing else now: every other fallthrough is a
  // route that named something which does not exist
  if (parts.length === 0) return <HomeView />
  if (root === "journey") {
    const card = a ? cardBySlug(a) : undefined
    if (card) return <JourneyPage key={card.slug} slug={card.slug} />
  }
  if (root === "algorithms") return <AlgorithmsPage />
  // `#/learn/<id>` was the explanation's own route until it became a section
  // of the problem page. Kept as a REDIRECT rather than dropped: the id is in
  // every link written before the merge, in the repo's own documents, and in
  // whatever anyone bookmarked. It lands on the problem page and jumps to the
  // explanation; a `learn/` id that names no problem falls through to 404.
  if (root === "learn" && a) {
    const card = cardOf(a)
    if (card) return <LearnRedirect id={card.id} pattern={card.pattern} />
  }
  // `#/resources` was a SECOND page about a pattern — its playbook, its
  // references and a list of its problems, beside a pattern page carrying the
  // name, the references and a filterable list of the same problems. One noun,
  // one page: the playbook moved onto `#/p/<pattern>` and this redirects, with
  // `?pattern=` honoured so every link written against it still lands.
  if (root === "resources") {
    const named = query.get("pattern")
    const target = PATTERNS.find((p) => p.id === named)
    return <Redirect to={target ? `/p/${target.id}` : "/"} />
  }
  if (root === "sql") return <SqlView />
  if (root === "flashcards") return <FlashcardsView />
  if (root === "p") {
    const pattern = PATTERNS.find((p) => p.id === a)
    const card = b ? cardOf(b) : undefined
    if (pattern && card)
      return (
        <ProblemDetail
          key={card.id}
          problemId={card.id}
          pattern={pattern}
          onBack={() => navigate(`/p/${pattern.id}`)}
        />
      )
    if (pattern && !b) return <ProblemList pattern={pattern} />
    // the pattern is real and the problem is not: the list it came from is a
    // better second option than home
    if (pattern) return <NotFound path={path} back={`/p/${pattern.id}`} />
  }
  // Everything that named nothing. It used to render HOME — a working page,
  // no signal, and a reader who believes the link worked (B96).
  return <NotFound path={path} />
}

/**
 * A route, as a human would say it.
 *
 * Manifest lookups only. `@/data` is the barrel that builds PROBLEMS from all
 * ten pattern folders, and naming a page must not be the thing that drags
 * every statement and hint ladder into the shell.
 */
function labelOf(parts: string[]): string | null {
  // NULL MEANS "DO NOT REMEMBER THIS". A route whose subject does not resolve
  // is the one that renders NotFound, and a back control offering a dead
  // address is worse than no back control at all — it read "a problem" and led
  // to "There is nothing at that address", which I walked into by mistyping a
  // slug while driving the page. The trail carries only places that exist.
  if (parts[0] === "p") return cardOf(parts[2] ?? "")?.title ?? null
  if (parts[0] === "journey") return cardBySlug(parts[1] ?? "")?.title ?? null
  if (parts[0] === "pattern")
    return PATTERNS.find((x) => x.id === parts[1])?.name ?? null
  if (!parts[0]) return "Home"
  return parts[0].replace(/-/g, " ")
}

export default function App() {
  const { parts, path } = useRoute()
  const view = parts[0] === "p" ? parts[1] : (parts[0] ?? "home")
  const wide = parts[0] === "journey" || parts[0] === "algorithms"
  // the journey and the visualizer are panel layouts (≥ lg): the inset is
  // viewport-high and the page divides that height between its own panels
  const panels = parts[0] === "journey" || parts[0] === "algorithms"

  // THE LEFT SIDEBAR DOES NOT AUTO-HIDE, and that is a correction.
  //
  // It did. Scrolling down collapsed it to the icon rail, which widened the
  // inset, which re-centred the reading column — measured on the pilot: the
  // text moved 32px sideways and rewrapped every time the chrome toggled. No
  // rule inside the inset can undo that, because what moved is the inset's own
  // left edge. A feature meant to help someone concentrate was picking up the
  // line they were reading and putting it somewhere else.
  //
  // The contents rail still goes, because it sits to the RIGHT of the text and
  // the column is anchored so its leaving moves nothing (`problem-detail.tsx`).
  // The orient bar still goes, because it is sticky and reflows nothing at all.
  // Between them that is the clutter; the sidebar was the part that cost more
  // than it bought.

  // Where you just were. Every back link in this app points UP a hierarchy,
  // which is the right answer only when you arrived from above — see
  // `lib/recent.ts`. Recorded here because this is the one place that sees
  // every route, and labelled from the manifests rather than the records so
  // the shell still pulls no problem content.
  useEffect(() => {
    const label = labelOf(parts)
    if (label) visited(path, label)
  }, [path, parts])
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar view={view} />
        <GlobalKeys />
        <AppDialogs />
        <CommandPalette />
        {/* The journey page bounds its own height so the transport can be
            pinned to the foot of a column that scrolls INSIDE itself. That
            only worked at lg, so below it SidebarInset computed min-height
            auto, grew to 1202px against a 788px viewport, and every
            descendant height became content-driven — the transport rode the
            page instead of sitting still. Bounded at every width now. */}
        {/* `min-w-0` is the shell's one guard against sideways scroll, and it
            belongs on the INSET — the flex item in the sidebar row — not on
            the page inside it. A flex item's default `min-width: auto` is its
            content's MIN-CONTENT, so that floor propagates up from a single
            row all the way to the document. Measured on home at 1440: one
            16px chevron added to a journey row pushed the column's
            min-content past `max-w-page`, which clamped at 1120, which made
            the inset 1184 against the 1174 available — scrollWidth 1440
            against clientWidth 1430. Every page sets its own `max-w-*` and
            scrolls its own wide boxes, so the inset never needs to be as wide
            as its widest child. */}
        <SidebarInset
          className={cn("min-w-0", panels && "h-svh overflow-hidden")}
        >
          {/* A PHONE SHELL, and nothing above `md`. On a phone there is no
              rail, so this bar is the only way to reach navigation and it
              stays. Above `md` the page starts at the top of the window: the
              search control moved into the sidebar, which is where navigation
              already lives, and a band of chrome over every page bought
              nothing once it was the only thing in it.

              It used to be two things: this bar below `md`, and a `fixed
              top-3 right-4` Search button above it. A fixed button is OUT of
              flow, so nothing reserved its corner and it painted over
              whatever the page put there. Measured on
              `#/p/arrays-hashing/contains-duplicate`: it covered the `solved`
              checkbox by 25 x 5 px at 1280 and 69 x 24 px from 1100 down —
              the control was unclickable under it. `ContentsRail` had already
              met the same button and worked around it with `top-16`.

              A bar in FLOW cannot overlap anything: the page starts beneath
              it. The panel pages (journey, visualizer) own their own top-right
              corner, so above `md` they keep the keyboard-only palette and
              this bar is hidden — exactly what the fixed button did for
              them. */}
          <div className="sticky top-0 z-20 flex items-center gap-2 border-b bg-background/70 px-4 py-2 backdrop-blur-md md:hidden">
            <SidebarTrigger />
            <span className="font-mono text-ui">Patternsmith</span>
            <SearchTrigger className="ml-auto" />
            <Button
              size="icon-sm"
              variant="ghost"
              className="size-11 text-muted-foreground"
              aria-label="how to use this app"
              onClick={() => openDialog("help")}
            >
              <CircleHelpIcon />
            </Button>
          </div>
          {/* `key={path}` is the route-change moment. `main` already carries
              the one authored arrival animation (index.css, `surface-in`), but
              it never replayed: the element is mounted once and every route
              swapped its children underneath it. Keying on the PATH — not on
              the query — replays it when the page actually changes and leaves
              a deep link that only moves `?act=` alone. */}
          <main
            key={path}
            className={cn(
              wide ? "flex-1 px-4 py-6 md:px-6" : "flex-1 px-4 py-8 md:px-8",
              panels && "min-h-0 overflow-hidden py-4 lg:py-4"
            )}
          >
            {/* The boundary is INSIDE `main`, so the `key={path}` above is
                also its reset: a route change remounts it and the caught
                error goes with it. Outside Suspense, so a chunk that fails
                to load is caught as well. */}
            <ErrorBoundary>
              <Suspense fallback={<Loading />}>
                <View />
              </Suspense>
            </ErrorBoundary>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
