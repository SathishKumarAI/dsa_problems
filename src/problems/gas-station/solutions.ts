// gas-station — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "One pass. Keep the total of gas minus cost, which decides whether any answer exists at all, and a running tank from the current candidate start. Whenever the tank goes negative at station i, no station from the current candidate through i can be the answer — each of them reaches i with no more fuel than the candidate had — so the candidate jumps to i+1 and the tank resets to zero. At the end, return the candidate if the total is non-negative and -1 otherwise. Each station is visited once, and the jump is what makes it linear rather than quadratic."

export const whyNow = "Simulating from each start with an early exit is still quadratic on adversarial input, because a failure at the very last station tells the next start nothing. The jump argument extracts real information from a failure — every station passed through is eliminated at the same time — which is what collapses n starts into one pass."

export const arc = "Two separate arguments do all the work, and keeping them apart is the lesson. The first is a feasibility check that has nothing to do with order: total gas against total cost decides whether an answer exists, and no simulation can change that. The second is the elimination: when the tank dies between s and i, every start in between dies at i too, because each of them arrives with less fuel than s did. That second argument is an exchange argument in its usual clothing, and it is why the scan may throw away a whole block of candidates on one failure. Whenever a brute force tries every start, ask what one failure rules out — if it rules out everything you passed through, the quadratic collapses."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def can_complete_circuit(gas: list[int], cost: list[int]) -> int:
    total = 0   # decides whether ANY start works
    tank = 0    # fuel since the current candidate
    start = 0
    for i in range(len(gas)):
        gain = gas[i] - cost[i]
        total += gain
        tank += gain
        if tank < 0:
            # every station from the candidate through i fails at i too,
            # since each reaches i with no more fuel than the candidate had
            start = i + 1
            tank = 0
    return start if total >= 0 else -1`

export const alternatives: Solution[] = [
  {
    name: "Simulate every start",
    summary:
      "For each station, drive the full circle keeping a tank and give up the moment it goes negative. Report the first start that survives. It is the definition of the problem run directly and it repeats almost the same drive n times.",
    complexity: { time: "O(n^2)", space: "O(1)" },
    python: `def can_complete_circuit(gas: list[int], cost: list[int]) -> int:
    n = len(gas)
    for start in range(n):
        tank = 0
        ok = True
        for step in range(n):
            i = (start + step) % n
            tank += gas[i] - cost[i]
            if tank < 0:
                ok = False
                break
        if ok:
            return start
    return -1`,
  },
  {
    name: "Reject on the totals, then simulate",
    summary:
      "Compare the total gas with the total cost first: when the total falls short no start can work, and the answer is -1 without driving anywhere. Otherwise fall back to simulating each start. One cheap global test removes every hopeless input.",
    complexity: { time: "O(n^2) worst case, O(n) to reject", space: "O(1)" },
    whyNow:
      "The pure simulation drives the entire circle n times even when the fuel does not exist to finish it once. The totals answer that in a single pass, so the expensive search runs only on inputs where an answer is guaranteed to be there.",
    python: `def can_complete_circuit(gas: list[int], cost: list[int]) -> int:
    if sum(gas) < sum(cost):
        return -1
    n = len(gas)
    for start in range(n):
        tank = 0
        ok = True
        for step in range(n):
            i = (start + step) % n
            tank += gas[i] - cost[i]
            if tank < 0:
                ok = False
                break
        if ok:
            return start
    return -1`,
  },
]
