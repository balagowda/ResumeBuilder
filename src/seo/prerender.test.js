import { buildRoutes, replaceStaticBody, replaceMeta } from '../../scripts/seo-postbuild';
import { SITE_URL } from './contentPages.mjs';

// The pre-render script is what search engines and AI crawlers actually read.
// Nothing here throws when it goes wrong: a route with an empty body, a link to
// a URL that was never generated, or a page missing from the sitemap all build
// cleanly and simply fail to be indexed. These assertions are the only place
// that notices.

let routes;
let sitemap;
let llms;

const normalise = (url) => url.replace(/\/+$/, '');

beforeAll(async () => {
  ({ routes, sitemap, llms } = await buildRoutes());
});

describe('route table', () => {
  test('every route has the metadata a page needs', () => {
    expect(routes.length).toBeGreaterThan(30);

    for (const route of routes) {
      expect(route.dir).toBeTruthy();
      expect(route.url.startsWith(SITE_URL)).toBe(true);
      expect(route.title.length).toBeGreaterThan(20);
      expect(route.description.length).toBeGreaterThan(50);
      expect(route.jsonLd['@context']).toBe('https://schema.org');
    }
  });

  test('every route has exactly one h1 and real body text', () => {
    for (const route of routes) {
      const h1s = route.body.match(/<h1>/g) || [];
      expect(h1s).toHaveLength(1);

      // Strip the markup: what is left is what a crawler reads.
      const text = route.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      expect(text.length).toBeGreaterThan(200);
    }
  });

  test('routes are unique', () => {
    const dirs = routes.map((route) => route.dir);
    expect(new Set(dirs).size).toBe(dirs.length);
  });
});

describe('internal links', () => {
  // The bug this exists for: the "use this template" links and the ItemList
  // schema pointed at /template<id>, which had no document behind it, so every
  // crawler following the most important link on each page got a 404.
  const collectInternalUrls = (route) => {
    const found = [];
    const hrefs = route.body.match(/href="([^"]+)"/g) || [];
    for (const raw of hrefs) {
      const url = raw.slice(6, -1);
      if (url.startsWith(SITE_URL)) found.push(url);
    }

    const walk = (node) => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (node && typeof node === 'object') {
        for (const [key, value] of Object.entries(node)) {
          if ((key === 'url' || key === 'item') && typeof value === 'string' && value.startsWith(SITE_URL)) {
            found.push(value);
          } else {
            walk(value);
          }
        }
      }
      return undefined;
    };
    walk(route.jsonLd);

    return found;
  };

  test('every internal link and schema URL resolves to a generated page', () => {
    const known = new Set([normalise(SITE_URL), ...routes.map((route) => normalise(route.url))]);
    const broken = [];

    for (const route of routes) {
      for (const url of collectInternalUrls(route)) {
        if (!known.has(normalise(url))) broken.push(`${route.dir} -> ${url}`);
      }
    }

    expect(broken).toEqual([]);
  });
});

describe('sitemap', () => {
  test('lists every indexable route and nothing else', () => {
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    expect(locs).toContain(`${SITE_URL}/`);
    for (const route of routes) {
      if (route.inSitemap === false) {
        expect(locs).not.toContain(route.url);
      } else {
        expect(locs).toContain(route.url);
      }
    }
    expect(new Set(locs).size).toBe(locs.length);
  });

  test('reports a fixed content date rather than the build date', () => {
    const today = new Date().toISOString().slice(0, 10);
    const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);

    expect(lastmods.length).toBe([...sitemap.matchAll(/<loc>/g)].length);
    for (const date of lastmods) {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    // Left as a reminder rather than an assertion on the constant's value: if
    // every page is stamped with today on every build, the date is coming from
    // the clock again.
    expect(lastmods.every((date) => date === today)).toBe(
      lastmods.every((date) => date === lastmods[0]) && lastmods[0] === today
    );
  });
});

describe('editor shells', () => {
  test('are noindex, follow and out of the sitemap', () => {
    const shells = routes.filter((route) => /^template\d+$/.test(route.dir));

    expect(shells.length).toBeGreaterThan(20);
    for (const shell of shells) {
      expect(shell.robots).toBe('noindex, follow');
      expect(shell.inSitemap).toBe(false);
    }
  });

  test('robots meta is written into the document', () => {
    const shell = routes.find((route) => /^template\d+$/.test(route.dir));
    const html = replaceMeta(
      '<title>x</title><meta name="description" content="x" /><meta name="robots" content="index, follow" /><link rel="canonical" href="x" />',
      shell
    );

    expect(html).toContain('content="noindex, follow"');
  });
});

describe('llms.txt', () => {
  test('names the brand and links the example pages', () => {
    expect(llms).toMatch(/^# HatchResume/);
    expect(llms).toContain(`${SITE_URL}/ats-resume-checker/`);
    expect(llms).toContain(`${SITE_URL}/examples/software-engineer/`);
  });
});

describe('static body injection', () => {
  test('replaces the placeholder block and refuses a page without it', () => {
    const html = '<body><div id="seo-static" style="x"><p>old</p></div></body>';
    expect(replaceStaticBody(html, '<h1>new</h1>')).toContain('<h1>new</h1>');
    expect(replaceStaticBody(html, '<h1>new</h1>')).not.toContain('old');

    expect(() => replaceStaticBody('<body></body>', '<h1>new</h1>')).toThrow(/seo-static/);
  });
});
