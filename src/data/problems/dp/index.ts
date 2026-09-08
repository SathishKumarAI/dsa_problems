import type { Problem } from "../../types.ts"
import { problem as stairWays } from "./stair-ways.ts"
import { problem as houseRobber } from "./house-robber.ts"
import { problem as coinChangeMin } from "./coin-change-min.ts"

export const dp: Problem[] = [stairWays, houseRobber, coinChangeMin]
