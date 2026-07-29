/**
 * Turn the text of an existing resume into form data.
 *
 * Runs entirely in the browser, like everything else here — the text is never
 * uploaded. The job is inherently fuzzy: resumes have no schema, and every
 * template lays them out differently. Two principles keep that manageable:
 *
 *  1. Never drop text. Anything that cannot be classified lands in the closest
 *     reasonable field rather than being discarded, because a user can delete a
 *     misplaced line far more easily than they can notice a missing one.
 *  2. Report what was found. The caller shows a summary before anything is
 *     written, so a bad parse is caught by the user rather than silently
 *     overwriting their resume.
 */

const MONTH = '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)[a-z]*';
const DATE_TOKEN = `(?:${MONTH}\\.?,?\\s*\\d{4}|\\d{1,2}[/-]\\d{4}|\\d{4})`;
const PRESENT = '(?:present|current|now|ongoing|till\\s*date|to\\s*date)';

const DATE_RANGE = new RegExp(
  `(${DATE_TOKEN})\\s*(?:[-–—]{1,2}|\\bto\\b|\\buntil\\b)\\s*(${DATE_TOKEN}|${PRESENT})`,
  'i'
);

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;
// Loose on grouping — "+91 98765 43210", "(555) 123-4567" and "555.123.4567"
// all differ — and tightened afterwards by counting digits.
const PHONE = /(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2,5}\)|\d{2,5})(?:[\s.-]?\d{2,5}){1,4}/;
const LINKEDIN = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|,]+/i;
const GITHUB = /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s|,]+/i;
const URL = /(?:https?:\/\/|www\.)[^\s|,]+/i;

const BULLET_START = /^[\s]*[•▪‣◦*\-–—+·o]\s+/;

// Headings, longest-first inside each group so "work experience" wins over
// "experience".
const SECTION_SYNONYMS = [
  ['summary', ['professional summary', 'career objective', 'career summary', 'personal profile',
    'about me', 'summary', 'objective', 'profile', 'overview']],
  ['experiences', ['professional experience', 'work experience', 'employment history',
    'work history', 'relevant experience', 'experience & internships', 'internships',
    'internship', 'employment', 'experience']],
  ['education', ['educational qualifications', 'academic qualifications', 'education',
    'academics', 'academic background', 'qualifications']],
  ['projects', ['academic projects', 'personal projects', 'key projects', 'projects', 'project work']],
  ['skills', ['technical skills', 'core competencies', 'key skills', 'technologies',
    'tech stack', 'skills & tools', 'skills']],
  ['others', ['certifications & licenses', 'certifications', 'certificates', 'achievements',
    'accomplishments', 'awards & honors', 'awards', 'honors', 'publications', 'languages',
    'volunteer experience', 'volunteering', 'extracurricular', 'activities', 'interests',
    'hobbies', 'references']],
];

const COMPANY_HINT = /\b(inc|llc|ltd|limited|corp|corporation|co|gmbh|pvt|private|technologies|technology|solutions|systems|labs|software|consulting|services|group|university|institute)\b\.?/i;

const DEGREE_HINT = /\b(bachelor|master|b\.?tech|b\.?e|b\.?sc|b\.?com|b\.?a|m\.?tech|m\.?sc|m\.?com|m\.?a|mba|phd|doctorate|diploma|associate|higher secondary|secondary|hsc|ssc|class\s*(?:x|xii|10|12))\b/i;
const SCHOOL_HINT = /\b(university|college|institute|school|academy|polytechnic)\b/i;
const SCORE_HINT = /\b(?:cgpa|gpa|percentage|score|marks)\b[:\s]*[\d.]+%?|\b\d\.\d{1,2}\s*\/\s*\d{1,2}\b|\b\d{2,3}(?:\.\d+)?\s*%/i;

const clean = (line) => line.replace(/\s+/g, ' ').trim();
const stripBullet = (line) => line.replace(BULLET_START, '').trim();

/** Drop page furniture that would otherwise be read as content. */
const isNoise = (line) => {
  const t = line.trim();
  if (!t) return true;
  if (/^page\s*\d+(\s*of\s*\d+)?$/i.test(t)) return true;
  if (/^[-=_*.•\s]+$/.test(t)) return true; // separator rules
  if (/^\d+$/.test(t) && t.length <= 2) return true; // bare page numbers
  return false;
};

/** Match a line against the heading dictionary, tolerating decoration. */
const headingFor = (line) => {
  const bare = clean(line)
    .replace(/^[^A-Za-z]+/, '')
    .replace(/[:\-–—_*|]+$/, '')
    .trim()
    .toLowerCase();

  if (!bare || bare.length > 40) return null;
  // A heading is a label, not a sentence.
  if (bare.split(/\s+/).length > 4) return null;

  for (const [section, names] of SECTION_SYNONYMS) {
    if (names.some((name) => bare === name)) return section;
  }
  // "Skills:" style headings that carry their content on the same line are
  // handled by the caller, so only exact label matches count here.
  return null;
};

/** A heading whose content sits on the same line, e.g. "Skills: React, Node". */
const inlineHeading = (line) => {
  const match = clean(line).match(/^([A-Za-z &]{3,40}?)\s*[:|]\s*(.+)$/);
  if (!match) return null;
  const section = headingFor(match[1]);
  return section ? { section, rest: match[2].trim() } : null;
};

const looksLikeName = (line) => {
  const t = clean(line);
  if (!t || t.length > 45) return false;
  if (EMAIL.test(t) || URL.test(t) || /\d/.test(t)) return false;
  const words = t.split(/\s+/);
  if (words.length < 2 || words.length > 5) return false;
  // Either Title Case or ALL CAPS, which is how names are set on nearly every
  // resume template.
  return words.every((w) => /^[A-Z][a-zA-Z.'-]*$/.test(w)) || t === t.toUpperCase();
};

/* -------------------------------------------------------------------------
   Contact details
   ------------------------------------------------------------------------- */

const extractContact = (lines) => {
  const contact = {};
  const consumed = new Set();

  // Contact details cluster in the first few lines, but an email or phone can
  // legitimately appear in a footer, so scan everything and take the first hit.
  lines.forEach((line, index) => {
    const text = clean(line);

    if (!contact.mail) {
      const m = text.match(EMAIL);
      if (m) { contact.mail = m[0]; consumed.add(index); }
    }
    if (!contact.linkedin) {
      const m = text.match(LINKEDIN);
      if (m) { contact.linkedin = m[0]; consumed.add(index); }
    }
    if (!contact.github) {
      const m = text.match(GITHUB);
      if (m) { contact.github = m[0]; consumed.add(index); }
    }
    if (!contact.mobile && index < 12) {
      // Restricted to the header: a bare number mid-resume is far more likely
      // to be a metric in a bullet than a phone number.
      //
      // Length is the whole filter. Stripping date tokens first was the obvious
      // move and the wrong one — DATE_TOKEN matches any four digits, so it ate
      // the last block of every phone number it was meant to protect.
      const m = text.match(PHONE);
      const digits = m ? m[0].replace(/\D/g, '').length : 0;
      if (m && digits >= 10 && digits <= 15) {
        contact.mobile = clean(m[0]);
        consumed.add(index);
      }
    }
    if (!contact.other && index < 12) {
      const m = text.match(URL);
      if (m && !LINKEDIN.test(m[0]) && !GITHUB.test(m[0])) {
        contact.other = m[0];
        consumed.add(index);
      }
    }
  });

  // Name: first line in the header that reads like one.
  const nameIndex = lines.findIndex((line, i) => i < 10 && looksLikeName(line));
  if (nameIndex >= 0) {
    contact.fullName = clean(lines[nameIndex]);
    consumed.add(nameIndex);

    // A short, non-contact line straight after the name is usually the title.
    const next = lines[nameIndex + 1];
    if (next) {
      const t = clean(next);
      const isContactish = EMAIL.test(t) || URL.test(t) || PHONE.test(t);
      if (!isContactish && t.length > 0 && t.length <= 60 && !headingFor(t)) {
        contact.professionalTitle = t;
        contact.showProfessionalTitle = true;
        consumed.add(nameIndex + 1);
      }
    }
  }

  return { contact, consumed };
};

/* -------------------------------------------------------------------------
   Section blocks
   ------------------------------------------------------------------------- */

/** Cut the document into labelled blocks at each heading. */
const splitSections = (lines, headerConsumed) => {
  const blocks = [];
  let current = { section: 'header', lines: [] };

  lines.forEach((line, index) => {
    const section = headingFor(line);
    if (section) {
      blocks.push(current);
      current = { section, lines: [] };
      return;
    }

    const inline = inlineHeading(line);
    if (inline) {
      blocks.push(current);
      current = { section: inline.section, lines: [inline.rest] };
      return;
    }

    if (current.section === 'header' && headerConsumed.has(index)) return;
    current.lines.push(line);
  });

  blocks.push(current);
  return blocks.filter((b) => b.lines.some((l) => l.trim()));
};

/* -------------------------------------------------------------------------
   Per-section parsing
   ------------------------------------------------------------------------- */

const parseSkills = (lines) =>
  lines
    .flatMap((line) => stripBullet(line).split(/[,;|•·]|\s{3,}/))
    .map((s) => clean(s).replace(/[.:]$/, ''))
    .filter((s) => s.length > 1 && s.length < 40)
    .filter((s, i, arr) => arr.findIndex((o) => o.toLowerCase() === s.toLowerCase()) === i)
    .join(', ');

const parseSummary = (lines) => lines.map((l) => stripBullet(l)).join(' ').replace(/\s+/g, ' ').trim();

// A single date sitting at the end of a heading, as in "Ledger DB | 2022".
const TRAILING_DATE = new RegExp(`[|,(\\s-]\\s*(${DATE_TOKEN})\\s*\\)?\\s*$`, 'i');

/** Pull "Title | Company | Jan 2020 - Present" apart, in any order. */
const parseEntryHeader = (line) => {
  const text = clean(line);

  // The two patterns report differently: DATE_RANGE's whole match is the range
  // ("Mar 2021 - Present"), while TRAILING_DATE's whole match includes the
  // separator that preceded it, so only its capture group is the date.
  const range = text.match(DATE_RANGE);
  const trailing = range ? null : text.match(TRAILING_DATE);
  const dates = range ? clean(range[0]) : trailing ? clean(trailing[1]) : '';
  const matchedText = range ? range[0] : trailing ? trailing[0] : '';

  let rest = matchedText ? text.replace(matchedText, ' ') : text;
  rest = rest.replace(/[(),|•·]+/g, '|');

  const parts = rest
    .split(/\||\s+[-–—]\s+|\s{2,}/)
    .map((p) => clean(p).replace(/[|,\s]+$/, ''))
    .filter((p) => p.length > 1);

  if (parts.length === 0) return { title: '', company: '', dates };
  if (parts.length === 1) return { title: parts[0], company: '', dates };

  // Whichever part names an organisation is the company, regardless of which
  // side of the separator it sits on.
  const companyIdx = parts.findIndex((p) => COMPANY_HINT.test(p));
  if (companyIdx > 0) {
    return { title: parts[0], company: parts[companyIdx], dates };
  }
  if (companyIdx === 0 && parts.length > 1) {
    return { title: parts[1], company: parts[0], dates };
  }
  return { title: parts[0], company: parts[1], dates };
};

/**
 * Split an experience/project block into entries.
 *
 * A line carrying a date range starts a new entry. Bulleted lines belong to
 * whichever entry is open. A plain line just above a dated line is treated as
 * the entry's title, which covers the common two-line layout where the role is
 * on one line and the company and dates on the next.
 */
const parseEntries = (lines, kind) => {
  const entries = [];

  // Unbulleted, dateless heading lines waiting for the entry they belong to.
  // Kept as a list because the very common stacked layout puts the role on one
  // line, the employer on the next and the dates on a third — so the first
  // pending line is the title and the second is the company.
  let pending = [];

  const takePending = () => {
    const [first = '', second = ''] = pending;
    pending = [];
    return { first, second };
  };

  const open = (header) => {
    const { first, second } = takePending();
    entries.push({
      title: header.title || first || '',
      ...(kind === 'experiences' ? { company: header.company || second || '' } : {}),
      dates: header.dates || '',
      description: '',
    });
  };

  const addDescription = (text) => {
    // Bullets before any recognisable header still need somewhere to go, so
    // open an entry from whatever heading lines are pending.
    if (entries.length === 0 || pending.length > 0) open({});
    const entry = entries[entries.length - 1];
    entry.description = entry.description ? `${entry.description}\n${text}` : text;
  };

  lines.forEach((raw) => {
    const line = clean(raw);
    if (!line) return;

    const isBullet = BULLET_START.test(raw);

    if (isBullet) {
      addDescription(stripBullet(raw));
      return;
    }

    const isHeader =
      DATE_RANGE.test(line) || (line.length <= 80 && TRAILING_DATE.test(line));
    if (isHeader) {
      open(parseEntryHeader(line));
      return;
    }

    // Short, undated, unbulleted: a heading line for an entry still to come.
    if (line.length <= 70 && pending.length < 2) {
      pending.push(line);
      return;
    }

    addDescription(line);
  });

  // Trailing heading lines with no dates or bullets after them are still an
  // entry — "Projects" sections often list nothing but titles.
  if (pending.length) open({});

  return entries.filter((e) => e.title || e.description);
};

const parseEducation = (lines) => {
  const entries = [];
  let current = null;

  const flush = () => {
    if (current && (current.studyTitle || current.school)) entries.push(current);
    current = null;
  };

  lines.forEach((raw) => {
    const line = clean(stripBullet(raw));
    if (!line) return;

    const dateMatch = line.match(DATE_RANGE) || line.match(new RegExp(DATE_TOKEN, 'i'));
    const scoreMatch = line.match(SCORE_HINT);
    const isDegree = DEGREE_HINT.test(line);
    const isSchool = SCHOOL_HINT.test(line);

    // A degree line starts a new qualification.
    if (isDegree || (!current && (isSchool || dateMatch))) {
      flush();
      current = { studyTitle: '', school: '', date: '', score: '' };
    }
    if (!current) current = { studyTitle: '', school: '', date: '', score: '' };

    if (dateMatch && !current.date) current.date = clean(dateMatch[0]);
    if (scoreMatch && !current.score) current.score = clean(scoreMatch[0]);

    let text = line;
    if (dateMatch) text = text.replace(dateMatch[0], ' ');
    if (scoreMatch) text = text.replace(scoreMatch[0], ' ');
    text = clean(text.replace(/[|,–—-]\s*$/, '').replace(/^[|,–—-]\s*/, ''));

    if (!text) return;

    // Both halves often share one line: "B.Tech, XYZ University".
    const parts = text.split(/\s*[|,]\s*|\s+[-–—]\s+/).map(clean).filter(Boolean);
    parts.forEach((part) => {
      if (SCHOOL_HINT.test(part) && !current.school) current.school = part;
      else if (DEGREE_HINT.test(part) && !current.studyTitle) current.studyTitle = part;
      else if (!current.studyTitle) current.studyTitle = part;
      else if (!current.school) current.school = part;
    });
  });

  flush();
  return entries;
};

const parseOthers = (lines) => {
  const entries = [];
  lines.forEach((raw) => {
    const line = clean(stripBullet(raw));
    if (!line) return;
    const split = line.match(/^(.{3,60}?)\s*[:–—-]\s+(.+)$/);
    if (split) entries.push({ title: clean(split[1]), description: clean(split[2]) });
    else entries.push({ title: line, description: '' });
  });
  return entries;
};

/* -------------------------------------------------------------------------
   Entry point
   ------------------------------------------------------------------------- */

/**
 * Parse resume text into partial form data plus a report of what was found.
 *
 * Only fields that were actually detected are returned, so the caller can merge
 * without blanking anything it did not find.
 */
export const parseResumeText = (text) => {
  const rawLines = (text || '').split(/\r?\n/).filter((l) => !isNoise(l));

  if (rawLines.length === 0) {
    return { data: {}, report: { found: [], missing: ['everything'], lineCount: 0 } };
  }

  const { contact, consumed } = extractContact(rawLines);
  const blocks = splitSections(rawLines, consumed);

  const data = { ...contact };
  const gather = (section) =>
    blocks.filter((b) => b.section === section).flatMap((b) => b.lines);

  const summaryLines = gather('summary');
  if (summaryLines.length) data.summary = parseSummary(summaryLines);

  const skillLines = gather('skills');
  if (skillLines.length) data.skills = parseSkills(skillLines);

  const expLines = gather('experiences');
  if (expLines.length) {
    const entries = parseEntries(expLines, 'experiences');
    if (entries.length) data.experiences = entries;
  }

  const projLines = gather('projects');
  if (projLines.length) {
    const entries = parseEntries(projLines, 'projects');
    if (entries.length) data.projects = entries;
  }

  const eduLines = gather('education');
  if (eduLines.length) {
    const entries = parseEducation(eduLines);
    if (entries.length) data.education = entries;
  }

  const otherLines = gather('others');
  if (otherLines.length) {
    const entries = parseOthers(otherLines);
    if (entries.length) data.others = entries;
  }

  // Unlabelled text at the top that was not contact detail is most likely a
  // summary, so keep it rather than losing it.
  if (!data.summary) {
    const header = blocks.find((b) => b.section === 'header');
    const leftover = header ? parseSummary(header.lines) : '';
    if (leftover.length > 60) data.summary = leftover;
  }

  const report = {
    lineCount: rawLines.length,
    found: [],
    missing: [],
  };

  const note = (label, present) => (present ? report.found : report.missing).push(label);
  note('Name', Boolean(data.fullName));
  note('Email', Boolean(data.mail));
  note('Phone', Boolean(data.mobile));
  note('Summary', Boolean(data.summary));
  note(`Experience${data.experiences ? ` (${data.experiences.length})` : ''}`, Boolean(data.experiences));
  note(`Education${data.education ? ` (${data.education.length})` : ''}`, Boolean(data.education));
  note(`Projects${data.projects ? ` (${data.projects.length})` : ''}`, Boolean(data.projects));
  note('Skills', Boolean(data.skills));

  return { data, report };
};

export default parseResumeText;
