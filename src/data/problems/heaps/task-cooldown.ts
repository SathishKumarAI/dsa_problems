import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "task-cooldown",
  title: "Task Scheduling With Cooldown",
  pattern: "heaps",
  difficulty: "medium",
  leetcode: "task-scheduler",
  brief: "Minimum time to run tasks when repeats need n idle slots.",
  statement:
    "Given task labels and a cooldown n, identical tasks must be at least n time-units apart. Each task takes one unit; you may idle. Return the minimum total units to finish everything.",
  constraints: [
    "1 <= tasks.length <= 10^4",
    "tasks[i] is an uppercase letter, so at most 26 distinct tasks",
    "0 <= n <= 100",
    "identical tasks must be separated by at least n intervals; idle intervals are allowed",
  ],
  examples: [
    {
      input: "tasks = [A, A, A, B, B, B], n = 2",
      output: "8",
      note: "A B _ A B _ A B",
    },
  ],
  hints: [
    "Greedy: always run the task with the most remaining copies (breaking it up matters most).",
    "A max-heap of remaining counts gives you that task; a queue holds cooling tasks with their release times.",
    "Time advances by 1 per unit; a task leaving the heap re-enters via the cooldown queue.",
  ],
  whyNow:
    "The formula gives the length in one line but never says what actually runs when, and it has to special-case the tasks tied for most frequent. Simulating with a max-heap produces the schedule itself, which is what the follow-up asks for.",
  arc: "Both rungs rest on one observation: only the most frequent task can force an idle, so the schedule's length is decided by that task and by how many others tie with it. The formula says so directly — maxCount − 1 gaps of width n + 1, plus a slot for each task tied at that count, floored by the number of tasks when the queue is dense enough to fill every gap — and it is constant work after the tally. What it will not tell you is what actually runs at minute seven. The heap simulation answers that by making the same greedy choice explicit: run the task with the most copies left, then park it in a cooldown queue stamped with the tick it becomes legal again. Know the formula for the count and the heap-plus-cooldown-queue for the schedule, because the second is the one that survives when tasks gain priorities, or durations, or the cooldown stops being uniform. Twenty-six labels is what keeps the heap cheap; the shape holds for any bounded alphabet.",
  approach:
    "Max-heap of remaining counts (negated for Python). Each tick: pop the most frequent available task, run it, and if copies remain, park it in a queue stamped with when its cooldown ends. Move queue heads back into the heap as their timestamps expire. When both structures are empty, the clock is the answer. Running the most frequent task first is safe because it is the one that forces idles if postponed.",
  complexity: { time: "O(total ticks × log 26)", space: "O(26)" },
  python: `import heapq
from collections import Counter, deque

def least_interval(tasks: list[str], n: int) -> int:
    heap = [-c for c in Counter(tasks).values()]
    heapq.heapify(heap)
    cooling: deque[tuple[int, int]] = deque()  # (ready_time, -count)
    time = 0
    while heap or cooling:
        time += 1
        if cooling and cooling[0][0] == time:
            heapq.heappush(heap, cooling.popleft()[1])
        if heap:
            count = heapq.heappop(heap) + 1  # ran one copy
            if count:
                cooling.append((time + n + 1, count))
    return time`,
  java: `public int leastInterval(String[] tasks, int n) {
    Map<String,Integer> freq = new HashMap<>();
    for (String t: tasks) freq.put(t, freq.getOrDefault(t,0)+1);
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int c: freq.values()) heap.add(-c);
    ArrayDeque<int[]> cooling = new ArrayDeque<>();
    int time=0;
    while (!heap.isEmpty() || !cooling.isEmpty()){
        time++;
        if (!cooling.isEmpty() && cooling.peek()[0]==time){
            heap.add(cooling.poll()[1]);
        }
        if (!heap.isEmpty()){
            int count = heap.poll()+1;
            if (count!=0) cooling.offer(new int[]{time+n+1, count});
        }
    }
    return time;
}
`,
  cpp: `int leastInterval(const vector<string>& tasks, int n) {
    unordered_map<string,int> freq;
    for (auto &t: tasks) freq[t]++;
    priority_queue<int> heap;
    for (auto &p: freq) heap.push(p.second);
    deque<pair<int,int>> cooling;
    int time=0;
    while (!heap.empty() || !cooling.empty()){
        time++;
        if (!cooling.empty() && cooling.front().first==time){
            heap.push(cooling.front().second);
            cooling.pop_front();
        }
        if (!heap.empty()){
            int count = heap.top(); heap.pop();
            count--;
            if (count>0) cooling.emplace_back(time+n+1, count);
        }
    }
    return time;
}
`,
  alternatives: [
    {
      name: "Math formula",
      summary:
        "Only the most frequent task shapes the schedule: (maxCount − 1) blocks of size n+1, plus one slot per task tied at maxCount. Take max with len(tasks) for the no-idle case. O(1) after counting — but the heap simulation generalizes when the formula's assumptions break.",
      complexity: { time: "O(n)", space: "O(26)" },
      python: `from collections import Counter

def least_interval(tasks: list[str], n: int) -> int:
    counts = Counter(tasks)
    peak = max(counts.values())
    ties = sum(1 for c in counts.values() if c == peak)
    return max(len(tasks), (peak - 1) * (n + 1) + ties)`,
      java: `public int leastInterval(String[] tasks, int n) {
    Map<String, Integer> counts = new HashMap<>();
    for (String t : tasks) {
        counts.put(t, counts.getOrDefault(t, 0) + 1);
    }
    int peak = 0;
    for (int c : counts.values()) if (c > peak) peak = c;
    int ties = 0;
    for (int c : counts.values()) if (c == peak) ties++;
    return Math.max(tasks.length, (peak - 1) * (n + 1) + ties);
}
`,
      cpp: `int leastInterval(const vector<string>& tasks, int n) {
    unordered_map<string,int> counts;
    for (const string& t : tasks) counts[t]++;
    int peak = 0;
    for (auto &p: counts) if (p.second > peak) peak = p.second;
    int ties = 0;
    for (auto &p: counts) if (p.second == peak) ties++;
    return max((int)tasks.size(), (peak - 1) * (n + 1) + ties);
}
`,
    },
  ],
}
