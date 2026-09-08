import type { Problem } from "../../types.ts"
import { problem as islandCount } from "./island-count.ts"
import { problem as courseOrder } from "./course-order.ts"
import { problem as rottingFruit } from "./rotting-fruit.ts"

export const graphs: Problem[] = [islandCount, courseOrder, rottingFruit]
