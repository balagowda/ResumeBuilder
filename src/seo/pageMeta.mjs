// Title and description builders for the generated pages (one per template,
// one per resume example) plus the fixed utility pages.
//
// Both the React components and scripts/seo-postbuild.js import these, so the
// tab title a visitor sees and the <title> a crawler reads are produced by the
// same function.

export const BRAND = 'HatchResume';

/**
 * When the site's copy last changed, as YYYY-MM-DD.
 *
 * Bump this when you edit page text — it is what the sitemap reports as
 * `lastmod` for pages that do not carry their own date. Deliberately not the
 * build date: stamping every URL as modified on every deploy tells search
 * engines nothing, and they learn to discount it.
 */
export const CONTENT_UPDATED = '2026-08-01';

export const templatePageMeta = (template) => ({
  title: `${template.name} Resume Template — Free Download | ${BRAND}`,
  description: `${template.description} Free ${template.layout.toLowerCase()} resume template — edit it online and download a PDF with no sign-up and no watermark.`,
});

export const examplePageMeta = (example) => ({
  title: `${example.role} Resume Example (${example.year}) — Free Template | ${BRAND}`,
  description: `A complete ${example.role.toLowerCase()} resume example with real bullet points, plus the free editor to build your own. ${example.summaryLine}`,
});

export const EXAMPLES_HUB_META = {
  title: `Resume Examples by Job Title — Free, Copy-Ready | ${BRAND}`,
  description:
    'Complete resume examples you can open in a free editor and make your own — real bullet points, ATS-safe formatting, no sign-up and no watermark.',
};

/**
 * The "is this template right for you" copy. Shared so the rendered page and
 * the pre-rendered HTML say the same thing — a crawler that is shown different
 * text from the visitor is the definition of cloaking.
 */
export const templateCopy = (template) => ({
  layout:
    template.layout === 'Single column'
      ? 'This is a single-column design: every section runs the full width of the page, in the order a recruiter reads. That is the structure applicant tracking systems parse most reliably, because there are no side-by-side blocks for the parser to interleave.'
      : 'This is a two-column design: a narrower sidebar carries skills and contact details while the main column carries your history. It fits more on one page and looks more designed, but some older applicant tracking systems read columns out of order — if a posting says the resume goes straight into an ATS, prefer a single-column template.',
  ats: template.atsFirst
    ? 'It is one of the ATS-Optimized templates: standard section headings, no graphics, and links written out in plain text so nothing is lost when the file is parsed.'
    : 'It keeps standard section headings and selectable text, so it stays readable to parsers while giving you more visual character than the plain ATS layouts.',
});

/** Copy for the ATS checker page, shared with the pre-render script. */
export const ATS_CHECKER_COPY = {
  h1: 'Free ATS Resume Checker',
  lead:
    'Paste your resume to see what an applicant tracking system does with it: whether your contact details and dates are readable, whether the section headings are the ones parsers file content by, and where the writing weakens your case. Add a job posting to see which of its keywords you are missing.',
  privacy:
    'Nothing is uploaded. The check runs in this browser tab — close it and the text is gone.',
  checks: [
    'Contact details a parser can actually find, rather than stranded in a header',
    'Profile links written as plain text instead of hidden behind linked words',
    'Standard section headings — Experience, Education, Skills',
    'Length in the range recruiters expect for a single page',
    'Achievements backed by numbers rather than adjectives',
    'Bullets short enough to scan, with dates in a parseable format',
    'Decorative glyphs and column separators that break text extraction',
    'Weak openers, passive voice and repeated verbs in your bullet points',
  ],
  explainer: [
    'An applicant tracking system is a database, not a judge. It extracts text from your file and files it under headings it recognises. Most "ATS rejections" are extraction failures: contact details stranded in a header, a two-column layout read across instead of down, dates in a format the parser cannot resolve, or a PDF that is an image with no text layer at all.',
    'The checks here test exactly those failure points. Once the text comes through cleanly, the recruiter reading it is the real filter — which is why the writing feedback matters as much as the structure.',
  ],
};

export const ATS_CHECKER_META = {
  title: `Free ATS Resume Checker — Score Your Resume Instantly | ${BRAND}`,
  description:
    'Paste your resume and get an instant ATS score: missing sections, unreadable formatting, weak bullet points, and the keywords a job posting expects. Free, no sign-up, and your resume never leaves your browser.',
};
