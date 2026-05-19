# Editorial Cheat Sheet

This cheat sheet defines the frozen mini standard for figures and progressive figures.

## Core Rules

- Use `##` for each teaching unit (and slide unit).
- Keep each `##` short: 2-4 `:::details ...` points plus optional media blocks.
- Write content in plain Markdown and only use the blocks below for media.
- Use one-line interactive blocks when you want a reusable simulation.

## Interactive Blocks

```md
:::coin-convergence:::
```

Shows a coin-toss simulation for convergence in probability.

## Figure Block

Required fields:
- `src`

Optional fields:
- `alt`
- `caption`
- `layout` (`inline` or `wide`)

```md
:::figure
src: assets/chapters/information/figures/possibility-space.svg
alt: Possibility space represented as a set of alternatives
caption: Information selects one state among many.
layout: inline
:::
```

## Figure Step Block

Use this when you want one explicit visual step in progressive explanations.

Required fields:
- `frames` (comma-separated image paths) or `src` (single static image)

Optional fields:
- `alt`
- `caption`
- `layout` (`inline` or `wide`)
- `step-captions` (pipe-separated captions, one per frame)

```md
:::figure-step
frames: assets/chapters/information/figures/communication-step-1.svg, assets/chapters/information/figures/communication-step-2.svg, assets/chapters/information/figures/communication-step-3.svg
step-captions: Step 1: source and destination.|Step 2: add encoder and decoder.|Step 3: highlight channel noise.
caption: Progressive activation of the model.
layout: inline
:::
```

## Embed Block

Use this when you want to show a local HTML page inside the chapter.

Required fields:
- `src`

Optional fields:
- `title`
- `caption`
- `height`
- `layout` (`inline` or `wide`)

```md
:::embed
src: assets/chapters/introduction/websites/Preferential Attachment.html
title: Preferential attachment
height: 620
caption: A small embedded HTML page used as an interactive example.
layout: wide
:::
```

## Notes For Authors

- Keep file names lowercase, with hyphens, no spaces.
- Preferred folders:
  - `assets/chapters/<chapter-id>/figures/`
- Always include `alt` and `caption` when possible.
