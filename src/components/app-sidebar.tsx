// Navigation in three sections — DSA (journeys, visualizer, patterns), SQL,
// Data science — every entry a hash link so back/forward and middle-click
// work. Header carries the wordmark and the help ("how to use") button;
// footer carries where-you-are, settings, shortcuts and the collapse toggle.
// Collapses to a 3 rem icon rail that peeks open on hover (ui/sidebar.tsx).
import { useState } from "react"
import {
  CheckIcon,
  ChevronDownIcon,
  CircleHelpIcon,
  DatabaseIcon,
  KeyboardIcon,
  LayersIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  RouteIcon,
  SettingsIcon,
  SigmaIcon,
  LibraryIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProgressRing } from "@/components/ui/progress-ring"
import { RailToken } from "@/components/ui/rail-token"
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
// The MANIFEST for the problem list, the real `PATTERNS` for the pattern rows.
// This surface needs a title, an id and a difficulty per problem; the records
// carry statements, hints, constraints and code in three languages, and putting
// them in the first chunk to render a sidebar is what B95 measured.
// `@/data` is the barrel that builds PROBLEMS from all ten pattern folders —
// importing PATTERNS through it pulls every record in. Take it from its own module.
import { PATTERNS } from "@/data/patterns"
import {
  CATALOGUE as PROBLEMS,
  cardsOfPattern as problemsByPattern,
} from "@/data/manifest"
// The MANIFEST, not the registry. This surface lists journeys — slug, title,
// how many there are — and reading that off `JOURNEYS` pulled all 93 acts,
// frame generators, presets and prose into the first chunk to render a list.
// Measured before: `engine-*.js` was 568 KB gzipped of the 747 KB first load.
import { JOURNEY_CARDS as JOURNEYS } from "@/engine/manifest"
import { openDialog } from "@/lib/dialogs"
import { MASKED_GLYPH, MASKED_NAME, usePatternMask } from "@/lib/disclosure"
import type { Mask } from "@/lib/disclosure"
import { earnedOf, useEarned, useSolved } from "@/lib/progress"
import { href, useRoute } from "@/lib/route"
import { K, getStored, useStoreVersion } from "@/lib/store"

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
        <RouteIcon className={`size-3.5 shrink-0 text-chart-1 ${WIDE}`} />
        <RailToken label={title} done={earned.earned} total={earned.total} />
        <span className={`truncate ${WIDE}`}>{title}</span>
      </SidebarMenuButton>
      {/* a finished journey says so with the palette's own "this is correct"
          green rather than a glyph the mono face renders at a different weight
          from the counts beside it */}
      <SidebarMenuBadge className="font-mono" title={earned.long}>
        {earned.done ? (
          <CheckIcon className="size-3.5 text-chart-3" aria-label="complete" />
        ) : (
          earned.short
        )}
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
  if (root === "resources") return "DSA · resources"
  if (root === "sql") return "SQL · drills"
  if (root === "flashcards") return "Data science · stats flashcards"
  return "home"
}

// Three footer controls used to be three full-width rows — about 108px of
// chrome to reach a dialog. They sit side by side now: same three targets,
// one row, and the label moves into the tooltip. On the collapsed rail there
// is no width to share, so they stack again.
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
    <SidebarMenuItem className="group-data-[collapsible=icon]:w-full">
      <SidebarMenuButton
        onClick={onClick}
        tooltip={label}
        aria-label={ariaLabel ?? label}
        className="justify-center text-muted-foreground group-data-[collapsible=icon]:justify-start"
      >
        {icon}
        <span className="sr-only">{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

// 45 journeys is a catalogue, not a menu. Show the ones actually in play —
// started-and-unfinished first, then the next few unstarted — and put the rest
// behind one click. Every journey is still reachable from its problem page.
// One store key per journey is more than a hook may subscribe to in a loop, so
// re-render on any store write and read the plain getters (as home-view does).
function journeysInPlay(open: string | undefined) {
  const ledger = JOURNEYS.map((j) => ({
    journey: j,
    earned: earnedOf(getStored<number>(K.unlocked(j.slug), 1), j.acts.length),
  }))
  const started = ledger.filter((r) => r.earned.earned > 0 && !r.earned.done)
  const fresh = ledger.filter((r) => r.earned.earned === 0)
  const picked = [...started, ...fresh].slice(0, Math.max(6, started.length))
  const shown = picked.map((r) => r.journey)
  // never hide the journey the learner is looking at
  const current = JOURNEYS.find((j) => j.slug === open)
  if (current && !shown.includes(current)) shown.unshift(current)
  return shown
}

export function AppSidebar({ view }: { view: string }) {
  const [allJourneys, setAllJourneys] = useState(false)
  useStoreVersion()
  const solved = useSolved()
  const mask = usePatternMask()
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"
  const route = useRoute()
  const shown = allJourneys
    ? JOURNEYS
    : journeysInPlay(route.parts[0] === "journey" ? route.parts[1] : undefined)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-3 group-data-[collapsible=icon]:px-2">
        <div className="flex items-start gap-2">
          <a href={href("/")} className="min-w-0 flex-1">
            <div className="font-mono text-ui font-semibold text-sidebar-primary">
              <span className={WIDE}>dsa.patterns</span>
              <span className="hidden text-center group-data-[collapsible=icon]:block">
                d.
              </span>
            </div>
            <div className={`text-meta text-muted-foreground ${WIDE}`}>
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
      <SidebarContent
        // collapsed, the primitive sets overflow-hidden, so "show all 46
        // journeys" on a short viewport clipped the list with no way to reach
        // the rest. The rail scrolls like the expanded column does.
        className="group-data-[collapsible=icon]:overflow-y-auto"
      >
        <SidebarGroup>
          <SidebarGroupLabel>DSA</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {shown.map((j) => (
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
              {/* A disclosure has to go both ways. This used to set the flag
                  to true and then hide itself, so expanding to all 46 was a
                  one-way door — the only way back was a reload. */}
              {(allJourneys || JOURNEYS.length > shown.length) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setAllJourneys((v) => !v)}
                    aria-expanded={allJourneys}
                    tooltip={
                      allJourneys
                        ? "show only the journeys in play"
                        : `show all ${JOURNEYS.length} journeys`
                    }
                    className="text-muted-foreground"
                  >
                    <ChevronDownIcon
                      className={cn(
                        "size-3.5 shrink-0 transition-transform",
                        allJourneys && "rotate-180"
                      )}
                    />
                    <span className="truncate">
                      {allJourneys
                        ? "show fewer"
                        : `${JOURNEYS.length - shown.length} more journeys`}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
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
              {/* B85. Not under "DSA · patterns" below: that group is a list of
                  patterns to PRACTISE, and this is one page about all of them.
                  It sits beside the visualizer, which is the other reference
                  surface that is not a problem list. */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<a href={href("/resources")} />}
                  isActive={view === "resources"}
                  tooltip="Resources"
                >
                  <LibraryIcon className="size-3.5 shrink-0 text-chart-2" />
                  <span className="truncate">Resources</span>
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
                      {/* collapsed, this row used to be a generic icon
                          identical to the other nine — see rail-token.tsx */}
                      <RailToken
                        label={label}
                        done={done}
                        total={problems.length}
                      />
                      <LayersIcon className={cn(RAIL_ICON, "hidden")} />
                      <span
                        className={`w-16 shrink-0 font-mono text-meta text-muted-foreground ${WIDE}`}
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
                    <SidebarMenuBadge>
                      <ProgressRing done={done} total={problems.length} />
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
                    className={`w-16 shrink-0 font-mono text-meta text-muted-foreground ${WIDE}`}
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
                    className={`w-16 shrink-0 font-mono text-meta text-muted-foreground ${WIDE}`}
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
        <SidebarMenu className="flex-row gap-1 group-data-[collapsible=icon]:flex-col [&>li]:flex-1">
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
