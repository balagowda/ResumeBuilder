// Structural checks for a resume pasted as plain text.
//
// The writing rules already live in contentLint; this module adds the things
// that only matter once a document goes through an applicant tracking system —
// is the contact information findable, are the section headings the standard
// ones, is the length sane, do the bullets carry numbers — and combines them
// into one score.
//
// Everything runs on the pasted text alone. Nothing is uploaded: this file is
// imported into the page and executes in the visitor's browser.
import { lintSources } from './contentLint';

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE = /(\+?\d[\d\s().-]{7,}\d)/;
const URL = /(https?:\/\/|www\.|linkedin\.com|github\.com)\S+/i;
const DATE_RANGE =
  /((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}|\b(19|20)\d{2}\b)/i;

// Headings an ATS looks for. Each entry is one concept with its common wordings.
const SECTION_PATTERNS = [
  { id: 'experience', label: 'Experience', pattern: /\b(work\s+)?(experience|employment|professional\s+background|work\s+history)\b/i },
  { id: 'education', label: 'Education', pattern: /\b(education|academic|qualifications)\b/i },
  { id: 'skills', label: 'Skills', pattern: /\b(skills|technical\s+skills|competencies|technologies)\b/i },
];

// Formatting that survives on screen but confuses a parser.
const RISKY_CHARS = /[│┃▪◆●○★☑✔➤➔»❯]|\t{2,}/;

const wordsIn = (text) => text.split(/\s+/).filter(Boolean).length;

// Which part of the resume a heading opens. Lines under 'skip' sections are
// read for length and keywords but never linted as prose: a skills list is
// supposed to be a list of nouns, and an education line is supposed to be a
// date and a school.
const HEADING_SECTIONS = [
  { section: 'summary', pattern: /^(summary|profile|about|objective|professional\s+summary)\b/i },
  { section: 'body', pattern: /^(experience|work\s+experience|employment|professional\s+experience|work\s+history|projects?|volunteer)\b/i },
  { section: 'skip', pattern: /^(education|skills|technical\s+skills|certifications?|awards?|publications?|languages?|interests?|hobbies|references?|courses?)\b/i },
];

// "Mar 2023 – Present", "2017 - 2021": a job or degree header, not an
// achievement. Bullets that merely mention a year are left alone.
const DATE_HEADER = /(\d{4}|present)\s*[–—-]\s*(\d{4}|present)|((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}\s*[–—-])/i;

/** A comma-separated list of short items — a skills line that escaped its heading. */
const isListLine = (line) => {
  const commas = (line.match(/,/g) || []).length;
  return commas >= 3 && wordsIn(line) / (commas + 1) <= 3;
};

/**
 * Split pasted text into the lines worth linting, tagged with the section they
 * sit under. A pasted resume has no structure, so the split has to be inferred;
 * being conservative here is what keeps the feedback credible instead of
 * telling someone their name should start with an action verb.
 */
export const extractBullets = (text) => {
  let current = 'header'; // everything before the first heading: name, contact
  const bullets = [];

  text.split('\n').forEach((raw) => {
    const line = raw.replace(/^[\s•\-*–—+·▪◆●]+/, '').trim();
    if (!line) return;

    // Headings are short. Test before anything else so "SKILLS" switches
    // section rather than being judged as a sentence.
    if (wordsIn(line) <= 5) {
      const heading = HEADING_SECTIONS.find(({ pattern }) => pattern.test(line));
      if (heading) {
        current = heading.section;
        return;
      }
    }

    if (current === 'header' || current === 'skip') return;
    if (line.length < 40 || wordsIn(line) < 6) return;
    if (EMAIL.test(line) || PHONE.test(line)) return;
    if (line === line.toUpperCase()) return;
    if (DATE_HEADER.test(line)) return;
    if (isListLine(line)) return;

    bullets.push({ line, section: current });
  });

  return bullets;
};

const status = (ok, warn = false) => (ok ? 'pass' : warn ? 'warn' : 'fail');

/**
 * Score a pasted resume.
 *
 * Returns { score, checks, writing, stats }. `checks` is ordered for display:
 * failures first, since those are what the visitor came for.
 */
export const checkResumeText = (rawText) => {
  const text = String(rawText || '').trim();

  if (!text) {
    return { empty: true, score: 0, checks: [], writing: null, stats: null };
  }

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const words = wordsIn(text);
  const entries = extractBullets(text);
  // The summary is prose about you; only achievement bullets are judged on
  // whether they carry a number.
  const bullets = entries.filter((entry) => entry.section === 'body').map((entry) => entry.line);
  const quantified = bullets.filter((line) => /\d/.test(line)).length;

  const foundSections = SECTION_PATTERNS.filter(({ pattern }) =>
    lines.some((line) => line.length < 60 && pattern.test(line))
  );
  const missingSections = SECTION_PATTERNS.filter(
    (section) => !foundSections.some((found) => found.id === section.id)
  );

  const hasEmail = EMAIL.test(text);
  const hasPhone = PHONE.test(text);
  const hasLink = URL.test(text);
  const longBullets = bullets.filter((line) => wordsIn(line) > 34).length;
  const riskyLines = lines.filter((line) => RISKY_CHARS.test(line)).length;

  const checks = [
    {
      id: 'contact',
      label: 'Contact details are machine-readable',
      state: status(hasEmail && hasPhone, hasEmail || hasPhone),
      detail:
        hasEmail && hasPhone
          ? 'Email and phone number both found in the text.'
          : `Could not find ${[!hasEmail && 'an email address', !hasPhone && 'a phone number']
              .filter(Boolean)
              .join(' or ')}. If it is in a header, text box or image, most parsers will not read it — put it in the body of the document.`,
    },
    {
      id: 'links',
      label: 'Profile links written as text',
      state: status(hasLink, true),
      detail: hasLink
        ? 'A LinkedIn, GitHub or portfolio link is present as plain text.'
        : 'No profile link found. Write the URL out in full rather than hiding it behind linked words — parsers keep the text, not the hyperlink.',
    },
    {
      id: 'sections',
      label: 'Standard section headings',
      state: status(missingSections.length === 0, missingSections.length === 1),
      detail:
        missingSections.length === 0
          ? 'Experience, education and skills headings all found.'
          : `Missing or non-standard: ${missingSections
              .map((s) => s.label)
              .join(', ')}. Applicant tracking systems file content by heading — a creative label like "Where I've Been" lands nowhere.`,
    },
    {
      id: 'length',
      label: 'Length is in the expected range',
      state: status(words >= 300 && words <= 900, words >= 200 && words <= 1200),
      detail:
        words < 300
          ? `${words} words is thin — most single-page resumes run 350–650. Add the impact behind the roles you already list.`
          : words > 900
            ? `${words} words is long for a resume; recruiters skim in under a minute. Cut the oldest roles back to one line each.`
            : `${words} words, which is a normal single-page length.`,
    },
    {
      id: 'quantified',
      label: 'Achievements carry numbers',
      state: status(
        bullets.length > 0 && quantified / bullets.length >= 0.5,
        bullets.length > 0 && quantified / bullets.length >= 0.25
      ),
      detail:
        bullets.length === 0
          ? 'No achievement bullets detected. Break your experience into one achievement per line.'
          : `${quantified} of ${bullets.length} bullets contain a number. Percentages, money, headcount and time are what make a claim checkable.`,
    },
    {
      id: 'bullet-length',
      label: 'Bullets stay scannable',
      state: status(longBullets === 0, longBullets <= 2),
      detail:
        longBullets === 0
          ? 'No overlong bullets — every line is short enough to scan.'
          : `${longBullets} bullet${longBullets === 1 ? '' : 's'} run past 34 words. Split them: one achievement per line.`,
    },
    {
      id: 'dates',
      label: 'Dates are present and parseable',
      state: status(DATE_RANGE.test(text)),
      detail: DATE_RANGE.test(text)
        ? 'Dates found in a format parsers recognise.'
        : 'No dates detected. Every role needs a start and end (for example "Mar 2023 – Present") or an ATS cannot build your timeline.',
    },
    {
      id: 'formatting',
      label: 'No parser-hostile formatting',
      state: status(riskyLines === 0, riskyLines <= 2),
      detail:
        riskyLines === 0
          ? 'No decorative glyphs or column separators that commonly break extraction.'
          : `${riskyLines} line${riskyLines === 1 ? '' : 's'} contain decorative characters or column separators. Plain "-" bullets are safer.`,
    },
  ];

  // Writing quality, from the same rules the editor's Writing Review uses.
  const writing = lintSources(
    entries.map((entry, index) => ({
      section: entry.section,
      index,
      label: entry.section === 'summary' ? 'Summary' : 'Your resume',
      text: entry.line,
    }))
  );

  const WEIGHT = { pass: 1, warn: 0.5, fail: 0 };
  const structural = checks.reduce((sum, check) => sum + WEIGHT[check.state], 0) / checks.length;

  // Structure is two thirds of the score: a beautifully written resume the
  // parser cannot read still fails the screen.
  const score = Math.round((structural * 0.68 + (writing.score / 100) * 0.32) * 100);

  const RANK = { fail: 0, warn: 1, pass: 2 };
  const ordered = [...checks].sort((a, b) => RANK[a.state] - RANK[b.state]);

  return {
    empty: false,
    score,
    checks: ordered,
    writing,
    stats: {
      words,
      lines: lines.length,
      bullets: bullets.length,
      quantified,
    },
  };
};

export default checkResumeText;
