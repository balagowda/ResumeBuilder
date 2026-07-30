# HatchResume — Free Online Resume Builder

**Live site:** [https://hatchresume.com](https://hatchresume.com)

A 100% free, privacy-first resume builder. Pick one of 25+ professional, ATS-friendly templates, fill in your details, and download your resume as a PDF — no sign-up, no watermark, and your data never leaves the browser.

## Features

- **25+ free professional templates** — browse them at [/templates](https://hatchresume.com/templates/)
- **ATS-friendly layouts** that parse cleanly in applicant tracking systems
- **Job description matching** — paste a posting and see which of its keywords your resume is missing, scored and ranked, entirely in-browser
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
  GitHub Pages serves those URLs with HTTP 200 instead of the 404 shim.
- **One source of content.** The text for `/about`, `/faq` and `/alternatives`
  lives in `src/seo/contentPages.mjs` and is rendered both by
  `src/components/ContentPage.js` (for visitors) and by the pre-render script
  (for crawlers), so the two cannot drift apart.
- **`sitemap.xml` and `llms.txt` are generated at build time** from the same
  route list, so they never go stale. Neither is checked into `public/`.
- **`robots.txt` names the AI crawlers explicitly** — a bot that matches its own
  user-agent group obeys only that group.

After deploying a change worth indexing: submit the sitemap in Google Search
Console (Google ignores IndexNow) and let `postdeploy` handle Bing.

## Project Structure

```
public/
  index.html            # SEO meta tags, structured data, #seo-static crawler content
  404.html              # SPA redirect shim for GitHub Pages (noindex)
  robots.txt            # Crawl rules, including explicit AI-crawler groups
  <indexnow-key>.txt    # IndexNow ownership proof — must stay at the site root
  templates/            # Template preview images
scripts/
  seo-postbuild.js      # Pre-renders each route, generates sitemap.xml and llms.txt
  ping-indexnow.js      # Pushes changed URLs to IndexNow after deploy
src/
  components/           # LandingPage, HomePage, TemplateWorkspace, ContentPage, JobMatch
    templateMeta.mjs    # Template catalogue metadata, shared with the build scripts
  seo/
    contentPages.mjs    # Copy for /about, /faq, /alternatives (app + pre-render)
  utils/
    keywordMatch.js     # Job-description keyword extraction and resume matching
  Styles/               # Component styles
```
