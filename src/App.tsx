// Wiring only: view state + layout shell. No content, no rendering logic.
import { useState } from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PATTERNS, PROBLEMS } from "@/data"
import { AppSidebar } from "./components/app-sidebar"
import { FlashcardsView } from "./components/flashcards-view"
import { HomeView } from "./components/home-view"
import { ProblemDetail } from "./components/problem-detail"
import { ProblemList } from "./components/problem-list"
import { SqlView } from "./components/sql-view"

export default function App() {
  const [view, setView] = useState("home") // "home" | pattern id
  const [problemId, setProblemId] = useState<string | null>(null)

  const pattern = PATTERNS.find((p) => p.id === view)
  const problem = problemId ? PROBLEMS.find((p) => p.id === problemId) : null

  const navigate = (v: string) => {
    setView(v)
    setProblemId(null)
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar view={view} onNavigate={navigate} />
        <SidebarInset>
          <div className="flex items-center gap-2 border-b px-4 py-2 md:hidden">
            <SidebarTrigger />
            <span className="font-mono text-sm">dsa.patterns</span>
          </div>
          <main className="flex-1 px-4 py-8 md:px-8">
            {problem && pattern ? (
              <ProblemDetail
                problem={problem}
                pattern={pattern}
                onBack={() => setProblemId(null)}
              />
            ) : pattern ? (
              <ProblemList pattern={pattern} onOpen={setProblemId} />
            ) : view === "sql" ? (
              <SqlView />
            ) : view === "flashcards" ? (
              <FlashcardsView />
            ) : (
              <HomeView onNavigate={navigate} />
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
