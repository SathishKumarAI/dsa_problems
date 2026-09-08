import type { Problem } from "../../types.ts"
import { problem as maxDepth } from "./max-depth.ts"
import { problem as validateBst } from "./validate-bst.ts"
import { problem as levelOrder } from "./level-order.ts"
import { problem as sameTree } from "./same-tree.ts"
import { problem as invertTree } from "./invert-tree.ts"
import { problem as balancedTree } from "./balanced-tree.ts"
import { problem as bstAncestor } from "./bst-ancestor.ts"

export const trees: Problem[] = [
  maxDepth,
  validateBst,
  levelOrder,
  sameTree,
  invertTree,
  balancedTree,
  bstAncestor,
]
