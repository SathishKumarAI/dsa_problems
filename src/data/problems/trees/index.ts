import type { Problem } from "../../types.ts"
import { problem as maxDepth } from "../../../problems/max-depth/index.ts"
import { problem as validateBst } from "./validate-bst.ts"
import { problem as levelOrder } from "./level-order.ts"
import { problem as sameTree } from "../../../problems/same-tree/index.ts"
import { problem as invertTree } from "./invert-tree.ts"
import { problem as balancedTree } from "./balanced-tree.ts"
import { problem as bstAncestor } from "./bst-ancestor.ts"
import { problem as inorderWalk } from "../../../problems/inorder-walk/index.ts"
import { problem as mirrorTree } from "../../../problems/mirror-tree/index.ts"
import { problem as rightSideView } from "../../../problems/right-side-view/index.ts"
import { problem as treeDiameter } from "../../../problems/tree-diameter/index.ts"

export const trees: Problem[] = [
  maxDepth,
  validateBst,
  levelOrder,
  sameTree,
  invertTree,
  balancedTree,
  bstAncestor,
  inorderWalk,
  mirrorTree,
  rightSideView,
  treeDiameter,
]
