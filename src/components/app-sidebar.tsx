// Navigation: journeys (the deep builds), one entry per pattern with solved
// counts, the algorithm visualizer, and the data rounds. Every entry is a
// hash link so the browser back button and deep links just work.
// Collapses to a 3rem icon rail (toggle at the bottom, state in a cookie via
// SidebarProvider) so the journey stage can take the width.
import {
  DatabaseIcon,
  LayersIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  RouteIcon,
  SigmaIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { PATTERNS, problemsByPattern } from "@/data"
import { JOURNEYS } from "@/engine"
import { useSolved } from "@/lib/progress"
import { href } from "@/lib/route"
import { K, useStored } from "@/lib/store"

// text that has no room on the icon rail
const WIDE = "group-data-[collapsible=icon]:hidden"

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
        tooltip={title}
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

function CollapseToggle() {
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"
  return (
    <SidebarMenuButton
      onClick={toggleSidebar}
      tooltip="expand sidebar"
      aria-label={collapsed ? "expand sidebar" : "collapse sidebar"}
      className="text-muted-foreground"
    >
      {collapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
      <span>collapse</span>
    </SidebarMenuButton>
  )
}

export function AppSidebar({ view }: { view: string }) {
  const solved = useSolved()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-3 group-data-[collapsible=icon]:px-2">
        <a href={href("/")} className="block">
          <div className="font-mono text-sm font-semibold text-sidebar-primary">
            <span className={WIDE}>dsa.patterns</span>
            <span className="hidden text-center group-data-[collapsible=icon]:block">
              d.
            </span>
          </div>
          <div className={`text-xs text-muted-foreground ${WIDE}`}>
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
                  tooltip="Algorithm visualizer"
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
                      tooltip={`${p.name} · ${done}/${problems.length}`}
                      className="pr-10"
                    >
                      <LayersIcon className="hidden shrink-0 text-muted-foreground group-data-[collapsible=icon]:block" />
                      <span
                        className={`w-16 shrink-0 font-mono text-xs text-muted-foreground ${WIDE}`}
                      >
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
                  tooltip="SQL Drills"
                >
                  <DatabaseIcon className="hidden shrink-0 text-muted-foreground group-data-[collapsible=icon]:block" />
                  <span
                    className={`w-16 shrink-0 font-mono text-xs text-muted-foreground ${WIDE}`}
                  >
                    OVER()
                  </span>
                  <span className="truncate">SQL Drills</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<a href={href("/flashcards")} />}
                  isActive={view === "flashcards"}
                  tooltip="Stats Flashcards"
                >
                  <SigmaIcon className="hidden shrink-0 text-muted-foreground group-data-[collapsible=icon]:block" />
                  <span
                    className={`w-16 shrink-0 font-mono text-xs text-muted-foreground ${WIDE}`}
                  >
                    P(A|B)
                  </span>
                  <span className="truncate">Stats Flashcards</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <CollapseToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
