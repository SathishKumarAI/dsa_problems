const ids = {
  "linked-list": ["reverse-list","cycle-detect","merge-two-sorted","middle-of-list","palindrome-list","remove-nth-from-end","add-two-numbers","odd-even-list","remove-list-elements","reorder-list","rotate-list","swap-pairs"],
  "trees": ["max-depth","validate-bst","level-order","same-tree","invert-tree","balanced-tree","bst-ancestor"],
}
for (const [pat, list] of Object.entries(ids)) {
  for (const id of list) {
    const m = await import(`./src/data/problems/${pat}/${id}.ts`)
    const p = m.problem
    console.log("\n########## " + p.id + "  [" + p.difficulty + "] " + p.title)
    console.log("STATEMENT: " + p.statement)
    console.log("CONSTRAINTS: " + (p.constraints||[]).join(" | "))
    console.log("ARC?: " + (p.arc ? "YES" : "MISSING"))
    if (p.whyNow) console.log("TOP whyNow: " + p.whyNow)
    console.log("APPROACH: " + p.approach)
    console.log("COMPLEXITY: " + JSON.stringify(p.complexity))
    ;(p.alternatives||[]).forEach((a,i)=>{
      console.log(`  --- alt${i+1}: ${a.name} ${JSON.stringify(a.complexity)}`)
      console.log("      summary: " + a.summary)
      if (a.whyNow) console.log("      whyNow: " + a.whyNow)
    })
  }
}
