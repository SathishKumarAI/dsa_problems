// Navigation: home + one entry per pattern, with per-pattern solved counts.
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { PATTERNS, problemsByPattern } from "@/data"
import { useSolved } from "@/lib/progress"

interface Props {
  view: string // "home" | pattern id
  onNavigate: (view: string) => void
}

export function AppSidebar({ view, onNavigate }: Props) {
  const solved = useSolved()

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <button className="text-left" onClick={() => onNavigate("home")}>
          <div className="font-mono text-sm font-semibold text-sidebar-primary">
            dsa.patterns
          </div>
          <div className="text-xs text-muted-foreground">interview prep, by pattern</div>
        </button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Patterns</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PATTERNS.map((p) => {
                const problems = problemsByPattern(p.id)
                const done = problems.filter((pr) => solved.has(pr.id)).length
                return (
                  <SidebarMenuItem key={p.id}>
                    <SidebarMenuButton
                      isActive={view === p.id}
                      onClick={() => onNavigate(p.id)}
                      className="pr-10"
                    >
                      <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
                        {p.glyph}
                      </span>
                      <span className="truncate">{p.name}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge className="font-mono">
                      {done}/{problems.length}
                    </SidebarMenuBadge>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Data rounds</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={view === "sql"} onClick={() => onNavigate("sql")}>
                  <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
                    OVER()
                  </span>
                  <span className="truncate">SQL Drills</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={view === "flashcards"}
                  onClick={() => onNavigate("flashcards")}
                >
                  <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
                    P(A|B)
                  </span>
                  <span className="truncate">Stats Flashcards</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
