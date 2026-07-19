# ResumeBuilder — Free Online Resume Builder

**Live site:** [https://balagowda.github.io/ResumeBuilder/](https://balagowda.github.io/ResumeBuilder/)

A 100% free, privacy-first resume builder. Pick one of 25+ professional, ATS-friendly templates, fill in your details, and download your resume as a PDF — no sign-up, no watermark, and your data never leaves the browser.

## Features

- **25+ free professional templates** — browse them at [/templates](https://balagowda.github.io/ResumeBuilder/templates/)
- **ATS-friendly layouts** that parse cleanly in applicant tracking systems
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

The dev server runs at [http://localhost:3000/ResumeBuilder](http://localhost:3000/ResumeBuilder).

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Run the app in development mode |
| `npm run build` | Production build into `build/`, then runs `scripts/seo-postbuild.js` |
| `npm run deploy` | Build and publish `build/` to the `gh-pages` branch (GitHub Pages) |
| `npm test` | Run the test suite |

## Project Structure

```
public/
  index.html            # SEO meta tags, structured data, static crawlable content
  404.html              # SPA redirect shim for GitHub Pages (noindex)
  sitemap.xml           # Submitted to Google Search Console
  templates/            # Template preview images
scripts/
  seo-postbuild.js      # Generates static route entry points after build
src/
  components/           # LandingPage, HomePage, TemplateWorkspace, templates, auth
  Styles/               # Component styles
```
