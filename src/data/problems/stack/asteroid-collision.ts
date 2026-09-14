import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "asteroid-collision",
  title: "Asteroids That Collide",
  pattern: "stack",
  difficulty: "medium",
  leetcode: "asteroid-collision",
  brief: "Right-movers meet left-movers; the larger survives.",
  statement:
    "Each value is an asteroid: its magnitude is the size and its sign the direction, positive moving right and negative moving left. Asteroids move at the same speed, so a collision happens only when a right-mover is immediately followed by a left-mover. The smaller one is destroyed; equal sizes destroy each other. Return the state once no more collisions can happen.",
  constraints: [
    "2 <= asteroids.length <= 10^4",
    "-1000 <= asteroids[i] <= 1000, and never 0",
    "a collision needs a POSITIVE on the left and a NEGATIVE on the right — two asteroids moving the same way never meet",
    "equal magnitudes destroy each other, so both disappear rather than one surviving",
  ],
  examples: [
    {
      input: "asteroids = [5, 10, -5]",
      output: "[5, 10]",
      note: "10 destroys −5, then nothing else can meet.",
    },
    {
      input: "asteroids = [8, -8]",
      output: "[]",
      note: "Equal sizes annihilate.",
    },
    {
      input: "asteroids = [10, 2, -5]",
      output: "[10]",
      note: "−5 destroys 2, survives, then meets 10 and loses. One arrival caused two collisions.",
    },
  ],
  hints: [
    "Which asteroid does a new left-mover meet first? The most recently surviving right-mover.",
    "That is a stack. Push right-movers; a left-mover has to fight its way down through them.",
    "One arrival can destroy several — so the fight is a loop, not a single comparison.",
  ],
  whyNow:
    "Sweeping the list repeatedly until nothing changes is correct but pays a whole pass for each collision, and a chain of them makes that quadratic. A stack makes the opponent explicit: the asteroid a newcomer meets is always the one on top, so every collision is resolved the moment it becomes possible and each asteroid is pushed and popped at most once.",
  arc: "The stack is holding survivors, and the whole problem is a case analysis that must be written before any code: a right-moving asteroid always survives for now, a left-moving one fights everything right-moving on the stack, and each fight either destroys the incoming one, the stack top, or both. The trap is the both-destroyed case, which must break out of the loop without pushing anything. Sweeping the array until nothing changes is the honest baseline and shows why the stack is worth it — collisions cascade, and a stack processes the cascade in one pass. The same shape solves 'remove adjacent duplicates' and other neighbour-annihilation problems.",
  approach:
    "Walk left to right holding the survivors on a stack. A right-mover is simply pushed. A left-mover fights: while the top of the stack is a right-mover smaller than it, pop — those are destroyed. If the top is equal, both are destroyed and the newcomer stops. If the top is larger, the newcomer is destroyed. Only if the stack empties, or its top is itself a left-mover, does the newcomer survive and get pushed. The three outcomes of one comparison — pop and continue, both die, newcomer dies — are the whole problem.",
  complexity: { time: "O(n)", space: "O(n)" },
  python: `def asteroid_collision(asteroids: list[int]) -> list[int]:
    stack: list[int] = []
    for a in asteroids:
        alive = True
        while alive and a < 0 and stack and stack[-1] > 0:
            if stack[-1] < -a:
                stack.pop()
                continue
            if stack[-1] == -a:
                stack.pop()
            alive = False
        if alive:
            stack.append(a)
    return stack`,
  java: `public int[] asteroidCollision(int[] asteroids) {
    List<Integer> stack = new ArrayList<>();
    for (int a : asteroids) {
        boolean alive = true;
        while (alive && a < 0 && !stack.isEmpty() && stack.get(stack.size() - 1) > 0) {
            int top = stack.get(stack.size() - 1);
            if (top < -a) {
                stack.remove(stack.size() - 1);
                continue;
            }
            if (top == -a) stack.remove(stack.size() - 1);
            alive = false;
        }
        if (alive) stack.add(a);
    }
    int[] out = new int[stack.size()];
    for (int i = 0; i < out.length; i++) out[i] = stack.get(i);
    return out;
}`,
  cpp: `vector<int> asteroidCollision(const vector<int>& asteroids) {
    vector<int> stack;
    for (int a : asteroids) {
        bool alive = true;
        while (alive && a < 0 && !stack.empty() && stack.back() > 0) {
            if (stack.back() < -a) {
                stack.pop_back();
                continue;
            }
            if (stack.back() == -a) stack.pop_back();
            alive = false;
        }
        if (alive) stack.push_back(a);
    }
    return stack;
}`,
  alternatives: [
    {
      name: "Sweep until nothing changes",
      summary:
        "Scan the list for an adjacent pair that would collide, resolve that one pair, and start over — repeating until a full scan finds nothing to do.",
      complexity: { time: "O(n²)", space: "O(n)" },
      python: `def asteroid_collision(asteroids: list[int]) -> list[int]:
    current = list(asteroids)
    changed = True
    while changed:
        changed = False
        for i in range(len(current) - 1):
            if current[i] > 0 and current[i + 1] < 0:
                left, right = current[i], -current[i + 1]
                if left < right:
                    current.pop(i)
                elif left > right:
                    current.pop(i + 1)
                else:
                    current.pop(i + 1)
                    current.pop(i)
                changed = True
                break
    return current`,
      java: `public int[] asteroidCollision(int[] asteroids) {
    List<Integer> current = new ArrayList<>();
    for (int a : asteroids) current.add(a);
    boolean changed = true;
    while (changed) {
        changed = false;
        for (int i = 0; i + 1 < current.size(); i++) {
            if (current.get(i) > 0 && current.get(i + 1) < 0) {
                int left = current.get(i);
                int right = -current.get(i + 1);
                if (left < right) {
                    current.remove(i);
                } else if (left > right) {
                    current.remove(i + 1);
                } else {
                    current.remove(i + 1);
                    current.remove(i);
                }
                changed = true;
                break;
            }
        }
    }
    int[] out = new int[current.size()];
    for (int i = 0; i < out.length; i++) out[i] = current.get(i);
    return out;
}`,
      cpp: `vector<int> asteroidCollision(const vector<int>& asteroids) {
    vector<int> current = asteroids;
    bool changed = true;
    while (changed) {
        changed = false;
        for (int i = 0; i + 1 < (int)current.size(); i++) {
            if (current[i] > 0 && current[i + 1] < 0) {
                int left = current[i];
                int right = -current[i + 1];
                if (left < right) {
                    current.erase(current.begin() + i);
                } else if (left > right) {
                    current.erase(current.begin() + i + 1);
                } else {
                    current.erase(current.begin() + i + 1);
                    current.erase(current.begin() + i);
                }
                changed = true;
                break;
            }
        }
    }
    return current;
}`,
    },
  ],
}
