# Interactive Book - minimal skeleton

This project is designed to be **easy to write in**: content lives in Markdown files inside `chapters/`.

## Where to write

- Edit chapters in `chapters/*.md`
- To add a chapter, create a new `.md` file and register it in `chapters/chapters.json`
- Start from `chapters/chapter-template.md` when creating a new chapter
- Write all content in English

## Useful basic syntax

- Title: `# Title`
- Subtitle: `## Subtitle`
- List: `- item`
- Bold: `**text**`
- Quote: `> note`

## Built-in interactive blocks

In chapter text you can insert special lines:

- `:::entropy-slider:::`
- `:::binary-riddle:::`
- `:::coin-convergence:::`

When the page loads, these tags become interactive widgets.

## Editorial media blocks (frozen fields)

You can also use structured blocks with frozen fields:

- `figure`: `src` required, optional `alt`, `caption`, `layout`
- `figure-step`: `frames` (recommended) or `src`, optional `alt`, `caption`, `layout`, `step-captions`
- `embed`: `src` required, optional `title`, `caption`, `height`, `layout`

See [CHEAT_SHEET.md](/Users/janalopi/Library/Mobile%20Documents/com~apple~CloudDocs/AAA%20ACCADEMIA/2026-202X%20RTDa%20Cattolica/Base%20libro/CHEAT_SHEET.md) for exact templates.

## Dual teaching mode (slide + textbook)

Use expandable teaching points with this syntax:

```md
:::details Point title
Short explanation, examples, or notes.
:::end:::
```

- In `Slide` mode, points stay collapsed (outline style for lecturing)
- In `Textbook` mode, points open automatically (full reading mode)
- Students can still open/close individual points manually

In `Slide` mode:

- Every `##` heading becomes one slide
- Click the slide title to reveal the next point under it
- After all points are visible, click again to jump to the next `##` slide
- Use the top arrows (`←` `→`) to navigate slides
- Use the `Full screen` button in slide mode for lecture display
- If a point is written with `:::details ...`, it appears in compact (closed) form when revealed
- `←` is strict undo: each click restores the exact previous state (including hiding the last revealed point)

## Chapter index and subchapters

- The left chapter menu automatically expands subchapters for the active chapter
- Subchapters are generated from `##` headings
- Clicking a subchapter jumps to that section in `Textbook` mode
- In `Slide` mode, clicking a subchapter jumps to the corresponding slide

## Run locally (very simple)

Serve the folder with a static server, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
