// The backtracking load list.
//
// GENERATED in spirit, hand-owned in fact: add a problem by adding two lines.
// A load list is not the grouping — `problemsByPattern` filters the record's
// own `pattern` field — so moving a record between lists changes nothing a
// reader sees. The lists exist so there is one obvious place to register a new
// file, which is exactly what eight patterns went without.

import type { Problem } from "../../types.ts"
import { problem as combinationSum } from "../../../problems/combination-sum/index.ts"
import { problem as generateParens } from "../../../problems/generate-parens/index.ts"
import { problem as permutations } from "../../../problems/permutations/index.ts"
import { problem as subsets } from "../../../problems/subsets/index.ts"
import { problem as wordSearch } from "../../../problems/word-search/index.ts"

export const backtracking: Problem[] = [
  combinationSum,
  generateParens,
  permutations,
  subsets,
  wordSearch,
]
