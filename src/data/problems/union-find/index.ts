// The union-find load list.
//
// GENERATED in spirit, hand-owned in fact: add a problem by adding two lines.
// A load list is not the grouping — `problemsByPattern` filters the record's
// own `pattern` field — so moving a record between lists changes nothing a
// reader sees. The lists exist so there is one obvious place to register a new
// file, which is exactly what eight patterns went without.

import type { Problem } from "../../types.ts"
import { problem as connectTheNetwork } from "../../../problems/connect-the-network/index.ts"
import { problem as countProvinces } from "../../../problems/count-provinces/index.ts"
import { problem as equationsPossible } from "../../../problems/equations-possible/index.ts"
import { problem as redundantConnection } from "../../../problems/redundant-connection/index.ts"

export const unionFind: Problem[] = [
  connectTheNetwork,
  countProvinces,
  equationsPossible,
  redundantConnection,
]
