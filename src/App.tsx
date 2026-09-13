// Wiring only: hash route → view, inside the layout shell. No content, no
// rendering logic. Routes are documented in lib/route.ts.
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PATTERNS, PROBLEMS } from "@/data"
import { journeyBySlug } from "@/engine"
import { Suspense, lazy } from "react"
import { navigate, useRoute } from "@/lib/route"
import { openDialog } from "@/lib/dialogs"
import { cn } from "@/lib/utils"
import { CircleHelpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppDialogs } from "./components/app-dialogs"
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
// the learn pages are fetched per problem, so the reader itself is lazy too
const LearnPageView = lazy(() =>
  import("@/components/learn-page-view").then((m) => ({
    default: m.LearnPageView,
  }))
)
const Loading = () => (
  <div className="py-16 text-center text-ui text-muted-foreground">
    loading…
  </div>
)
import { FlashcardsView } from "./components/flashcards-view"
import { HomeView } from "./components/home-view"
import { ProblemDetail } from "./components/problem-detail"
import { ProblemList } from "./components/problem-list"
import { SqlView } from "./components/sql-view"

function View() {
  const { parts } = useRoute()
  const [root, a, b] = parts
  if (root === "journey") {
    const j = a ? journeyBySlug(a) : undefined
    if (j) return <JourneyPage key={j.slug} journey={j} />
  }
  if (root === "algorithms") return <AlgorithmsPage />
  if (root === "learn" && a) return <LearnPageView key={a} id={a} />
  if (root === "sql") return <SqlView />
  if (root === "flashcards") return <FlashcardsView />
  if (root === "p") {
    const pattern = PATTERNS.find((p) => p.id === a)
    const problem = b ? PROBLEMS.find((p) => p.id === b) : undefined
    if (pattern && problem)
      return (
        <ProblemDetail
          problem={problem}
          pattern={pattern}
          onBack={() => navigate(`/p/${pattern.id}`)}
        />
      )
    if (pattern)
      return (
        <ProblemList
          pattern={pattern}
          onOpen={(id) => navigate(`/p/${pattern.id}/${id}`)}
        />
      )
  }
  return (
    <HomeView
      onNavigate={(v) =>
        navigate(
          v === "home"
            ? "/"
            : v === "sql" || v === "flashcards"
              ? `/${v}`
              : `/p/${v}`
        )
      }
    />
  )
}

export default function App() {
  const { parts } = useRoute()
  const view = parts[0] === "p" ? parts[1] : (parts[0] ?? "home")
  const wide = parts[0] === "journey" || parts[0] === "algorithms"
  // the journey and the visualizer are panel layouts (≥ lg): the inset is
  // viewport-high and the page divides that height between its own panels
  const panels = parts[0] === "journey" || parts[0] === "algorithms"
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
        <SidebarInset className={cn(panels && "h-svh overflow-hidden")}>
          {/* On a phone there is no rail, so this bar IS the shell: it stays
              put and lets the page pass under it, blurred, the way every other
              floating surface here does. It used to scroll away with the
              content, which left a 127-problem list with no way back. */}
          <div className="sticky top-0 z-20 flex items-center gap-2 border-b bg-background/70 px-4 py-2 backdrop-blur-md md:hidden">
            <SidebarTrigger />
            <span className="font-mono text-ui">dsa.patterns</span>
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
          {/* The panel pages already own their top-right corner (measured:
              the journey's meta row and the visualizer's h1 sit there), so on
              those the palette is keyboard-only. Everywhere else it gets a
              visible control. */}
          {!panels && (
            <SearchTrigger className="fixed top-3 right-4 z-20 hidden md:inline-flex" />
          )}
          <main
            className={cn(
              wide ? "flex-1 px-4 py-6 md:px-6" : "flex-1 px-4 py-8 md:px-8",
              panels && "min-h-0 overflow-hidden py-4 lg:py-4"
            )}
          >
            <Suspense fallback={<Loading />}>
              <View />
            </Suspense>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
