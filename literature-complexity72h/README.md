# Paper Library Site

A static site ready for GitHub Pages with:

- the full paper list
- filters by macro-category and keyword
- free-text search across title, author, source, and OpenAlex keywords
- popup summaries rendered from the local Markdown files
- direct links to local PDFs

## Structure

- `index.html`: main page
- `style.css`: minimal list-based interface
- `app.js`: filtering and rendering logic
- `data/papers.json`: readable dataset
- `data/papers.js`: browser-ready dataset
- `pdf/`: copy of the paper PDFs
- `summaries/`: copy of the Markdown summaries used by the popup viewer

## Regeneration

From the project root:

```bash
python3 build_paper_library_site.py
```

The command updates the data and duplicates the PDFs into `paper-library-site/pdf/`
and the Markdown summaries into `paper-library-site/summaries/`.

## Publishing

You can upload the contents of `paper-library-site/` to a GitHub repository and
publish it with GitHub Pages as a static website.
