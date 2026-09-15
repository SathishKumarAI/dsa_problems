// The greedy load list.
//
// GENERATED in spirit, hand-owned in fact: add a problem by adding two lines.
// A load list is not the grouping — `problemsByPattern` filters the record's
// own `pattern` field — so moving a record between lists changes nothing a
// reader sees. The lists exist so there is one obvious place to register a new
// file, which is exactly what eight patterns went without.

import type { Problem } from "../../types.ts"
import { problem as bestTrade } from "../../../problems/best-trade/index.ts"
import { problem as gasStation } from "../../../problems/gas-station/index.ts"
import { problem as jumpGame } from "../../../problems/jump-game/index.ts"
import { problem as jumpGameIi } from "../../../problems/jump-game-ii/index.ts"
import { problem as partitionLabels } from "../../../problems/partition-labels/index.ts"

export const greedy: Problem[] = [
  bestTrade,
  gasStation,
  jumpGame,
  jumpGameIi,
  partitionLabels,
]
