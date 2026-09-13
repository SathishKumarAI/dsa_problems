import fs from "node:fs"

const edits = [
  [
    "linked-list/swap-pairs",
    [
      [
        "exchanging payloads is two lines, leaves every node exactly where it was, prints correctly, and is wrong the moment",
        "exchanging payloads is two lines, leaves every node where it was, and is wrong the moment",
      ],
      [
        "The array buys a second copy of the whole list to look one step ahead, which the pair itself is already pointing at.",
        "The array buys a second copy of the list to see one node ahead, which the pair already points at.",
      ],
      [
        " — but with nothing in front of the head it must remember the answer before it starts and skip the relink on the first pair, two branches that exist only because the head has no predecessor.",
        ", but with nothing in front of the head it must remember the answer before it starts and skip the relink on the first pair — two branches that exist only because the head has no predecessor.",
      ],
    ],
  ],
  [
    "linked-list/remove-list-elements",
    [
      [
        "Rebuilding from the surviving values is linear and replaces every node you were handed with a copy. Recursion keeps the real nodes and keeps ten thousand frames along with them.",
        "Rebuilding from the surviving values is linear and replaces every node you were handed with a copy; recursion keeps the real nodes and ten thousand frames with them.",
      ],
      [
        "The dummy node deletes that duplication: with a node in front of the head, the head is an ordinary node, one loop covers everything, and dummy.next is right whether nothing went, the front went, or all of it did.",
        "The dummy node deletes that duplication: with a node in front of the head, the head is ordinary, one loop covers everything, and dummy.next is right whether nothing went, the front went, or all of it did.",
      ],
    ],
  ],
  [
    "linked-list/odd-even-list",
    [
      [
        "Collecting the values into two arrays is finally linear, but it rebuilds the list out of copies — a quiet data-loss bug the moment a node carries more than an int, or anyone outside holds a pointer into it. Parking the real even nodes in an array fixes that and still buys memory to remember an order the nodes can remember themselves, by pointing at each other.",
        "Collecting the values into two arrays is finally linear, but it rebuilds the list out of copies — a quiet data-loss bug the moment a node carries more than an int, or anyone outside holds a pointer into it. Parking the real even nodes in an array fixes that and still buys memory to remember an order the nodes can remember by pointing at each other.",
      ],
      [
        "Keep the weave itself: odd.next jumps to even.next, even.next jumps to the new odd, and one saved pointer to the even head splices the chains at the end.",
        "Keep the weave: odd.next jumps to even.next, even.next jumps to the new odd, and one saved pointer to the even head splices the chains at the end.",
      ],
    ],
  ],
  [
    "linked-list/reorder-list",
    [
      [
        "Copying the values out gives every position in one step, then writes the answer back into nodes that never moved — which reorders what the list PRINTS, not what it is. Holding the nodes and consuming them from both ends genuinely relinks, at the price of a second copy of a list that can already do this for itself.",
        "Copying the values out gives every position in one step, then writes the answer back into nodes that never moved — reordering what the list PRINTS, not what it is. Holding the nodes and consuming them from both ends genuinely relinks, at the price of a second copy of a list that can already do this itself.",
      ],
      [
        "Three earlier problems used as subroutines, which is why middle-of-list and reverse-list are the two to know cold.",
        "Two earlier problems used as subroutines, which is why middle-of-list and reverse-list are the ones to know cold.",
      ],
    ],
  ],
  [
    "trees/validate-bst",
    [
      [
        "The in-order walk leans on a consequence, that a BST read in order is strictly increasing, and comparing each value with the one before it is correct, short, and leaves the rule looking like a coincidence you are trusting rather than an invariant you are enforcing.",
        "The in-order walk leans on a consequence — a BST read in order is strictly increasing — and comparing each value with the one before it is correct, short, and leaves the rule looking like a coincidence you trust rather than an invariant you enforce.",
      ],
      [
        "Know that bounds-passed-down shape cold — information travelling DOWN the recursion is the counterpart to the post-order return travelling up, and between them they cover most tree questions.",
        "Know that bounds-passed-down shape cold: information travelling DOWN the recursion is the counterpart to the post-order return travelling up, and between them they cover most tree questions.",
      ],
    ],
  ],
]

for (const [rel, pairs] of edits) {
  const path = `src/data/problems/${rel}.ts`
  let src = fs.readFileSync(path, "utf8")
  for (const [from, to] of pairs) {
    if (!src.includes(from)) { console.log("skip", rel); continue }
    src = src.replace(from, to)
  }
  fs.writeFileSync(path, src)
  const arc = /\n  arc:\n {4}"([^\n]*)",\n/.exec(src)
  console.log(rel, arc[1].length, "chars")
}
