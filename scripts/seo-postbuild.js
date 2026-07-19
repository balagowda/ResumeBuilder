// Generates static HTML entry points for client-side routes so GitHub Pages
// serves them with HTTP 200 instead of falling back to 404.html.
// Each copy gets a route-specific title, description, and canonical URL.
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const SITE_URL = 'https://balagowda.github.io/ResumeBuilder';

const ROUTES = [
  {
    dir: 'templates',
    title: 'Free Resume Templates — 25+ ATS-Friendly Designs | ResumeBuilder',
    description:
      'Browse 25+ free professional resume templates. All designs are ATS-friendly and download as PDF — no sign-up, no watermark, 100% private.',
  },
];

const indexHtml = fs.readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');

for (const route of ROUTES) {
  const url = `${SITE_URL}/${route.dir}/`;
  let html = indexHtml
    .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
    .replace(
      /(<meta name="description" content=")[^"]*(")/,
      `$1${route.description}$2`
    )
    .replace(
      /(<link rel="canonical" href=")[^"]*(")/,
      `$1${url}$2`
    )
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${route.title}$2`)
    .replace(
      /(<meta property="og:description" content=")[^"]*(")/,
      `$1${route.description}$2`
    )
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);

  const outDir = path.join(BUILD_DIR, route.dir);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  console.log(`Created ${route.dir}/index.html`);
}
