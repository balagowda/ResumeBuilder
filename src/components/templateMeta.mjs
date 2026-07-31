// Template catalogue metadata (id, name, description, category, tags).
//
// Kept in a plain, JSX-free module so it can be imported both by the React app
// and by scripts/seo-postbuild.js, which pre-renders the template list into
// static HTML for crawlers that do not execute JavaScript.

export const TEMPLATES = [
  {
    id: 1,
    name: 'Professional Executive',
    description: 'A classic, clean single-column layout optimized for corporate and executive jobs. Recommended for traditional industries.',
    category: 'Professional',
    tags: ['ATS-Optimized', 'Corporate', 'Clean'],
  },
  {
    id: 2,
    name: 'Modern Creative',
    description: 'A split-column layout designed to maximize space and readability. Best suited for tech, design, and marketing roles.',
    category: 'Creative',
    tags: ['2-Column', 'Design & Art', 'Slate theme'],
  },
  {
    id: 3,
    name: 'Executive Centered',
    description: 'A pristine, center-aligned corporate structure with full-width section borders. Highly professional.',
    category: 'Professional',
    tags: ['Top-tier Corporate', 'Clean Borders', 'Whitespace'],
  },
  {
    id: 4,
    name: 'Bold Tech Header',
    description: 'Featuring a high-contrast dark indigo top header band and tech-oriented grid layouts. Best for engineering and developers.',
    category: 'Creative',
    tags: ['Bold Accent', 'Tech & Devs', 'High Contrast'],
  },
  {
    id: 5,
    name: 'Modern Professional',
    description: 'A sleek two-column header with heavy section borders in a strict black-and-white aesthetic.',
    category: 'Professional',
    tags: ['Two-Column Header', 'B&W Aesthetic', 'Structured'],
  },
  {
    id: 6,
    name: 'FAANG Engineer',
    description: 'The single-column engineering standard used for Google, Meta and Amazon applications. Dense, scannable, and 100% ATS-parseable with full URLs in plain text.',
    category: 'ATS-Optimized',
    tags: ['FAANG Standard', 'Single Column', '100% ATS'],
  },
  {
    id: 7,
    name: 'ATS Pro Plain',
    description: 'Maximum parser compatibility: no lines, no columns, no graphics. Bold uppercase headers and plain text designed to pass every applicant tracking system.',
    category: 'ATS-Optimized',
    tags: ['Max Compatibility', 'Plain Text', 'Recruiter Safe'],
  },
  {
    id: 8,
    name: 'Harvard Classic',
    description: 'The timeless Harvard-style format trusted by consulting, finance, and MBA applicants. Centered small-caps name with full-width ruled section headers.',
    category: 'ATS-Optimized',
    tags: ['Consulting & Finance', 'Ivy League', 'Timeless'],
  },
  {
    id: 9,
    name: 'Compact One-Page',
    description: 'A dense, space-efficient layout that fits senior careers on a single page. Navy accents and compact skill pills keep it modern yet parseable.',
    category: 'ATS-Optimized',
    tags: ['Space Efficient', 'Senior Careers', 'Navy Accent'],
  },
  {
    id: 10,
    name: 'Modern Accent',
    description: 'A contemporary single-column design with indigo accent bars on section headers. ATS-safe structure with just enough color to stand out.',
    category: 'Professional',
    tags: ['Accent Bars', 'ATS-Friendly', 'Contemporary'],
  },
  {
    id: 11,
    name: 'Executive Slate',
    description: 'A stately gray header band with wide-tracked section headings. Designed for directors, VPs, and senior management applications at top MNCs.',
    category: 'Professional',
    tags: ['Leadership', 'Header Band', 'Elegant Rules'],
  },
  {
    id: 12,
    name: 'Elegant Minimal',
    description: 'Light, airy typography with hairline rules and wide letter-spacing. A refined minimal look that stays fully single-column and parser-friendly.',
    category: 'Creative',
    tags: ['Minimalist', 'Hairline Rules', 'Airy'],
  },
  {
    id: 13,
    name: 'Right Rail Modern',
    description: 'The balanced two-column standard used by leading resume builders: experience on the left, a light-gray rail on the right for contact, skills, and education.',
    category: 'Professional',
    tags: ['2-Column', 'Light Sidebar', 'Balanced'],
  },
  {
    id: 14,
    name: 'Timeline Professional',
    description: 'Your career path drawn as a vertical timeline with connected milestones. A favorite modern style for showing steady progression.',
    category: 'Professional',
    tags: ['Timeline Dots', 'Career Path', 'Sky Accent'],
  },
  {
    id: 15,
    name: 'Classic Serif',
    description: 'The timeless Times-style resume trusted for decades in law, government, and academia. Understated serif typography, fully single-column and ATS-safe.',
    category: 'ATS-Optimized',
    tags: ['Times Classic', 'Traditional', '100% ATS'],
  },
  {
    id: 16,
    name: 'Corporate Blue',
    description: 'A solid blue header band over a clean single-column body — the most widely used corporate style at banks, consultancies, and Fortune 500 companies.',
    category: 'Professional',
    tags: ['Blue Header', 'Corporate', 'Single Column'],
  },
  {
    id: 17,
    name: 'Monogram Modern',
    description: 'A personal-brand favorite: your initials in a badge beside your name, followed by a clean modern layout.',
    category: 'Creative',
    tags: ['Initials Badge', 'Personal Brand', 'Modern'],
  },
  {
    id: 18,
    name: 'Teal Graduate',
    description: 'A fresh, approachable layout with teal accents — the go-to standard for students, internships, and first jobs.',
    category: 'Creative',
    tags: ['Entry Level', 'Fresh & Clean', 'Teal Accent'],
  },
  {
    id: 19,
    name: 'Swiss Minimal',
    description: 'Design-led Swiss typography: an oversized name, generous whitespace, and a single red rule. Popular for design, media, and marketing portfolios.',
    category: 'Creative',
    tags: ['Big Typography', 'Red Accent', 'Design-Led'],
  },
  {
    id: 20,
    name: 'Boxed Headers Classic',
    description: 'The classic office-document style with shaded section header bars — instantly familiar to recruiters and cleanly parsed by tracking systems.',
    category: 'ATS-Optimized',
    tags: ['Shaded Headers', 'Office Standard', 'Structured'],
  },
  {
    id: 21,
    name: 'Deedy Two-Column',
    description: 'The famous Deedy format loved by CS students and new grads: a narrow left column for education, skills, and links beside a wide experience column — all on clean white.',
    category: 'Professional',
    tags: ['Deedy Format', 'Two Column', 'CS Students'],
  },
  {
    id: 22,
    name: 'Spearmint Fresh',
    description: 'Modeled on the ever-popular Spearmint document style: crisp green rules over a plain single-column body. Familiar, friendly, and fully parseable.',
    category: 'ATS-Optimized',
    tags: ['Green Rules', 'Docs Classic', 'Single Column'],
  },
  {
    id: 23,
    name: 'Coral Warm',
    description: 'A warm, approachable single-column layout with coral headings — a widely used standard for customer-facing, HR, and communications roles.',
    category: 'Creative',
    tags: ['Coral Accent', 'Approachable', 'People Roles'],
  },
  {
    id: 24,
    name: 'Developer Mono',
    description: 'A monospace, terminal-inspired resume for developers — section headers with prompt markers and code-style typography, still strictly single-column.',
    category: 'Creative',
    tags: ['Monospace', 'Terminal Style', 'For Devs'],
  },
  {
    id: 25,
    name: 'Oxford Side-Headings',
    description: 'The academic CV standard with section headings set in a left gutter beside the content — the layout used by Oxford-style and moderncv LaTeX resumes.',
    category: 'Professional',
    tags: ['Side Headings', 'Academic CV', 'LaTeX Style'],
  },
];

/** Which templates use a two-column page layout (everything else is single
 *  column). Single column is what ATS parsers read most reliably, so this
 *  drives both the gallery filter and the copy on each template page. */
export const TWO_COLUMN_IDS = [2, 4, 13, 21];

/** Stable, human-readable URL segment for a template. Derived from the name,
 *  so renaming a template changes its URL — update the redirect story before
 *  doing that once the pages are indexed. */
export const templateSlug = (template) =>
  template.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * The catalogue as the landing pages need it: slug, URL path, layout, and
 * whether the design is one of the ATS-first ones. Shared by the React routes
 * and by scripts/seo-postbuild.js, so a new template gets a page, a sitemap
 * entry and a gallery card from one edit.
 */
export const TEMPLATE_PAGES = TEMPLATES.map((template) => ({
  ...template,
  slug: templateSlug(template),
  path: `/templates/${templateSlug(template)}`,
  layout: TWO_COLUMN_IDS.includes(template.id) ? 'Two column' : 'Single column',
  atsFirst: template.category === 'ATS-Optimized',
}));

export const findTemplatePage = (slug) =>
  TEMPLATE_PAGES.find((template) => template.slug === String(slug || '').toLowerCase());
