// Navigation in three sections — DSA (journeys, visualizer, patterns), SQL,
// Data science — every entry a hash link so back/forward and middle-click
// work. Header carries the wordmark and the help ("how to use") button;
// footer carries where-you-are, settings, shortcuts and the collapse toggle.
// Collapses to a 3 rem icon rail that peeks open on hover (ui/sidebar.tsx).
import {
  CircleHelpIcon,
  DatabaseIcon,
  KeyboardIcon,
  LayersIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  RouteIcon,
  SettingsIcon,
  SigmaIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
import { PATTERNS, PROBLEMS, problemsByPattern } from "@/data"
import { JOURNEYS } from "@/engine"
import { openDialog } from "@/lib/dialogs"
import { MASKED_GLYPH, MASKED_NAME, usePatternMask } from "@/lib/disclosure"
import type { Mask } from "@/lib/disclosure"
import { useEarned, useSolved } from "@/lib/progress"
import { href, useRoute } from "@/lib/route"

// text that has no room on the icon rail
const WIDE = "group-data-[collapsible=icon]:hidden"
const RAIL_ICON =
  "hidden shrink-0 text-muted-foreground group-data-[collapsible=icon]:block"

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
  const earned = useEarned(slug, acts)
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
      <SidebarMenuBadge className="font-mono" title={earned.long}>
        {earned.done ? "✓" : earned.short}
      </SidebarMenuBadge>
    </SidebarMenuItem>
  )
}

// where you are, in words — the footer's "navigation details". It names a
// pattern, so it obeys the mask too: this line leaked "Two Pointers" while
// Two Sum was still building it, and the UI test caught it.
function whereAmI(parts: string[], mask: Mask): string {
  const [root, a, b] = parts
  if (root === "journey") {
    const j = JOURNEYS.find((x) => x.slug === a)
    return j ? `DSA · journey · ${j.title}` : "DSA · journey"
  }
  if (root === "algorithms") return "DSA · algorithm visualizer"
  if (root === "p") {
    const pattern = PATTERNS.find((p) => p.id === a)
    const name = pattern
      ? mask.hidden.has(pattern.id)
        ? MASKED_NAME
        : pattern.name
      : a
    const problem = b && PROBLEMS.find((p) => p.id === b)
    if (problem) return `DSA · ${name} · ${problem.title}`
    return `DSA · pattern · ${name}`
  }
  if (root === "sql") return "SQL · drills"
  if (root === "flashcards") return "Data science · stats flashcards"
  return "home"
}

function FooterButton({
  icon,
  label,
  onClick,
  ariaLabel,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  ariaLabel?: string
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={onClick}
        tooltip={label}
        aria-label={ariaLabel ?? label}
        className="text-muted-foreground"
      >
        {icon}
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar({ view }: { view: string }) {
  const solved = useSolved()
  const mask = usePatternMask()
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"
  const route = useRoute()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-3 group-data-[collapsible=icon]:px-2">
        <div className="flex items-start gap-2">
          <a href={href("/")} className="min-w-0 flex-1">
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
          <Button
            size="icon-sm"
            variant="ghost"
            className={`text-muted-foreground ${WIDE}`}
            aria-label="how to use this app"
            title="how to use this app"
            onClick={() => openDialog("help")}
          >
            <CircleHelpIcon />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>DSA</SidebarGroupLabel>
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
          <SidebarGroupLabel>DSA · patterns</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PATTERNS.map((p) => {
                const problems = problemsByPattern(p.id)
                const done = problems.filter((pr) => solved.has(pr.id)).length
                // a pattern a journey is midway through teaching keeps its
                // name until the reveal — the row stays clickable
                const hidden = mask.hidden.has(p.id)
                const label = hidden ? MASKED_NAME : p.name
                return (
                  <SidebarMenuItem key={p.id}>
                    <SidebarMenuButton
                      render={<a href={href(`/p/${p.id}`)} />}
                      isActive={view === p.id}
                      tooltip={
                        hidden
                          ? `name revealed at the end of ${mask.by.get(p.id)}`
                          : `${p.name} · ${done}/${problems.length}`
                      }
                      className="pr-10"
                    >
                      <LayersIcon className={RAIL_ICON} />
                      <span
                        className={`w-16 shrink-0 font-mono text-xs text-muted-foreground ${WIDE}`}
                      >
                        {hidden ? MASKED_GLYPH : p.glyph}
                      </span>
                      <span
                        className={cn(
                          "truncate",
                          hidden && "text-muted-foreground italic"
                        )}
                      >
                        {label}
                      </span>
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
          <SidebarGroupLabel>SQL</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<a href={href("/sql")} />}
                  isActive={view === "sql"}
                  tooltip="SQL Drills"
                >
                  <DatabaseIcon className={RAIL_ICON} />
                  <span
                    className={`w-16 shrink-0 font-mono text-xs text-muted-foreground ${WIDE}`}
                  >
                    OVER()
                  </span>
                  <span className="truncate">SQL Drills</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Data science</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<a href={href("/flashcards")} />}
                  isActive={view === "flashcards"}
                  tooltip="Stats Flashcards"
                >
                  <SigmaIcon className={RAIL_ICON} />
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
        <div
          className={`truncate px-2 text-meta text-muted-foreground ${WIDE}`}
          aria-live="polite"
          data-testid="where"
        >
          {whereAmI(route.parts, mask)}
        </div>
        <SidebarMenu>
          <FooterButton
            icon={<SettingsIcon />}
            label="settings"
            onClick={() => openDialog("settings")}
          />
          <FooterButton
            icon={<KeyboardIcon />}
            label="shortcuts"
            ariaLabel="keyboard shortcuts"
            onClick={() => openDialog("shortcuts")}
          />
          <FooterButton
            icon={collapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
            label="collapse"
            ariaLabel={collapsed ? "expand sidebar" : "collapse sidebar"}
            onClick={toggleSidebar}
          />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
