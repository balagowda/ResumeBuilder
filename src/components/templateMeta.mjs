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
  {
    id: 26,
    name: 'Chronological Standard',
    description: 'The reverse-chronological format recruiters expect, with dates set in a left column so a career history reads straight down the page.',
    category: 'ATS-Optimized',
    tags: ['Date Column', 'Reverse Chronological', '100% ATS'],
  },
  {
    id: 27,
    name: 'Graphite Rule',
    description: 'Charcoal typography with a hairline rule running out from each section heading. The restrained modern corporate look, with no colour to distract.',
    category: 'Professional',
    tags: ['Trailing Rules', 'Charcoal Ink', 'Modern Corporate'],
  },
  {
    id: 28,
    name: 'Skills Matrix',
    description: 'Built for technical and IT roles: skills laid out as a three-column list a recruiter can scan in seconds, above a plain single-column history.',
    category: 'ATS-Optimized',
    tags: ['3-Column Skills', 'Technical & IT', 'Single Column'],
  },
  {
    id: 29,
    name: 'Clinical Professional',
    description: 'The healthcare standard: credentials under your name, a banded contact strip, and dedicated headings for clinical skills and licenses.',
    category: 'Professional',
    tags: ['Healthcare & Nursing', 'Licenses Section', 'Slate Blue'],
  },
  {
    id: 30,
    name: 'Finance Standard',
    description: 'The banking and consulting format: an uppercase serif name over a double rule, italic employers, and dates aligned right. Standard for MBA and finance applications.',
    category: 'ATS-Optimized',
    tags: ['Banking & Consulting', 'Double Rule', 'MBA Standard'],
  },
  {
    id: 31,
    name: 'Federal Standard',
    description: 'The plain, detail-first format government and public-sector applications expect, with rules above each heading and no colour or graphics anywhere.',
    category: 'ATS-Optimized',
    tags: ['Government & Federal', 'Plain Text', 'Detail First'],
  },
  {
    id: 32,
    name: 'Bordered Classic',
    description: 'A traditional document look with a hairline frame around the page and a centered header. Familiar to any recruiter who has opened a Word resume.',
    category: 'Professional',
    tags: ['Framed Page', 'Traditional', 'Office Standard'],
  },
  {
    id: 33,
    name: 'Profile Spotlight',
    description: 'Opens with your summary in a tinted callout, the way management and senior applications lead with a pitch before the history starts.',
    category: 'Professional',
    tags: ['Summary Callout', 'Management', 'Modern Corporate'],
  },
  {
    id: 34,
    name: 'Split Header Modern',
    description: 'Name on the left, contact details stacked on the right — the modern chronological header, over a clean single-column body with quiet rules.',
    category: 'ATS-Optimized',
    tags: ['Split Header', 'Chronological', 'Single Column'],
  },
  {
    id: 35,
    name: 'Section Rail',
    description: 'Each section sits beside a slim vertical rule, giving the page structure without boxes, bands or a sidebar for a parser to trip over.',
    category: 'Professional',
    tags: ['Vertical Rule', 'Structured', 'Quiet Accent'],
  },
  {
    id: 36,
    name: 'Functional Skills-First',
    description: 'The functional format for career changers and people returning to work: strengths lead the page in a panel of their own, with the dated history kept intact underneath.',
    category: 'Professional',
    tags: ['Functional Format', 'Career Change', 'Skills Panel'],
  },
  {
    id: 37,
    name: 'Garamond Executive',
    description: 'Set in Garamond with letter-spaced headings and generous leading — the quiet, well-set serif look that suits senior and executive applications.',
    category: 'Professional',
    tags: ['Garamond Serif', 'Executive', 'Generous Leading'],
  },
  {
    id: 38,
    name: 'Office Classic',
    description: 'Cambria headings over a Calibri body: the default word-processor pairing behind more resumes than any other, and the one every recruiter reads without noticing it.',
    category: 'ATS-Optimized',
    tags: ['Cambria & Calibri', 'Word Standard', 'Plain Rules'],
  },
  {
    id: 39,
    name: 'Recruiter Scan',
    description: 'Built for the ten seconds a resume actually gets: oversized black section headings, wide gaps between blocks, and nothing competing with the text.',
    category: 'ATS-Optimized',
    tags: ['Large Headings', 'High Whitespace', 'Fast Scan'],
  },
  {
    id: 40,
    name: 'Charcoal Modern',
    description: 'Your name reversed out of a charcoal block with the contact line plain beneath it — a contemporary corporate header on an otherwise unadorned page.',
    category: 'Professional',
    tags: ['Name Block', 'Mid-Career', 'Contemporary'],
  },
  {
    id: 41,
    name: 'Slate Sidebar',
    description: 'The layout most modern resume builders default to: a dark slate column on the left for contact, skills and education, with your history filling the rest of the page.',
    category: 'Professional',
    tags: ['Dark Sidebar', '2-Column', 'Modern Standard'],
  },
  {
    id: 42,
    name: 'Banner Two-Column',
    description: 'A full-width header across the top with your name and contact details, then two columns beneath — the standard corporate layout when one page has to hold a lot.',
    category: 'Professional',
    tags: ['Header Banner', '2-Column', 'Corporate'],
  },
  {
    id: 43,
    name: 'Combination Hybrid',
    description: 'The combination format: a full-width competencies band under the header, then a dated chronological history. Skills lead, but nothing a tracking system needs is missing.',
    category: 'ATS-Optimized',
    tags: ['Hybrid Format', 'Skills Band', 'Single Column'],
  },
  {
    id: 44,
    name: 'Contact Grid Classic',
    description: 'Contact details set in a bordered grid under a centered name, over a plain single-column body — the tidy office-document look, with every detail still plain text.',
    category: 'ATS-Optimized',
    tags: ['Contact Grid', 'Office Standard', 'Single Column'],
  },
  {
    id: 45,
    name: 'Banner Sidebar Executive',
    description: 'A dark banner across the top over a light left rail: the senior-hire layout that leads with your name and keeps skills and education beside the history.',
    category: 'Professional',
    tags: ['Dark Banner', 'Left Rail', 'Senior Roles'],
  },
];

/** Which templates use a two-column page layout (everything else is single
 *  column). Single column is what ATS parsers read most reliably, so this
 *  drives both the gallery filter and the copy on each template page. */
export const TWO_COLUMN_IDS = [2, 4, 13, 21, 41, 42, 45];

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
