// Single source of truth for the content catalog — consumed by the landing
// hero (index.html) and the roadmap (problems/index.html). hrefs are
// root-relative; consumers prefix for their own depth. acts = ACT_ORDER
// length of each page, kept by hand (generate from PROBLEM objects past ~8).
const CATALOG = [
  {
    track: "Arrays · start here",
    href: "problems/two-sum.html",
    title: "Two Sum",
    sub: "LeetCode 1 — story → brute → faster → code it yourself",
    acts: 7,
  },
  {
    track: "Arrays · start here",
    href: "patterns/two-pointers.html",
    title: "Pattern: Two Pointers",
    sub: "the reusable shape Two Sum reveals — converge, chase, then build it",
    acts: 4,
    pattern: true,
  },
  {
    track: "Bits",
    href: "problems/single-number.html",
    title: "Single Number",
    sub: "LeetCode 136 — every element twice except one; find it faster",
    acts: 5,
  },
  {
    track: "Bits",
    ghost: true,
    title: "Pattern: XOR",
    sub: "coming after Single Number's machinery is complete",
  },
  {
    track: "Structures · why they exist",
    href: "structures/stack.html",
    title: "Stack",
    sub: "the undo button's secret — LIFO, then balanced brackets",
    acts: 3,
  },
  {
    track: "Structures · why they exist",
    href: "structures/queue.html",
    title: "Queue",
    sub: "fairness encoded — FIFO, then round-robin scheduling",
    acts: 3,
  },
  {
    track: "Structures · why they exist",
    ghost: true,
    title: "Heap · Tree",
    sub: "the scheduler's favorite and the filesystem's shape — coming next",
  },
];

// progress helpers shared by both pages
function catalogUnlocked(entry, prefix) {
  const key = "unlocked:" + new URL(prefix + entry.href, location.href).pathname;
  return Number(localStorage.getItem(key)) || 0;
}
