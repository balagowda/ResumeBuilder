// Post-build SEO step.
//
// Create React App ships a single index.html whose body is filled in by
// JavaScript. Googlebot renders JS eventually, but its first pass — and most
// AI crawlers (GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot) and every link
// unfurler — only read the HTML that comes off the wire. This script writes a
// real, static HTML document for each route so those clients see the actual
// page text, and generates the sitemap and llms.txt from the same route list.
//
// It also means GitHub Pages serves /about/, /faq/ etc. with HTTP 200 instead
// of falling back to 404.html.
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const BUILD_DIR = path.join(__dirname, '..', 'build');

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// The <title>, description and canonical are single-line tags in index.html;
// swapping them per route is a plain string replace.
const replaceMeta = (html, { title, description, url }) =>
  html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /(<meta name="description" content=")[^"]*(")/,
      `$1${escapeHtml(description)}$2`
    )
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`)
    .replace(
      /(<meta property="og:description" content=")[^"]*(")/,
      `$1${escapeHtml(description)}$2`
    )
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`)
    .replace(
      /(<meta name="twitter:description" content=")[^"]*(")/,
      `$1${escapeHtml(description)}$2`
    );

// The crawler-facing copy lives in #seo-static in public/index.html. The CRA
// build minifies the HTML and drops comments, so the block is identified by id
// rather than by comment markers. The non-greedy match stops at the first
// </div>, which is why that block must not contain nested <div>s — and why the
// route bodies generated below use only headings, paragraphs, lists and tables.
const SEO_STATIC_RE = /<div id="seo-static"([^>]*)>[\s\S]*?<\/div>/;

const replaceStaticBody = (html, body) => {
  if (!SEO_STATIC_RE.test(html)) {
    throw new Error(
      'No <div id="seo-static"> found in build/index.html — public/index.html ' +
        'must keep that element around the static crawler content.'
    );
  }
  return html.replace(SEO_STATIC_RE, (_match, attrs) => `<div id="seo-static"${attrs}>\n${body}\n</div>`);
};

// Structured data on sub-pages: keep the site/brand entity, describe this page,
// and add FAQPage markup where the page is a Q&A list.
const replaceJsonLd = (html, jsonLd) =>
  html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`
  );

async function main() {
  const { CONTENT_PAGES, SITE_URL, BRAND } = await import(
    pathToFileURL(path.join(__dirname, '..', 'src', 'seo', 'contentPages.mjs')).href
  );
  const { TEMPLATES, TEMPLATE_PAGES } = await import(
    pathToFileURL(path.join(__dirname, '..', 'src', 'components', 'templateMeta.mjs')).href
  );
  const { EXAMPLE_RESUMES, exampleSections } = await import(
    pathToFileURL(path.join(__dirname, '..', 'src', 'seo', 'exampleResumes.mjs')).href
  );
  const {
    templatePageMeta,
    templateCopy,
    examplePageMeta,
    EXAMPLES_HUB_META,
    ATS_CHECKER_META,
    ATS_CHECKER_COPY,
  } = await import(pathToFileURL(path.join(__dirname, '..', 'src', 'seo', 'pageMeta.mjs')).href);

  const indexHtml = fs.readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');
  const today = new Date().toISOString().slice(0, 10);

  const brandRef = { '@id': `${SITE_URL}/#organization` };
  const siteRef = { '@id': `${SITE_URL}/#website` };

  const breadcrumb = (name, url) => ({
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: BRAND, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name, item: url },
    ],
  });

  // ---------------------------------------------------------------------
  // Route definitions: the templates gallery plus every shared content page.
  // ---------------------------------------------------------------------
  const templatesBody = [
    `<h1>Free Resume Templates — ${TEMPLATES.length} ATS-Friendly Designs</h1>`,
    `<p>Every ${BRAND} template is free to use and free to download as a PDF — no account, no watermark, and no payment at the download step. Templates in the ATS-Optimized category use the single-column structure applicant tracking systems parse most reliably.</p>`,
    '<ul>',
    // Linked, so a crawler reaches all 25 template pages from here.
    ...TEMPLATE_PAGES.map(
      (t) =>
        `  <li><a href="${SITE_URL}${t.path}/"><strong>${escapeHtml(t.name)}</strong></a> (${escapeHtml(
          t.category
        )}, ${escapeHtml(t.layout.toLowerCase())}) — ${escapeHtml(t.description)} <em>${escapeHtml(
          t.tags.join(', ')
        )}</em></li>`
    ),
    '</ul>',
    `<p><a href="${SITE_URL}/">${BRAND} home</a> · <a href="${SITE_URL}/examples/">Resume examples</a> · <a href="${SITE_URL}/ats-resume-checker/">Free ATS checker</a> · <a href="${SITE_URL}/faq/">FAQ</a></p>`,
  ].join('\n');

  const routes = [
    {
      dir: 'templates',
      url: `${SITE_URL}/templates/`,
      title: `Free Resume Templates — ${TEMPLATES.length}+ ATS-Friendly Designs | ${BRAND}`,
      description: `Browse ${TEMPLATES.length}+ free professional resume templates on ${BRAND}. All designs are ATS-friendly and download as PDF — no sign-up, no watermark, 100% private.`,
      body: templatesBody,
      priority: '0.9',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': `${SITE_URL}/templates/#webpage`,
            url: `${SITE_URL}/templates/`,
            name: `Free Resume Templates — ${BRAND}`,
            isPartOf: siteRef,
            publisher: brandRef,
            about: brandRef,
          },
          {
            '@type': 'ItemList',
            name: `${BRAND} resume templates`,
            numberOfItems: TEMPLATES.length,
            itemListElement: TEMPLATES.map((t, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: t.name,
              description: t.description,
              url: `${SITE_URL}/template${t.id}`,
            })),
          },
          breadcrumb('Resume Templates', `${SITE_URL}/templates/`),
        ],
      },
    },
    ...CONTENT_PAGES.map((page) => {
      const url = `${SITE_URL}${page.path}/`;
      const parts = [`<h1>${escapeHtml(page.h1)}</h1>`];
      if (page.intro) parts.push(`<p>${escapeHtml(page.intro)}</p>`);

      for (const section of page.sections || []) {
        parts.push(`<h2>${escapeHtml(section.h2)}</h2>`);
        for (const paragraph of section.body || []) {
          parts.push(`<p>${escapeHtml(paragraph)}</p>`);
        }
        if (section.bullets) {
          parts.push('<ul>');
          parts.push(...section.bullets.map((item) => `  <li>${escapeHtml(item)}</li>`));
          parts.push('</ul>');
        }
        if (section.table) {
          parts.push('<table>');
          parts.push(
            `  <thead><tr>${section.table.headers
              .map((h) => `<th>${escapeHtml(h)}</th>`)
              .join('')}</tr></thead>`
          );
          parts.push('  <tbody>');
          parts.push(
            ...section.table.rows.map(
              (row) => `    <tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
            )
          );
          parts.push('  </tbody>');
          parts.push('</table>');
        }
      }

      if (page.faqs) {
        parts.push('<dl>');
        for (const item of page.faqs) {
          parts.push(`  <dt>${escapeHtml(item.q)}</dt>`);
          parts.push(`  <dd>${escapeHtml(item.a)}</dd>`);
        }
        parts.push('</dl>');
      }

      if (page.cta) {
        parts.push(
          `<p><a href="${SITE_URL}${page.cta.to}/">${escapeHtml(page.cta.label)}</a></p>`
        );
      }
      parts.push(
        `<p><a href="${SITE_URL}/">${BRAND} home</a> · <a href="${SITE_URL}/templates/">Free resume templates</a></p>`
      );

      const graph = [
        {
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: page.title,
          description: page.description,
          isPartOf: siteRef,
          publisher: brandRef,
          about: brandRef,
          inLanguage: 'en',
        },
        breadcrumb(page.navLabel, url),
      ];

      if (page.faqs) {
        graph.push({
          '@type': 'FAQPage',
          '@id': `${url}#faq`,
          mainEntity: page.faqs.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        });
      }

      return {
        dir: page.dir,
        url,
        title: page.title,
        description: page.description,
        body: parts.join('\n'),
        priority: '0.8',
        jsonLd: { '@context': 'https://schema.org', '@graph': graph },
      };
    }),

    // One page per template: /templates/<slug>/.
    ...TEMPLATE_PAGES.map((template) => {
      const url = `${SITE_URL}${template.path}/`;
      const meta = templatePageMeta(template);
      const copy = templateCopy(template);
      const related = TEMPLATE_PAGES.filter((t) => t.id !== template.id).slice(0, 4);

      return {
        dir: template.path.replace(/^\//, ''),
        url,
        title: meta.title,
        description: meta.description,
        priority: '0.7',
        body: [
          `<h1>${escapeHtml(template.name)} Resume Template</h1>`,
          `<p>${escapeHtml(template.description)}</p>`,
          '<ul>',
          `  <li>Layout: ${escapeHtml(template.layout)}</li>`,
          `  <li>Style: ${escapeHtml(template.category)}</li>`,
          `  <li>ATS parsing: ${template.atsFirst ? 'built for ATS first' : 'ATS-safe structure'}</li>`,
          `  <li>Price: free — no account, no watermark</li>`,
          `  <li>Tags: ${escapeHtml(template.tags.join(', '))}</li>`,
          '</ul>',
          `<h2>Is the ${escapeHtml(template.name)} template right for you?</h2>`,
          `<p>${escapeHtml(copy.layout)}</p>`,
          `<p>${escapeHtml(copy.ats)}</p>`,
          `<p><a href="${SITE_URL}/template${template.id}">Use the ${escapeHtml(
            template.name
          )} template</a></p>`,
          '<h2>Other free templates</h2>',
          '<ul>',
          ...related.map(
            (t) =>
              `  <li><a href="${SITE_URL}${t.path}/">${escapeHtml(t.name)}</a> — ${escapeHtml(
                t.category
              )}, ${escapeHtml(t.layout.toLowerCase())}</li>`
          ),
          '</ul>',
          `<p><a href="${SITE_URL}/templates/">All ${TEMPLATE_PAGES.length} free resume templates</a> · <a href="${SITE_URL}/examples/">Resume examples</a></p>`,
        ].join('\n'),
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              '@id': `${url}#webpage`,
              url,
              name: meta.title,
              description: meta.description,
              isPartOf: siteRef,
              publisher: brandRef,
              inLanguage: 'en',
            },
            {
              '@type': 'CreativeWork',
              '@id': `${url}#template`,
              name: `${template.name} resume template`,
              description: template.description,
              genre: 'Resume template',
              keywords: template.tags.join(', '),
              isAccessibleForFree: true,
              creator: brandRef,
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            },
            breadcrumb(template.name, url),
          ],
        },
      };
    }),

    // Resume examples: the hub and one page per role.
    {
      dir: 'examples',
      url: `${SITE_URL}/examples/`,
      title: EXAMPLES_HUB_META.title,
      description: EXAMPLES_HUB_META.description,
      priority: '0.8',
      body: [
        '<h1>Resume Examples by Job Title</h1>',
        `<p>Complete resumes, not fragments — written the way recruiters in each field actually read them. Open one in the ${BRAND} editor, replace the content with your own, and download a PDF. Free, no sign-up, and nothing you type leaves your browser.</p>`,
        '<ul>',
        ...EXAMPLE_RESUMES.map(
          (example) =>
            `  <li><a href="${SITE_URL}/examples/${example.slug}/">${escapeHtml(
              example.role
            )} Resume Example</a> — ${escapeHtml(example.summaryLine)}</li>`
        ),
        '</ul>',
        `<p><a href="${SITE_URL}/templates/">All ${TEMPLATE_PAGES.length} free resume templates</a> · <a href="${SITE_URL}/ats-resume-checker/">Free ATS resume checker</a></p>`,
      ].join('\n'),
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': `${SITE_URL}/examples/#webpage`,
            url: `${SITE_URL}/examples/`,
            name: EXAMPLES_HUB_META.title,
            description: EXAMPLES_HUB_META.description,
            isPartOf: siteRef,
            publisher: brandRef,
          },
          {
            '@type': 'ItemList',
            numberOfItems: EXAMPLE_RESUMES.length,
            itemListElement: EXAMPLE_RESUMES.map((example, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: `${example.role} Resume Example`,
              url: `${SITE_URL}/examples/${example.slug}/`,
            })),
          },
          breadcrumb('Resume examples', `${SITE_URL}/examples/`),
        ],
      },
    },

    ...EXAMPLE_RESUMES.map((example) => {
      const url = `${SITE_URL}/examples/${example.slug}/`;
      const meta = examplePageMeta(example);

      // The example itself is the page's reason to exist — a resume example
      // page with no resume on it has nothing for a crawler to rank.
      const resumeText = exampleSections(example).flatMap((section) => [
        `<h3>${escapeHtml(section.heading)}</h3>`,
        '<ul>',
        ...section.lines.filter(Boolean).map((line) => `  <li>${escapeHtml(line)}</li>`),
        '</ul>',
      ]);

      return {
        dir: `examples/${example.slug}`,
        url,
        title: meta.title,
        description: meta.description,
        priority: '0.8',
        body: [
          `<h1>${escapeHtml(example.role)} Resume Example (${escapeHtml(example.year)})</h1>`,
          `<p>${escapeHtml(example.intro)}</p>`,
          `<h2>Why this ${escapeHtml(example.role.toLowerCase())} resume works</h2>`,
          '<ul>',
          ...example.whatWorks.map((point) => `  <li>${escapeHtml(point)}</li>`),
          '</ul>',
          `<h2>${escapeHtml(example.data.fullName)} — ${escapeHtml(
            example.data.professionalTitle
          )}</h2>`,
          `<p>${escapeHtml(example.data.mail)} · ${escapeHtml(example.data.mobile)}${
            example.data.linkedin ? ` · ${escapeHtml(example.data.linkedin)}` : ''
          }</p>`,
          ...resumeText,
          `<p><a href="${SITE_URL}/template${example.templateId}">Build your own with this template</a></p>`,
          `<p><a href="${SITE_URL}/examples/">All resume examples</a> · <a href="${SITE_URL}/templates/">All free templates</a> · <a href="${SITE_URL}/ats-resume-checker/">Free ATS checker</a></p>`,
        ].join('\n'),
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Article',
              '@id': `${url}#article`,
              headline: `${example.role} Resume Example`,
              description: meta.description,
              url,
              isPartOf: siteRef,
              publisher: brandRef,
              author: brandRef,
              inLanguage: 'en',
            },
            breadcrumb(`${example.role} resume example`, url),
          ],
        },
      };
    }),

    // The ATS checker: the tool needs JavaScript, but what it checks and why
    // does not, and that is what the page has to rank on.
    {
      dir: 'ats-resume-checker',
      url: `${SITE_URL}/ats-resume-checker/`,
      title: ATS_CHECKER_META.title,
      description: ATS_CHECKER_META.description,
      priority: '0.9',
      body: [
        `<h1>${escapeHtml(ATS_CHECKER_COPY.h1)}</h1>`,
        `<p>${escapeHtml(ATS_CHECKER_COPY.lead)}</p>`,
        `<p>${escapeHtml(ATS_CHECKER_COPY.privacy)}</p>`,
        '<h2>What this checker looks at</h2>',
        '<ul>',
        ...ATS_CHECKER_COPY.checks.map((item) => `  <li>${escapeHtml(item)}</li>`),
        '</ul>',
        '<h2>What an ATS actually does</h2>',
        ...ATS_CHECKER_COPY.explainer.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`),
        `<p><a href="${SITE_URL}/templates/">Start from a free ATS-friendly template</a> · <a href="${SITE_URL}/examples/">See a complete example</a></p>`,
      ].join('\n'),
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': `${SITE_URL}/ats-resume-checker/#webpage`,
            url: `${SITE_URL}/ats-resume-checker/`,
            name: ATS_CHECKER_META.title,
            description: ATS_CHECKER_META.description,
            isPartOf: siteRef,
            publisher: brandRef,
            inLanguage: 'en',
          },
          {
            '@type': 'WebApplication',
            '@id': `${SITE_URL}/ats-resume-checker/#app`,
            name: `${BRAND} ATS Resume Checker`,
            url: `${SITE_URL}/ats-resume-checker/`,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Any',
            isAccessibleForFree: true,
            publisher: brandRef,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
          breadcrumb('ATS resume checker', `${SITE_URL}/ats-resume-checker/`),
        ],
      },
    },
  ];

  // ---------------------------------------------------------------------
  // Write one static HTML document per route.
  // ---------------------------------------------------------------------
  for (const route of routes) {
    let html = replaceMeta(indexHtml, route);
    html = replaceStaticBody(html, route.body);
    html = replaceJsonLd(html, route.jsonLd);

    const outDir = path.join(BUILD_DIR, route.dir);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log(`Pre-rendered ${route.dir}/index.html`);
  }

  // ---------------------------------------------------------------------
  // sitemap.xml — generated from the same route list so it can't go stale.
  // ---------------------------------------------------------------------
  const sitemapEntries = [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
    ...routes.map((route) => ({
      loc: route.url,
      priority: route.priority,
      changefreq: 'monthly',
    })),
  ];

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapEntries.map((entry) =>
      [
        '  <url>',
        `    <loc>${entry.loc}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        '  </url>',
      ].join('\n')
    ),
    '</urlset>',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), sitemap);
  console.log(`Generated sitemap.xml (${sitemapEntries.length} URLs)`);

  // ---------------------------------------------------------------------
  // llms.txt — a plain-text brief for LLM crawlers and answer engines, which
  // increasingly look for it instead of parsing a JavaScript-heavy page.
  // ---------------------------------------------------------------------
  const llms = [
    `# ${BRAND}`,
    '',
    `> ${BRAND} (${SITE_URL}) is a free online resume builder. It offers ${TEMPLATES.length}+ professional, ATS-friendly resume templates, a job-description keyword matcher, and one-click PDF export. There is no account, no watermark, and no paid tier: the app runs entirely in the visitor's browser and never uploads resume data to a server.`,
    '',
    '## Key facts',
    '',
    `- Name: ${BRAND} (also written "Hatch Resume"); website ${SITE_URL}`,
    '- Price: free, with no trial, subscription, or paid export',
    '- Sign-up: not required — there are no user accounts',
    `- Privacy: resume data is stored only in the visitor's browser (local storage); ${BRAND} has no backend and receives no resume content`,
    `- Templates: ${TEMPLATES.length}+ designs across ATS-Optimized, Professional and Creative categories`,
    '- Output: A4 print-resolution PDF generated client-side, single or multi-page',
    '',
    '## Pages',
    '',
    `- [Home — free resume builder](${SITE_URL}/): overview and the entry point to the editor`,
    `- [Resume templates](${SITE_URL}/templates/): the full ${TEMPLATES.length}-template gallery`,
    `- [ATS resume checker](${SITE_URL}/ats-resume-checker/): ${ATS_CHECKER_META.description}`,
    `- [Resume examples](${SITE_URL}/examples/): ${EXAMPLES_HUB_META.description}`,
    ...CONTENT_PAGES.map(
      (page) => `- [${page.navLabel}](${SITE_URL}${page.path}/): ${page.description}`
    ),
    '',
    '## Resume examples',
    '',
    ...EXAMPLE_RESUMES.map(
      (example) =>
        `- [${example.role} resume example](${SITE_URL}/examples/${example.slug}/): ${example.summaryLine}`
    ),
    '',
    '## Templates',
    '',
    ...TEMPLATE_PAGES.map(
      (t) =>
        `- [${t.name}](${SITE_URL}${t.path}/) (${t.category}, ${t.layout.toLowerCase()}): ${t.description}`
    ),
    '',
  ].join('\n');

  fs.writeFileSync(path.join(BUILD_DIR, 'llms.txt'), llms);
  console.log('Generated llms.txt');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
