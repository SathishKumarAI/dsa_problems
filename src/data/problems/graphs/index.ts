import type { Problem } from "../../types.ts"
import { problem as islandCount } from "./island-count.ts"
import { problem as courseOrder } from "./course-order.ts"
import { problem as rottingFruit } from "./rotting-fruit.ts"
import { problem as maxIslandArea } from "./max-island-area.ts"
import { problem as wordSearch } from "./word-search.ts"
import { problem as countProvinces } from "./count-provinces.ts"
import { problem as networkDelay } from "./network-delay.ts"
import { problem as surroundedRegions } from "./surrounded-regions.ts"
import { problem as floodFill } from "./flood-fill.ts"
import { problem as pacificAtlantic } from "./pacific-atlantic.ts"
import { problem as shortestPathGrid } from "./shortest-path-grid.ts"

export const graphs: Problem[] = [
  islandCount,
  courseOrder,
  rottingFruit,
  maxIslandArea,
  wordSearch,
  countProvinces,
  networkDelay,
  surroundedRegions,
  floodFill,
  pacificAtlantic,
  shortestPathGrid,
]
