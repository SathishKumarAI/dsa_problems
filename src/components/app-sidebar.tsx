// Navigation: journeys (the deep builds), one entry per pattern with solved
// counts, the algorithm visualizer, and the data rounds. Every entry is a
// hash link so the browser back button and deep links just work.
import { RouteIcon, SlidersHorizontalIcon } from "lucide-react"
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
import { JOURNEYS } from "@/engine"
import { useSolved } from "@/lib/progress"
import { href } from "@/lib/route"
import { K, useStored } from "@/lib/store"

function JourneyItem({
  slug,
  title,
  acts,
  active,
}: {
  slug: string
  title: string
  acts: number
  active: boolean
}) {
  const unlocked = Math.min(useStored<number>(K.unlocked(slug), 1), acts)
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<a href={href(`/journey/${slug}`)} />}
        isActive={active}
        className="pr-12"
      >
        <RouteIcon className="size-3.5 shrink-0 text-chart-1" />
        <span className="truncate">{title}</span>
      </SidebarMenuButton>
      <SidebarMenuBadge
        className="font-mono"
        title={`${unlocked} of ${acts} acts earned`}
      >
        {unlocked >= acts ? "✓" : `${unlocked}/${acts}`}
      </SidebarMenuBadge>
    </SidebarMenuItem>
  )
}

export function AppSidebar({ view }: { view: string }) {
  const solved = useSolved()

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <a href={href("/")} className="block">
          <div className="font-mono text-sm font-semibold text-sidebar-primary">
            dsa.patterns
          </div>
          <div className="text-xs text-muted-foreground">
            earn the insight, then the name
          </div>
        </a>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Journeys</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {JOURNEYS.map((j) => (
                <JourneyItem
                  key={j.slug}
                  slug={j.slug}
                  title={j.title}
                  acts={j.acts.length}
                  active={
                    view === "journey" &&
                    location.hash.includes(`/journey/${j.slug}`)
                  }
                />
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<a href={href("/algorithms")} />}
                  isActive={view === "algorithms"}
                >
                  <SlidersHorizontalIcon className="size-3.5 shrink-0 text-chart-2" />
                  <span className="truncate">Algorithm visualizer</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
                      render={<a href={href(`/p/${p.id}`)} />}
                      isActive={view === p.id}
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
                <SidebarMenuButton
                  render={<a href={href("/sql")} />}
                  isActive={view === "sql"}
                >
                  <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
                    OVER()
                  </span>
                  <span className="truncate">SQL Drills</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<a href={href("/flashcards")} />}
                  isActive={view === "flashcards"}
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
