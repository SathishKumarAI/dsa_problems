# docs/ — the manifest

One canonical file per question. If a question is not answered below, the answer goes
into the file that owns the nearest question, never into a new file.

| Question | Canonical file | Never create | Tier |
|---|---|---|---|
| What are we building, for whom, and what is out of scope? | [`PRD.md`](PRD.md) | requirements.md, spec.md, product.md | P0 |
| What is on screen, what does every button do, what state is it in? | [`FEATURES.md`](FEATURES.md) | feature-log.md, ui.md, components.md | P0 |
| How good does it look and feel, measured — and what would I fix? | [`UX-AUDIT.md`](UX-AUDIT.md) | design-review.md, a11y.md | P1 |
| Which type step, spacing, radius, width or colour role do I use? | [`DESIGN.md`](DESIGN.md) | tokens.md, style-guide.md, brand.md | P0 |
| What do we build next, and why that order? | [`BACKLOG.md`](BACKLOG.md) | todo.md, tasks.md, issues.md | P0 |
| Where is this going over the next quarters? | [`ROADMAP.md`](ROADMAP.md) | future.md, futurelog.md, vision.md | P1 |
| Which problem is next, what is done for a problem, which book informs it? | [`PROBLEMS.md`](PROBLEMS.md) | problems-todo.md, curriculum.md, leetcode.md | P0 |
| What is each box on screen, who owns it, how does data flow? | [`ARCHITECTURE.md`](ARCHITECTURE.md) | design.md, internals.md, overview.md | P0 |
| What does the HTTP API accept and return? | [`API.md`](API.md) | endpoints.md, openapi.md, server.md | P0 |
| How are the visualisations built, and how do I do this in Python (or for an LLM)? | [`VISUALIZING.md`](VISUALIZING.md) | viz.md, animation.md, tokens.md | P1 |
| How do I add a journey / act / render kind without regressing the pedagogy? | [`AUTHORING.md`](AUTHORING.md) | contributing.md, content-guide.md | P0 |
| What shipped, when, in which PR? | [`WORKLOG.md`](WORKLOG.md) | changelog.md, history.md, log.md | P1 |
| Why does each backlog item exist — which platform taught us what? | [`RESEARCH.md`](RESEARCH.md) | references.md, inspiration.md | P2 |
| What did we decide and why, before building? | [`superpowers/specs/`](superpowers/specs/) | decisions.md, adr/ | P1 |

Repo-level maps live outside this folder: [`../README.md`](../README.md) (change → file),
[`../CLAUDE.md`](../CLAUDE.md) (where to look, traps), [`../STATUS.md`](../STATUS.md) (where the
last session stopped).

## Rules for this folder

- **Update in the same commit as the code.** A stale map costs more than no map.
- `FEATURES.md` is the audit of what exists: every row names its source file and its status
  (`shipped` · `partial` · `backlog`). A feature is not shipped until it is verified the way a
  user would hit it, and the row says how.
- `BACKLOG.md` items are checked off in the commit that ships them.
- Links are relative and checked: `python <staff-technical-docs>/scripts/check_links.py docs`
  must report 0 broken before a docs commit.
