# Building the visualisations — a Python-first cookbook

How the animations in this app actually work, how to rebuild the same idea in Python, and how to
extend it to the thing people most want to see inside a language model: **tokens, attention and
sampling**.

The rule throughout: **do not rebuild what already exists.** Every section names the open-source
project that already solves the problem and shows the smallest amount of glue that makes it useful.
Writing your own attention renderer is a month; wiring `circuitsvis` to a model is an afternoon.

> APIs drift. Every snippet here was written against the versions in the table at the bottom; if one
> has moved, the shape of the idea is still right even when the call is not.

---

## 1. The one idea worth stealing: a frame is data, not a drawing

Everything in this repo rests on a single decision. **The algorithm does not draw. It yields
frames.** A frame is a plain, JSON-safe record of what is true at one step, and something else
entirely decides what that looks like on screen.

That is why the same Two Sum generator drives the journey page, the problem-page walkthrough and the
API without knowing any of them exist. It is also why the engine can be tested in Node with no
browser: a test drains the generator and asserts on the records.

In this repo (`src/engine/`) that is a TypeScript generator. In Python it is exactly the same shape:

```python
# viz/algorithms/two_sum.py — the algorithm, and nothing else
from dataclasses import dataclass, field

@dataclass
class Frame:
    note: str                       # the sentence a learner reads
    line: int = -1                  # which pseudocode row to highlight
    focus: list[int] = field(default_factory=list)   # indices under inspection
    anchor: list[int] = field(default_factory=list)  # indices being held
    answer: list[int] = field(default_factory=list)  # the payoff
    extra: dict = field(default_factory=dict)        # panel-specific state

def two_sum(nums: list[int], target: int):
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        need = target - x
        yield Frame(
            note=f"at {i}, value {x} — I need {need}",
            line=2, focus=[i], extra={"seen": dict(seen), "need": need},
        )
        if need in seen:
            yield Frame(
                note=f"found it: positions {seen[need]} and {i}",
                line=3, answer=[seen[need], i],
            )
            return
        seen[x] = i
    yield Frame(note="no pair — the promise was broken", line=5)
```

Three properties fall out of this and they are the whole reason to do it:

| Property | Why it matters |
|---|---|
| Frames are data | you can test the algorithm without rendering anything |
| Frames are serialisable | the same run drives a notebook, a terminal, a video and a web page |
| Drawing is a pure function of a frame | a renderer is replaceable; the teaching is not |

**Test the frames, not the picture.** This is what `src/engine/journeys.test.ts` does — it drains
every generator, checks every frame narrates, and checks no step is skipped. The Python equivalent:

```python
def test_two_sum_narrates_and_finds():
    frames = list(two_sum([2, 7, 11, 15], 9))
    assert all(f.note for f in frames), "every frame must say something"
    assert frames[-1].answer == [0, 1]
```

---

## 2. Rendering, from cheapest to most beautiful

Pick by what you need, not by what looks impressive. Each of these consumes the *same* frames.

### 2.1 Terminal — `rich` (minutes)

The fastest honest feedback loop. Use it while you are still deciding what the animation should say.

```python
from rich.console import Console
from rich.text import Text

console = Console()

def draw(nums, frame):
    line = Text()
    for i, v in enumerate(nums):
        style = ("bold green" if i in frame.answer else
                 "bold yellow" if i in frame.focus else
                 "cyan" if i in frame.anchor else "dim")
        line.append(f" {v:>3} ", style=style)
    console.print(line)
    console.print(f"  {frame.note}\n", style="italic")

for f in two_sum([2, 7, 11, 15], 9):
    draw([2, 7, 11, 15], f)
```

For a live, redrawing view use `rich.live.Live`; for a full TUI, `textual` (same authors) gives you
panels, scrollback and key handling without writing an event loop.

### 2.2 Notebook / static — `matplotlib` (an hour)

Best when the point is a *chart* rather than a scene: cost curves, bar heights, a heatmap of a DP
table.

```python
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

def animate(nums, frames, path="two_sum.gif"):
    fig, ax = plt.subplots(figsize=(8, 3))
    bars = ax.bar(range(len(nums)), nums, color="#89b4fa")
    caption = ax.text(0.5, -0.18, "", transform=ax.transAxes, ha="center")

    def render(f):
        for i, bar in enumerate(bars):
            bar.set_color("#a6e3a1" if i in f.answer else
                          "#f9e2af" if i in f.focus else "#89b4fa")
        caption.set_text(f.note)
        return [*bars, caption]

    FuncAnimation(fig, render, frames=frames, interval=900, repeat=False)\
        .save(path, writer="pillow")
```

`FuncAnimation` writes GIF or MP4 directly, which is what you want for a README.

### 2.3 Video — `manim` (a weekend, and worth it)

[Manim Community](https://www.manim.community/) is the 3Blue1Brown engine, maintained as an open
project. Reach for it when the artefact is a *lesson*, not a debugging aid. It thinks in objects and
transitions, so your frames become `Transform` calls:

```python
from manim import *

class TwoSum(Scene):
    def construct(self):
        nums = [2, 7, 11, 15]
        squares = VGroup(*[Square(0.9).add(Text(str(n))) for n in nums]).arrange(RIGHT)
        self.play(FadeIn(squares))
        for f in two_sum(nums, 9):
            self.play(*[squares[i].animate.set_fill(YELLOW, 0.5) for i in f.focus],
                      run_time=0.4)
            self.play(Write(Text(f.note, font_size=24).to_edge(DOWN)), run_time=0.6)
```

### 2.4 Web — reuse this repo

If the target is a web page, the honest advice is to reuse what is already here: `src/engine/`
yields the frames and `src/features/journey/panels.tsx` draws them. Adding a *new* shape means one
member on `PanelModel` and one case in `Panel` — the process is written down in
[`AUTHORING.md`](AUTHORING.md).

### 2.5 Do not write your own graph layout

For graphs and trees, `networkx` computes the layout and hands you coordinates; render them with
matplotlib, or export to `graphviz` for something publication-grade. `pyvis` gives an interactive
HTML graph in about five lines. None of this is worth writing yourself.

---

## 3. Visualising a language model

This is the part people most want and most often rebuild badly. Almost all of it already exists.

### 3.1 Tokens — what the model actually reads

The first genuinely useful visual: the string a human sees versus the tokens a model sees. Use
[`tiktoken`](https://github.com/openai/tiktoken) for OpenAI encodings or `transformers`' tokenizer
for anything on the Hub.

```python
import tiktoken
from rich.console import Console
from rich.text import Text

enc = tiktoken.get_encoding("cl100k_base")
palette = ["#f38ba8", "#fab387", "#f9e2af", "#a6e3a1", "#89b4fa", "#cba6f7"]

def show_tokens(s: str) -> None:
    out = Text()
    for i, tok in enumerate(enc.encode(s)):
        piece = enc.decode([tok]).replace("\n", "\\n")
        out.append(piece, style=f"black on {palette[i % len(palette)]}")
    Console().print(out)
    Console().print(f"{len(s)} characters → {len(enc.encode(s))} tokens\n")

show_tokens("Understanding tokenisation is the first step.")
show_tokens("indivisible antidisestablishmentarianism 你好 🙂")
```

Run those two lines and the lesson teaches itself: whitespace attaches to the *following* word,
common words are one token, rare words shatter, and non-Latin scripts and emoji cost several tokens
each. That single colour strip explains context limits, non-English pricing and why models miscount
letters — better than any paragraph.

**Already built, if you want a UI instead of a script:** the
[Xenova tokenizer playground](https://github.com/xenova/transformers.js) (transformers.js, runs in
the browser, no server) and `circuitsvis.tokens.colored_tokens`, below.

### 3.2 Attention — who looked at whom

Do not write an attention renderer. Two mature projects cover it:

- **[BertViz](https://github.com/jessevig/bertviz)** — the classic. Three views: `head_view` (which
  token attends to which, per head), `model_view` (every layer at once), `neuron_view` (the query ·
  key arithmetic). Works in Jupyter with any HuggingFace model that returns attentions.
- **[CircuitsVis](https://github.com/TransformerLensOrg/CircuitsVis)** — React components with a
  Python API, designed for interpretability work; also gives you `colored_tokens` for §3.1.

```python
from transformers import AutoModel, AutoTokenizer
from bertviz import head_view

name = "distilbert-base-uncased"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModel.from_pretrained(name, output_attentions=True)

inputs = tok("the cat sat on the mat because it was warm", return_tensors="pt")
attn = model(**inputs).attentions            # tuple: one tensor per layer
head_view(attn, tok.convert_ids_to_tokens(inputs["input_ids"][0]))
```

The teaching moment is the pronoun: watch which heads connect *it* back to *cat* versus *mat*.

### 3.3 Internals — `transformer-lens` / `nnsight`

For "what is happening inside", [TransformerLens](https://github.com/TransformerLensOrg/TransformerLens)
caches every intermediate activation with one call, and [nnsight](https://nnsight.net/) does the same
for larger models you cannot hold locally.

```python
from transformer_lens import HookedTransformer

model = HookedTransformer.from_pretrained("gpt2-small")
logits, cache = model.run_with_cache("The capital of France is")
cache["blocks.0.attn.hook_pattern"].shape   # (batch, head, query, key)
```

Pair the cached tensors with CircuitsVis and you have a research-grade viewer for the price of glue.

### 3.4 Sampling — the part that is usually invisible

The most under-served visual, and easy to build because there is nothing to reuse: show the
probability distribution at each generated step, and what temperature and top-p do to it.

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

tok = AutoTokenizer.from_pretrained("gpt2")
model = AutoModelForCausalLM.from_pretrained("gpt2")

def next_token_table(prompt: str, k: int = 10, temperature: float = 1.0):
    ids = tok(prompt, return_tensors="pt").input_ids
    logits = model(ids).logits[0, -1] / temperature
    probs = torch.softmax(logits, dim=-1)
    top = torch.topk(probs, k)
    return [(tok.decode([i]), round(p.item(), 4))
            for p, i in zip(top.values, top.indices)]

for t in (0.2, 1.0, 1.8):
    print(t, next_token_table("The capital of France is", temperature=t)[:5])
```

Print that as a bar chart per step and temperature stops being folklore: at 0.2 one bar towers, at
1.8 the field flattens. Add a cumulative line and top-p becomes a visible cut across it.

### 3.5 Architecture and training

- **[Netron](https://github.com/lutzroeder/netron)** — drop in an ONNX/TorchScript file, get an
  interactive graph of the network. Never draw a model diagram by hand again.
- **[bbycroft.net/llm](https://github.com/bbycroft/llm-viz)** — a 3D walkthrough of GPT inference,
  open source, superb for intuition about what a matrix multiply is doing.
- **TensorBoard** or **Weights & Biases** for training curves. Both are solved problems.

---

## 4. Applying it back to this repo

If you want a new visual *here* rather than in Python, the path is short and written down:

| Step | Where |
|---|---|
| Decide what the frame must carry | `src/engine/types.ts` — the frame's extra fields |
| Add the panel shape | `PanelModel` in `types.ts`, a case in `panels.tsx` |
| Say what it draws and what it assumes | a row in [`AUTHORING.md`](AUTHORING.md) §render kinds |
| Prove it | a UI check in `test/ui-smoke.test.mjs`, as the `bars` kind did |

The `bars` kind (Widest Container) is the worked example: one member on the union, one renderer, one
row in the docs, one browser check that asserts the water spans the right columns.

---

## 5. Tools, one line each

| Tool | Use it for | Licence |
|---|---|---|
| [rich](https://github.com/Textualize/rich) / [textual](https://github.com/Textualize/textual) | terminal frames while you iterate | MIT |
| [matplotlib](https://matplotlib.org/) | charts, GIF/MP4 export | PSF-like |
| [manim](https://www.manim.community/) | lesson-grade video | MIT |
| [networkx](https://networkx.org/) + [pyvis](https://github.com/WestHealth/pyvis) | graph layout, interactive HTML | BSD / BSD |
| [tiktoken](https://github.com/openai/tiktoken) | OpenAI tokenisation | MIT |
| [transformers](https://github.com/huggingface/transformers) | models and tokenizers | Apache-2.0 |
| [BertViz](https://github.com/jessevig/bertviz) | attention head/model/neuron views | Apache-2.0 |
| [CircuitsVis](https://github.com/TransformerLensOrg/CircuitsVis) | coloured tokens, attention components | MIT |
| [TransformerLens](https://github.com/TransformerLensOrg/TransformerLens) | cached activations | MIT |
| [nnsight](https://nnsight.net/) | internals of models too big to host | MIT |
| [Netron](https://github.com/lutzroeder/netron) | model architecture graphs | MIT |
| [llm-viz](https://github.com/bbycroft/llm-viz) | 3D GPT inference walkthrough | MIT |

Check the licence before vendoring anything; the list above is what was stated by each project at
the time of writing, not legal advice.

---

## 6. The mistakes worth skipping

1. **Drawing inside the algorithm.** The moment `print()` or a canvas call appears in your loop, the
   algorithm is no longer testable and no longer reusable. Yield frames.
2. **Animating everything.** Motion should carry meaning — a value moving, a candidate being
   eliminated. Decoration competes with the thing you are teaching.
3. **Rebuilding attention viewers.** BertViz and CircuitsVis exist and are better than a first
   attempt. Spend the time on what you want to *say* about the picture.
4. **Skipping the boring visual.** A coloured strip of tokens is unglamorous and explains more per
   pixel than any 3D scene.
5. **Trusting a picture.** A visualisation showing the wrong thing convincingly is worse than none.
   Test the frames; this repo has two content bugs on record that looked perfectly plausible on
   screen and were caught by assertions.
