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
import { AlgorithmsPage } from "@/features/algorithms/algorithms-page"
import { JourneyPage } from "@/features/journey/journey-page"
import { navigate, useRoute } from "@/lib/route"
import { AppSidebar } from "./components/app-sidebar"
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
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar view={view} />
        <SidebarInset>
          <div className="flex items-center gap-2 border-b px-4 py-2 md:hidden">
            <SidebarTrigger />
            <span className="font-mono text-sm">dsa.patterns</span>
          </div>
          <main
            className={
              wide ? "flex-1 px-4 py-6 md:px-6" : "flex-1 px-4 py-8 md:px-8"
            }
          >
            <View />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
