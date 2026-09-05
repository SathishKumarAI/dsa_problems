// Difficulty badge colours, shared by list rows and problem headers.
import type { Difficulty } from "@/data"

export const difficultyClass: Record<Difficulty, string> = {
  easy: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  medium: "border-chart-4/40 bg-chart-4/10 text-chart-4",
  hard: "border-chart-5/40 bg-chart-5/10 text-chart-5",
}
