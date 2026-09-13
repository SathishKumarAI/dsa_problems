import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "network-delay",
  title: "When Does the Signal Reach Everyone?",
  pattern: "graphs",
  difficulty: "medium",
  leetcode: "network-delay-time",
  brief: "Shortest paths from one source, on weighted edges.",
  statement:
    "A signal starts at node k in a network of n nodes. Each edge [u, v, w] carries the signal from u to v in w time. Return the time for every node to receive it, or −1 if some node never does.",
  constraints: [
    "1 <= n <= 100, and nodes are numbered 1 to n",
    "edges are DIRECTED, so [u, v, w] says nothing about travelling from v to u",
    "1 <= w <= 100 — weights are positive, which is what makes a greedy shortest-path search correct",
    "the answer is the time the LAST node hears it, so it is a maximum over minimum distances",
  ],
  examples: [
    {
      input: "times = [[2, 1, 1], [2, 3, 1], [3, 4, 1]], n = 4, k = 2",
      output: "2",
      note: "Node 4 is the slowest, at 1 + 1.",
    },
    {
      input: "times = [[1, 2, 1]], n = 2, k = 2",
      output: "-1",
      note: "The edge points the wrong way, so node 1 never hears it.",
    },
  ],
  hints: [
    "Every node's answer is the shortest path from k to it. The overall answer is the largest of those.",
    "With positive weights, the unvisited node with the smallest known distance is already final — nothing reached later can offer it a shortcut.",
    "So repeatedly settle the nearest unsettled node and relax its outgoing edges. A heap picks that node in log time.",
  ],
  whyNow:
    "Relaxing every edge n − 1 times is correct and simpler to argue for, but it re-examines edges long after their endpoints have stopped changing. Positive weights buy a stronger guarantee: the nearest unsettled node is already finished. Settling nodes in that order means each edge is relaxed once, from a node whose distance will never improve again.",
  arc:
    "Every rung computes the shortest distance from one source to everyone and then reads the largest of them, because 'when has everyone heard it' is a maximum over minima — that reframing is half the problem, and the unreachable node is the other half, since an infinity left in the table is the −1 answer rather than a bug. Bellman-Ford gets there by brute repetition: sweep the whole edge list n − 1 times, long enough for the longest shortest path to settle. What it wastes is visible once you look, since it keeps re-examining edges whose endpoints stopped changing several sweeps ago. Positive weights buy the stronger claim Dijkstra runs on: the nearest unsettled node is already final, so settling in that order relaxes each edge once from a distance that will never improve. Know that claim, and know it dies the moment a weight can be negative — which is when Bellman-Ford stops being the slow rung and becomes the only correct one.",
  approach:
    "Keep tentative distances, all infinite except the source. Repeatedly take the unsettled node with the smallest tentative distance from a min-heap — with positive weights that distance is already final — and relax its outgoing edges, pushing any improvement back onto the heap. Stale heap entries are simply skipped when popped, which is cheaper than deleting them. When the heap empties, an unreachable node still holds infinity, and that is the −1 case. The answer is the largest finite distance: the moment the last node hears the signal.",
  complexity: { time: "O(E log V)", space: "O(V + E)" },
  python: `import heapq


def network_delay_time(times: list[list[int]], n: int, k: int) -> int:
    graph: dict[int, list[list[int]]] = {}
    for edge in times:
        graph.setdefault(edge[0], []).append([edge[1], edge[2]])
    best = [10**9] * (n + 1)
    best[k] = 0
    heap = [(0, k)]
    while heap:
        cost, node = heapq.heappop(heap)
        if cost > best[node]:
            continue
        for step in graph.get(node, []):
            nxt, weight = step[0], step[1]
            if cost + weight < best[nxt]:
                best[nxt] = cost + weight
                heapq.heappush(heap, (best[nxt], nxt))
    slowest = 0
    for node in range(1, n + 1):
        if best[node] >= 10**9:
            return -1
        slowest = max(slowest, best[node])
    return slowest`,
  java: `public int networkDelayTime(int[][] times, int n, int k) {
    Map<Integer, List<int[]>> graph = new HashMap<>();
    for (int[] edge : times) {
        graph.computeIfAbsent(edge[0], key -> new ArrayList<>())
            .add(new int[] {edge[1], edge[2]});
    }
    int[] best = new int[n + 1];
    Arrays.fill(best, 1000000000);
    best[k] = 0;
    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    heap.add(new int[] {0, k});
    while (!heap.isEmpty()) {
        int[] top = heap.poll();
        int cost = top[0], node = top[1];
        if (cost > best[node]) continue;
        for (int[] step : graph.getOrDefault(node, new ArrayList<>())) {
            if (cost + step[1] < best[step[0]]) {
                best[step[0]] = cost + step[1];
                heap.add(new int[] {best[step[0]], step[0]});
            }
        }
    }
    int slowest = 0;
    for (int node = 1; node <= n; node++) {
        if (best[node] >= 1000000000) return -1;
        slowest = Math.max(slowest, best[node]);
    }
    return slowest;
}`,
  cpp: `int networkDelayTime(const vector<vector<int>>& times, int n, int k) {
    map<int, vector<pair<int,int>>> graph;
    for (const vector<int>& edge : times) {
        graph[edge[0]].push_back({edge[1], edge[2]});
    }
    vector<int> best(n + 1, 1000000000);
    best[k] = 0;
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> heap;
    heap.push({0, k});
    while (!heap.empty()) {
        pair<int,int> top = heap.top();
        heap.pop();
        int cost = top.first, node = top.second;
        if (cost > best[node]) continue;
        for (auto step : graph[node]) {
            if (cost + step.second < best[step.first]) {
                best[step.first] = cost + step.second;
                heap.push({best[step.first], step.first});
            }
        }
    }
    int slowest = 0;
    for (int node = 1; node <= n; node++) {
        if (best[node] >= 1000000000) return -1;
        slowest = max(slowest, best[node]);
    }
    return slowest;
}`,
  alternatives: [
    {
      name: "Relax every edge, n − 1 times",
      summary:
        "Sweep the whole edge list repeatedly, improving any distance that can be improved, until n − 1 sweeps have happened — long enough for the longest possible shortest path to settle.",
      complexity: { time: "O(V · E)", space: "O(V)" },
      python: `def network_delay_time(times: list[list[int]], n: int, k: int) -> int:
    best = [10**9] * (n + 1)
    best[k] = 0
    for _ in range(n - 1):
        changed = False
        for edge in times:
            u, v, w = edge[0], edge[1], edge[2]
            if best[u] + w < best[v]:
                best[v] = best[u] + w
                changed = True
        if not changed:
            break
    slowest = 0
    for node in range(1, n + 1):
        if best[node] >= 10**9:
            return -1
        slowest = max(slowest, best[node])
    return slowest`,
      java: `public int networkDelayTime(int[][] times, int n, int k) {
    int[] best = new int[n + 1];
    Arrays.fill(best, 1000000000);
    best[k] = 0;
    for (int round = 0; round < n - 1; round++) {
        boolean changed = false;
        for (int[] edge : times) {
            if (best[edge[0]] + edge[2] < best[edge[1]]) {
                best[edge[1]] = best[edge[0]] + edge[2];
                changed = true;
            }
        }
        if (!changed) break;
    }
    int slowest = 0;
    for (int node = 1; node <= n; node++) {
        if (best[node] >= 1000000000) return -1;
        slowest = Math.max(slowest, best[node]);
    }
    return slowest;
}`,
      cpp: `int networkDelayTime(const vector<vector<int>>& times, int n, int k) {
    vector<int> best(n + 1, 1000000000);
    best[k] = 0;
    for (int round = 0; round < n - 1; round++) {
        bool changed = false;
        for (const vector<int>& edge : times) {
            if (best[edge[0]] + edge[2] < best[edge[1]]) {
                best[edge[1]] = best[edge[0]] + edge[2];
                changed = true;
            }
        }
        if (!changed) break;
    }
    int slowest = 0;
    for (int node = 1; node <= n; node++) {
        if (best[node] >= 1000000000) return -1;
        slowest = max(slowest, best[node]);
    }
    return slowest;
}`,
    },
  ],
}
