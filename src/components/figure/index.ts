// The figure module's one door. Import from `@/components/figure`, never from
// a file inside it — the split between "what is drawn" and "the space it takes"
// is an implementation detail and is expected to grow more kinds.
export { FigureFrame } from "./frame"
export { ConstraintFigureView } from "./constraint-figure"
