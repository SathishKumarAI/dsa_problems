# `components/figure` — drawings inside a reading flow

A figure here is never an image file. Every one is authored data (`Unlock.figure`)
drawn as DOM, so it themes, scales and reads to a screen reader like the rest of
the page.

## Change → file

| Change                                                                | File                    |
| --------------------------------------------------------------------- | ----------------------- |
| How much room a figure takes while reading, the fade, the "full size" | `frame.tsx`             |
| The cap itself (`--figure-inline`, `--figure-inline-tall`)            | `../../index.css`       |
| What a bound is drawn AS — bars, a span, cells                        | `constraint-figure.tsx` |
| A new figure kind                                                     | `../../data/types.ts` then `constraint-figure.tsx` |
| Where figures appear on the problem page                              | `../problem-statement.tsx` |

## The two rules

- **The cap is a maximum, never a size.** A figure shorter than the cap keeps its
  own height. A fixed box pads the two-bar figures and squashes the six-bar ones,
  which reads as a template rather than as a drawing of this bound.
- **Nothing is cut without a way out.** A clipped figure fades, says it is cut, and
  opens at full size over the page. The measurement is a `ResizeObserver`, not a
  guess from the number of items — a label that wraps changes the height.
