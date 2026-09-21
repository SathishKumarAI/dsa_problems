// Navigation in five sections — Continue (journeys actually in play),
// Problems by pattern, then SQL, Data science and Reference (the algorithm
// visualizer) — every entry a hash link so back/forward and middle-click work.
//
// REFERENCE IS LAST on purpose. It sat second, one row above the catalogue,
// which put a tool for watching sorts run ahead of the 153 problems this site
// is for. Order is a claim about what matters; the visualizer is a side door.
//
// ONE CATALOGUE, and that is the point. This used to open with a list of
// JOURNEYS and carry a separate list of patterns below it, so 93 of the 127
// problems appeared twice under two headings — the app read as though
// "journeys" and "patterns" were two products. A problem is the noun; its
// journey is a mode of it, reached from its page. "Continue" is progress, not
// navigation, and it is absent until there is something to resume. Header carries the wordmark and the help ("how to use") button;
// footer carries where-you-are, settings, shortcuts and the collapse toggle.
// Collapses to a 3 rem icon rail that peeks open on hover (ui/sidebar.tsx).
import {
  CheckIcon,
  BookAIcon,
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
import { CornerUpLeftIcon, HomeIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KEYHINT, openPalette } from "@/features/search/palette-state"
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
import { navigate } from "@/lib/route"
import { usePrevious } from "@/lib/recent"
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
        <RouteIcon className={`size-3.5 shrink-0 text-dim ${WIDE}`} />
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
  if (root === "g") return "DSA · glossary"
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

/**
 * The journeys actually in play — started and not yet finished.
 *
 * This used to be a CATALOGUE: the six or so most relevant journeys, then
 * "show all 93" behind a chevron. Which made the sidebar two lists of the same
 * thing. 93 of the 127 problems appeared once here under the journey's title
 * and again under their pattern, so the app read as though "journeys" and
 * "patterns" were two products rather than one noun and one of its modes.
 *
 * A problem is the noun. Its journey is reached FROM it — every problem page
 * carries the invitation — so this group is now progress, not navigation, and
 * it is empty until there is something to resume.
 *
 * One store key per journey is more than a hook may subscribe to in a loop, so
 * re-render on any store write and read the plain getters (as home-view does).
 */
function continuing(open: string | undefined) {
  const shown = JOURNEYS.filter((j) => {
    const e = earnedOf(getStored<number>(K.unlocked(j.slug), 1), j.acts.length)
    return e.earned > 0 && !e.done
  })
  // never hide the journey the learner is looking at
  const current = JOURNEYS.find((j) => j.slug === open)
  if (current && !shown.includes(current)) shown.unshift(current)
  return shown
}

export function AppSidebar({ view }: { view: string }) {
  const back = usePrevious()
  useStoreVersion()
  const solved = useSolved()
  const mask = usePatternMask()
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"
  const route = useRoute()
  // Which pattern is open, so its problems are listed. The sidebar stopped at
  // PATTERNS when the journey catalogue went: ten rows, and no way to reach a
  // problem from it at all. A catalogue whose leaves are unreachable is a table
  // of contents with no page numbers.
  const openPattern = route.parts[0] === "p" ? route.parts[1] : undefined
  const openProblem = route.parts[0] === "p" ? route.parts[2] : undefined
  const resume = continuing(
    route.parts[0] === "journey" ? route.parts[1] : undefined
  )

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-3 group-data-[collapsible=icon]:px-2">
        <div className="flex items-start gap-2">
          <a href={href("/")} className="min-w-0 flex-1">
            <div className="font-mono text-ui font-semibold text-sidebar-primary">
              <span className={WIDE}>Patternsmith</span>
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
        {/* SEARCH LIVES HERE. It was a bar across the top of every page, which
            is a band of chrome above the thing you came to read — and on the
            problem page it is the only chrome left. Navigation belongs with
            navigation. On the icon rail it is the magnifier alone, and the
            keyboard route (Ctrl/⌘ K) is unchanged and unaffected. */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={openPalette}
              tooltip="Search — Ctrl/⌘ K"
              className="text-muted-foreground"
            >
              <SearchIcon className="size-4 shrink-0" />
              <span className={`truncate ${WIDE}`}>Search</span>
              <span
                className={`ml-auto font-mono text-meta text-dim ${WIDE}`}
                aria-hidden
              >
                {KEYHINT}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* HOME, as a control rather than as a logo. The wordmark above has
              always been a link home, which is a convention and not an
              affordance: nothing about it says so, and on the icon rail it is
              a monogram. This row says it. */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate("/")}
              tooltip="Home"
              className="text-muted-foreground"
            >
              <HomeIcon className="size-4 shrink-0" />
              <span className={`truncate ${WIDE}`}>Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* WHERE YOU JUST WERE. Every other back affordance in this app
              points UP a hierarchy — a journey trails to its problem, a
              problem to its pattern — which is only where you came from if
              you arrived from above. Arrive from search or a shared link and
              those all send you somewhere new. This is the one control that
              knows, and it names the page so it is a destination rather than
              a direction. Hidden on the first page of a sitting, because a
              back button with nothing behind it teaches distrust. */}
          {back && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigate(back.path)}
                tooltip={`Back to ${back.label}`}
                className="text-muted-foreground"
              >
                <CornerUpLeftIcon className="size-4 shrink-0" />
                <span className={`truncate ${WIDE}`}>{back.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent
        // collapsed, the primitive sets overflow-hidden, so "show all 46
        // journeys" on a short viewport clipped the list with no way to reach
        // the rest. The rail scrolls like the expanded column does.
        className="group-data-[collapsible=icon]:overflow-y-auto"
      >
        {/* CONTINUE — progress, not a catalogue. Absent until a journey has
            been started and not finished, because a heading over an empty list
            is a promise the app is not keeping. Every journey is reached from
            its problem page; this is only the way back into one. */}
        {resume.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Continue</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {resume.map((j) => (
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
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>Problems · by pattern</SidebarGroupLabel>
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
                    {/* The pattern you are IN lists its problems. Not a
                        disclosure the reader has to find and not all ten at
                        once — 127 rows is the catalogue again — just the branch
                        they are standing on, which is the one they need to move
                        sideways in. A masked pattern lists nothing: the titles
                        are the idea it is still withholding. */}
                    {openPattern === p.id && !hidden && (
                      <SidebarMenuSub>
                        {problems.map((pr) => (
                          <SidebarMenuSubItem key={pr.id}>
                            <SidebarMenuSubButton
                              render={<a href={href(`/p/${p.id}/${pr.id}`)} />}
                              isActive={openProblem === pr.id}
                            >
                              <span
                                className={cn(
                                  "truncate",
                                  solved.has(pr.id) &&
                                    "text-muted-foreground line-through"
                                )}
                              >
                                {pr.title}
                              </span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
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
        <SidebarGroup>
          <SidebarGroupLabel>Reference</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<a href={href("/g")} />}
                  isActive={view === "g"}
                  tooltip="Glossary"
                >
                  <BookAIcon className="size-3.5 shrink-0 text-dim" />
                  <span className="truncate">Glossary</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<a href={href("/algorithms")} />}
                  isActive={view === "algorithms"}
                  tooltip="Algorithm visualizer"
                >
                  <SlidersHorizontalIcon className="size-3.5 shrink-0 text-dim" />
                  <span className="truncate">Algorithm visualizer</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* B85's Resources entry is gone with the page. It was one
                  surface about all ten patterns, sitting beside a group that
                  lists the same ten — so a pattern's playbook and its problems
                  were two clicks apart under two headings. Both are on the
                  pattern's own page now, and the group above is the way in. */}
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
