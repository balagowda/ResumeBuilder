# HatchResume — Free Online Resume Builder

**Live site:** [https://hatchresume.com](https://hatchresume.com)

A 100% free, privacy-first resume builder. Pick one of 25+ professional, ATS-friendly templates, fill in your details, and download your resume as a PDF — no sign-up, no watermark, and your data never leaves the browser.

## Features

- **25+ free professional templates** — browse them at [/templates](https://hatchresume.com/templates/), one page per design
- **ATS-friendly layouts** that parse cleanly in applicant tracking systems
- **Standalone ATS checker** at [/ats-resume-checker](https://hatchresume.com/ats-resume-checker/) — paste any resume for a structural and writing score, no account
- **Resume examples by role** at [/examples](https://hatchresume.com/examples/) — complete resumes that load straight into the editor
- **Job description matching** — paste a posting and see which of its keywords your resume is missing, scored and ranked, entirely in-browser
- **Writing review** — flags weak openers, passive voice, unquantified claims, repeated verbs and common misspellings as you type
- **Two PDF exports** — a one-click text-based ATS PDF built with jsPDF (selectable text, clickable links, clean page breaks), and a pixel-exact image one for printing; the browser's print-to-PDF remains as a styled text fallback
- **Version compare** — side-by-side diff of any two saved resumes, showing exactly which fields differ
- **Complete backups** — one JSON file round-trips every resume with its name, section order and template
- **Self-hosted fonts** — Inter, Lato and Source Serif 4 are bundled (latin subset); no Google Fonts request, so visiting the site sends nothing to any third party
- **Page overflow protection** — warns when content runs onto a second page, with one-click "fit to one page" resizing and multi-page PDF export
- **No login required** — start building immediately
- **Instant PDF download** via html2pdf/jsPDF
- **Complete privacy** — everything runs client-side; nothing is stored on a server
- **Drag-and-drop section reordering** powered by dnd-kit

## Tech Stack

- [React 19](https://react.dev/) with [React Router 7](https://reactrouter.com/) (Create React App)
- [@dnd-kit](https://dndkit.com/) for drag-and-drop
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) / [jsPDF](https://github.com/parallax/jsPDF) / [html2canvas](https://html2canvas.hertzen.com/) for PDF export
- Hosted on **GitHub Pages** (deployed with `gh-pages`)

## Getting Started

```bash
npm install
npm start
```

The dev server runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Run the app in development mode |
| `npm run build` | Production build into `build/`, then runs `scripts/seo-postbuild.js` |
| `npm run deploy` | Build and publish `build/` to the `gh-pages` branch (GitHub Pages), then ping IndexNow |
| `npm run indexnow` | Tell Bing/Yandex/Seznam that the URLs changed (Google is notified via Search Console) |
| `npm run og:image` | Re-render `public/og-image.png` from `scripts/og-image.html` (needs Chrome) |
| `npm test` | Run the test suite |

## SEO and discoverability

The app is a client-rendered SPA on GitHub Pages, so search engines and AI
crawlers need help seeing it:

- **The brand name is stated in prose.** `HatchResume` appears in the `<title>`,
  the `<h1>`, the footer, and the `Organization`/`WebSite` structured data.
  Without that, nothing connects the query "hatchresume" to this site.
- **Every route is pre-rendered.** `scripts/seo-postbuild.js` writes a real
  static HTML document per route into `build/<route>/index.html`, with its own
  title, description, canonical, JSON-LD, and the page's actual text inside
  `<div id="seo-static">`. Crawlers that never run JavaScript — Googlebot's
  first pass, GPTBot, PerplexityBot, link unfurlers — read that copy, and
  GitHub Pages serves those URLs with HTTP 200 instead of the 404 shim. That is
  35 URLs: the home page, the gallery, one page per template, the examples, the
  ATS checker and the content pages.
- **One source of content.** Page copy lives in `src/seo/` — `contentPages.mjs`
  (/about, /faq, /alternatives), `exampleResumes.mjs` (the role examples) and
  `pageMeta.mjs` (titles, descriptions, per-template copy) — and is rendered
  both by the React components and by the pre-render script, so what a crawler
  reads and what a visitor sees cannot drift apart. Adding a template or an
  example gives you a page, a sitemap entry and internal links from one edit.
- **The landing page is small.** Routes below it are `React.lazy`, so the first
  visit no longer downloads all 25 template renderers plus jsPDF and
  html2canvas: the main bundle is ~89 kB gzipped rather than ~282 kB.
- **The editor routes get a shell too.** `/template<id>` is pre-rendered as a
  `noindex, follow` document so the "use this template" links resolve to a real
  200 instead of the 404-plus-JavaScript-redirect the SPA shim used to serve.
  The indexable version of a template is its own `/templates/<slug>/` page.
- **`sitemap.xml` and `llms.txt` are generated at build time** from the same
  route list, so they never go stale. Neither is checked into `public/`.
  `lastmod` comes from `CONTENT_UPDATED` in `src/seo/pageMeta.mjs` (or a page's
  own `updated` field) — **bump it when you change page copy**, rather than
  letting every deploy claim every page changed.
- **`robots.txt` names the AI crawlers explicitly** — a bot that matches its own
  user-agent group obeys only that group.

After deploying a change worth indexing: submit the sitemap in Google Search
Console (Google ignores IndexNow) and let `postdeploy` handle Bing.

## Tests

```bash
npm test
```

Four suites: an App shell smoke test (landing page renders, footer links, a
content route and its document title), the ATS checker rules, the route data
that feeds the pre-render script and the sitemap, and the pre-render output
itself — every route has one `<h1>` and real body text, every internal link and
schema URL resolves to a page that is actually generated, and the sitemap lists
the indexable routes and omits the noindex shells. None of those failures throw
at build time; they just quietly stop a page being indexed.

Two workarounds live in config because React Router 7 is newer than the Jest
that Create React App 5 ships:

- `package.json` maps `react-router-dom` and `react-router/dom` straight to
  their `dist` files. The package declares a `main` that does not exist and
  relies on its `exports` map, which this Jest does not read. **If you upgrade
  React Router, check those paths still exist.**
- `src/setupTests.js` polyfills `TextEncoder`/`TextDecoder` from Node, which
  Router 7 uses at import time and this jsdom does not provide.

Neither affects the build: webpack resolves both correctly on its own.

## Project Structure

```
public/
  index.html            # SEO meta tags, structured data, #seo-static crawler content
  404.html              # SPA redirect shim for GitHub Pages (noindex)
  robots.txt            # Crawl rules, including explicit AI-crawler groups
  og-image.png          # 1200x630 share card (generated, see scripts/og-image.html)
  <indexnow-key>.txt    # IndexNow ownership proof — must stay at the site root
  templates/            # Template preview images
scripts/
  seo-postbuild.js      # Pre-renders each route, generates sitemap.xml and llms.txt
  ping-indexnow.js      # Pushes changed URLs to IndexNow after deploy
  og-image.html         # Source for the share card — npm run og:image to rebuild
src/
  components/           # LandingPage, HomePage, TemplateWorkspace, ContentPage, JobMatch
    TemplateDetail.js   # One landing page per template (/templates/<slug>)
    ResumeExamples.js   # /examples hub and per-role example pages
    AtsChecker.js       # /ats-resume-checker
    templateMeta.mjs    # Template catalogue metadata, shared with the build scripts
  seo/
    contentPages.mjs    # Copy for /about, /faq, /alternatives (app + pre-render)
    exampleResumes.mjs  # Full resume examples, in the editor's own data shape
    pageMeta.mjs        # Titles, descriptions and shared copy for generated pages
    useDocumentMeta.js  # Keeps title/description/canonical in sync on SPA navigation
  utils/
    keywordMatch.js     # Job-description keyword extraction and resume matching
    contentLint.js      # Writing rules, shared by the editor and the ATS checker
    atsCheck.js         # Structural ATS checks over pasted resume text
    pendingExample.js   # Hand-off from an example page into the editor
  Styles/               # Component styles
```
