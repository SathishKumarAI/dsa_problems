import type { Problem } from "../../types.ts"
import { problem as maxDepth } from "./max-depth.ts"
import { problem as validateBst } from "./validate-bst.ts"
import { problem as levelOrder } from "./level-order.ts"

export const trees: Problem[] = [maxDepth, validateBst, levelOrder]
