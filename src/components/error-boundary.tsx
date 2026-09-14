// One render error costs one PAGE, not the site (B96). React unmounts the
// whole tree on an uncaught render error, so without a boundary a single
// malformed record — in an app that is 75% authored content and grows twenty
// problems a branch — takes home, the rail and every route that was fine down
// with the page that broke.
//
// Owns the caught state and the fallback. Owns no reset logic: it is mounted
// INSIDE `main`, which App.tsx keys on the route path, so navigating anywhere
// remounts the boundary and clears the error. A `resetKeys` prop would be a
// second copy of a rule the router already enforces.
//
// It SHOWS the message. This is a learner's tool, not a product hiding its
// errors, and the message is the fastest route from "the page is blank" to the
// record that broke it.
import { Component, type ErrorInfo, type ReactNode } from "react"
import { href } from "@/lib/route"

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  // React already logs the error; this adds the component stack, which is the
  // half that names WHICH view threw.
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "render error caught by the boundary",
      error,
      info.componentStack
    )
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div
        role="alert"
        className="mx-auto flex w-full max-w-reading flex-col gap-4"
      >
        <h1 className="font-heading text-title font-semibold">
          This page hit an error
        </h1>

        <p className="max-w-[35em] text-body text-muted-foreground">
          Only this page stopped — the rail, the search and every other route
          still work. If it happens again on the same page, the message below is
          the thing to report.
        </p>

        <pre className="max-w-full overflow-x-auto rounded-lg border bg-card px-3 py-2 font-mono text-ui text-chart-5">
          {error.message || String(error)}
        </pre>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={href("/")}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-ui font-medium transition-colors hover:border-chart-1/60 lg:min-h-9"
          >
            go home
          </a>
        </div>
      </div>
    )
  }
}
