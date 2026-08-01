import { TEMPLATE_PAGES, findTemplatePage } from '../components/templateMeta.mjs';
import { CONTENT_PAGES } from './contentPages.mjs';
import { EXAMPLE_RESUMES, exampleSections, findExample } from './exampleResumes.mjs';
import { templatePageMeta, examplePageMeta } from './pageMeta.mjs';

// These modules drive three things at once: the React routes, the pre-rendered
// HTML, and the sitemap. A duplicate slug or a missing field does not throw —
// it quietly publishes a broken or colliding URL, which is exactly the kind of
// thing nobody notices until a page stops being indexed.

describe('template pages', () => {
  test('every template has a unique slug and a well-formed path', () => {
    const slugs = TEMPLATE_PAGES.map((t) => t.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    for (const template of TEMPLATE_PAGES) {
      expect(template.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(template.path).toBe(`/templates/${template.slug}`);
      expect(findTemplatePage(template.slug)).toBe(template);
    }
  });

  test('slug lookup is case-insensitive and safe for unknown input', () => {
    expect(findTemplatePage('FAANG-Engineer').name).toBe('FAANG Engineer');
    expect(findTemplatePage('does-not-exist')).toBeUndefined();
    expect(findTemplatePage(undefined)).toBeUndefined();
  });

  test('titles and descriptions stay within what search results show', () => {
    for (const template of TEMPLATE_PAGES) {
      const meta = templatePageMeta(template);
      expect(meta.title).toContain(template.name);
      expect(meta.description.length).toBeGreaterThan(70);
      expect(meta.description.length).toBeLessThan(320);
    }
  });
});

describe('content pages', () => {
  test('paths are unique, rooted and free of trailing slashes', () => {
    const paths = CONTENT_PAGES.map((page) => page.path);

    expect(new Set(paths).size).toBe(paths.length);
    for (const page of CONTENT_PAGES) {
      expect(page.path).toMatch(/^\/[a-z0-9-]+$/);
      expect(page.dir).toBe(page.path.slice(1));
      expect(page.navLabel).toBeTruthy();
    }
  });
});

describe('resume examples', () => {
  test('each example carries a complete resume in the editor’s shape', () => {
    for (const example of EXAMPLE_RESUMES) {
      const { data } = example;

      expect(findExample(example.slug)).toBe(example);
      expect(TEMPLATE_PAGES.some((t) => t.id === example.templateId)).toBe(true);
      expect(data.fullName).toBeTruthy();
      expect(data.mail).toMatch(/@/);
      expect(data.skills).toBeTruthy();
      expect(data.experiences.length).toBeGreaterThan(0);
      expect(data.education.length).toBeGreaterThan(0);

      // Fields the editor reads on mount; a missing one renders as undefined
      // in the live preview rather than failing loudly.
      expect(typeof data.lineHeight).toBe('number');
      expect(typeof data.showProfessionalTitle).toBe('boolean');

      // "Others" sections (certifications, licenses…) are optional, but every
      // entry present must have the title/description shape the editor edits.
      expect(Array.isArray(data.others)).toBe(true);
      for (const entry of data.others) {
        expect(entry.title).toBeTruthy();
        expect(typeof entry.description).toBe('string');
      }
    }
  });

  test('the page text covers every section of the example', () => {
    for (const example of EXAMPLE_RESUMES) {
      const headings = exampleSections(example).map((section) => section.heading);
      expect(headings).toEqual(['Summary', 'Experience', 'Projects', 'Education', 'Skills']);

      const meta = examplePageMeta(example);
      expect(meta.title).toContain(example.role);
    }
  });
});
