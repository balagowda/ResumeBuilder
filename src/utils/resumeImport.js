/**
 * Import an existing resume file into the editor.
 *
 * Two halves:
 *  - extractTextFromFile: pull plain text out of a PDF (pdf.js), DOCX
 *    (mammoth) or TXT file. The heavy libraries are dynamic imports, so
 *    nothing here adds to the main bundle until someone actually imports.
 *  - parseResumeText: heuristics that turn that text into the editor's
 *    formData shape — name, contact, summary, skills, and dated entries for
 *    experience, education and projects.
 *
 * Like everything else on the site, the file never leaves the browser: both
 * extraction and parsing run entirely on the visitor's machine.
 *
 * Parsing a resume is guesswork by nature — every resume formats differently,
 * and PDF extraction flattens layout. The aim is to get 80% of the typing done
 * and land the user in the editor where the preview makes the misses obvious.
 */

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/[^\s|,;)"']+/i;
const GITHUB_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s|,;)"']+/i;
const URL_RE = /(?:https?:\/\/|www\.)[^\s|,;)"']+/gi;

const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?';
const DATE_POINT = `(?:${MONTH}\\s*,?\\s*\\d{4}|\\d{1,2}\\s*[/.]\\s*\\d{4}|(?:19|20)\\d{2})`;
const DATE_END = `(?:${DATE_POINT}|present|current|now|ongoing|till\\s+date)`;
// A range ("Jan 2020 – Present", "2017-2021") or a single point ("2024").
const DATE_RE = new RegExp(`(${DATE_POINT}\\s*[–—-]\\s*${DATE_END}|${DATE_POINT})`, 'i');

const wordsIn = (text) => text.split(/\s+/).filter(Boolean).length;

// Section headings and the editor section each one feeds. Others-type
// headings keep their own name and land in the "others" list.
const SECTION_DEFS = [
  { key: 'summary', pattern: /^(professional\s+summary|executive\s+summary|summary(\s+of\s+qualifications)?|profile|about(\s+me)?|(career\s+)?objective)$/i },
  { key: 'experiences', pattern: /^((work|professional|relevant)\s+experience|experience(\s*(and|&)\s*internships?)?|employment(\s+history)?|work\s+history|internships?|leadership\s+experience|career\s+history)$/i },
  { key: 'education', pattern: /^(education(al)?(\s+background)?|academics?|academic\s+background|qualifications)$/i },
  { key: 'projects', pattern: /^((key|personal|academic|selected|technical|side)\s+projects?|projects?)$/i },
  { key: 'skills', pattern: /^(technical\s+skills|core\s+(skills|competencies)|skills(\s*(&|and)\s*(interests|abilities|tools|expertise))?|competencies|technologies|tech(nical)?\s+stack|tools(\s*(&|and)\s*technologies)?)$/i },
  { key: 'others', pattern: /^(certifications?(\s*(&|and)\s*(licenses?|training))?|licenses?|awards?(\s*(&|and)\s*honors?)?|honors?(\s*(&|and)\s*awards?)?|achievements?|accomplishments?|languages?|volunteer(ing)?(\s+(experience|work))?|publications?|(extracurricular\s+)?activities|extracurriculars?|interests?|hobbies|additional(\s+information)?|courses?|(relevant\s+)?coursework|references?)$/i },
];

const headingFor = (line) => {
  const normalized = line.replace(/[:\s]+$/, '').trim();
  if (!normalized || normalized.length > 44 || wordsIn(normalized) > 5) return null;
  const def = SECTION_DEFS.find(({ pattern }) => pattern.test(normalized));
  return def ? { key: def.key, label: normalized } : null;
};

const BULLET_PREFIX = /^[\s•\-*–—+·▪◆●○➤➔»❯>]+\s*/;

/** Normalise raw text into trimmed lines, remembering which were bullets. */
const toLines = (text) =>
  String(text || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((raw) => {
      const trimmed = raw.trim();
      const wasBullet = BULLET_PREFIX.test(trimmed) && trimmed.replace(BULLET_PREFIX, '').length > 0;
      return { text: trimmed.replace(BULLET_PREFIX, '').replace(/\s+/g, ' ').trim(), wasBullet };
    })
    .filter((line) => line.text.length > 0);

const digitCount = (s) => (s.match(/\d/g) || []).length;

/** Find a phone number without mistaking a year range ("2017 - 2021") for one. */
const findPhone = (text) => {
  const candidates = text.match(/\+?\d[\d\s().\-/]{6,18}\d/g) || [];
  return (
    candidates.find((c) => {
      const digits = digitCount(c);
      if (digits < 9 || digits > 15) return false;
      // Two 4-digit years joined by a separator is a date range, not a phone.
      if (/^\s*(19|20)\d{2}\s*[–—/-]\s*((19|20)\d{2})?\s*$/.test(c)) return false;
      return true;
    }) || ''
  );
};

const stripContact = (line) =>
  line
    .replace(EMAIL_RE, '')
    .replace(LINKEDIN_RE, '')
    .replace(GITHUB_RE, '')
    .replace(URL_RE, '')
    .replace(/[|,;•·]/g, ' ')
    .trim();

/** Split an entry-header remainder like "Senior Engineer | Acme Corp" in two. */
const splitTitleLine = (text) => {
  const parts = text
    .split(/\s*(?:\||•|·|[–—]|\s-\s|,|\bat\b|@)\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);
  return { first: parts[0] || '', second: parts.slice(1).join(', ') };
};

/** Strip a matched date and dangling separators out of an entry-header line. */
const removeDate = (line, dateText) =>
  line
    .replace(dateText, ' ')
    .replace(/\(\s*\)/g, ' ')
    .replace(/[|,;•·–—-]+\s*$/g, ' ')
    .replace(/^\s*[|,;•·–—-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Parse the lines of one dated-entry section (experience or education).
 *
 * The core signal is a line containing a date: that is an entry header.
 * A short undated line just before it is the other half of the header (title
 * on one line, "Company — dates" on the next). Everything else is description.
 */
const parseDatedEntries = (lines, kind) => {
  const entries = [];
  let current = null;
  let pending = []; // short undated lines waiting for their date line

  const commit = () => {
    if (current) entries.push(current);
    current = null;
  };

  lines.forEach(({ text, wasBullet }) => {
    const dateMatch = text.match(DATE_RE);
    const isHeader =
      !wasBullet &&
      dateMatch &&
      wordsIn(text) <= 14 &&
      wordsIn(removeDate(text, dateMatch[0])) <= 10;

    if (isHeader) {
      commit();
      const rem = removeDate(text, dateMatch[0]);
      const { first, second } = splitTitleLine(rem);
      let title = first;
      let subtitle = second;
      if (pending.length > 0) {
        // "Senior Engineer" \n "Acme Corp | Jan 2020 – Present"
        title = pending[0];
        subtitle = [pending[1], first, second].filter(Boolean).join(', ');
      }
      current =
        kind === 'education'
          ? { studyTitle: title, school: subtitle, date: dateMatch[0], score: '' }
          : { title, company: subtitle, dates: dateMatch[0], description: '' };
      pending = [];
      return;
    }

    const isShortPlain = !wasBullet && wordsIn(text) <= 8 && !EMAIL_RE.test(text);

    if (current) {
      if (kind === 'education') {
        const score = text.match(/(?:gpa|cgpa)\s*[-:]?\s*[\d.]+(?:\s*\/\s*[\d.]+)?|\d{1,3}(?:\.\d+)?\s*%/i);
        if (score && !current.score) {
          current.score = score[0];
          return;
        }
        if (!current.school && isShortPlain) {
          current.school = text;
          return;
        }
        return; // education rarely carries bullets the editor wants
      }
      // A short plain line right after the header, before any bullets, is the
      // company ("Software Engineer, Jan 2020 –" \n "Nimbus Labs").
      if (!current.description && !current.company && isShortPlain && !DATE_RE.test(text)) {
        current.company = text;
        return;
      }
      // A short plain line after the bullets is more likely the next entry's
      // title ("Software Engineer" \n "Nimbus Labs | Jun 2020 – …") than more
      // description — hold it for the next date line.
      if (current.description && isShortPlain && !DATE_RE.test(text)) {
        pending = [...pending.slice(-1), text];
        return;
      }
      current.description = current.description ? `${current.description}\n${text}` : text;
      return;
    }

    if (isShortPlain) {
      pending = [...pending.slice(-1), text];
    } else if (entries.length === 0 && !current) {
      // Prose before any header — keep it so the content is not lost.
      pending = [];
      current = kind === 'education'
        ? { studyTitle: text, school: '', date: '', score: '' }
        : { title: '', company: '', dates: '', description: text };
    }
  });
  commit();

  // Pending lines that never met a date: with no entries yet they are one
  // undated entry ("BSc Computer Science" with no year); with entries already
  // parsed they are trailing text — append to the last entry so nothing the
  // file contained silently disappears.
  if (pending.length > 0) {
    if (entries.length === 0) {
      entries.push(
        kind === 'education'
          ? { studyTitle: pending[0], school: pending[1] || '', date: '', score: '' }
          : { title: pending[0], company: pending[1] || '', dates: '', description: '' }
      );
    } else if (kind !== 'education') {
      const last = entries[entries.length - 1];
      last.description = [last.description, ...pending].filter(Boolean).join('\n');
    }
  }

  return entries.slice(0, 15);
};

/** Projects: dates are optional, so a short plain line starts a new entry. */
const parseProjectEntries = (lines) => {
  const entries = [];
  let current = null;

  lines.forEach(({ text, wasBullet }) => {
    const dateMatch = text.match(DATE_RE);
    const isTitleLine = !wasBullet && wordsIn(text) <= 10 && (!current || current.description);

    if (isTitleLine) {
      if (current) entries.push(current);
      const rem = dateMatch ? removeDate(text, dateMatch[0]) : text;
      current = { title: rem, description: '', dates: dateMatch ? dateMatch[0] : '' };
      return;
    }
    if (!current) {
      current = { title: '', description: '', dates: '' };
    }
    current.description = current.description ? `${current.description}\n${text}` : text;
  });
  if (current) entries.push(current);

  return entries.filter((e) => e.title || e.description).slice(0, 12);
};

/**
 * Turn extracted resume text into the editor's formData shape.
 *
 * Returns { data, stats } — data holds only the fields that were found, ready
 * to spread over an empty formData; stats summarise what was recognised so the
 * UI can tell the user what to double-check.
 */
export const parseResumeText = (rawText) => {
  const allText = String(rawText || '');
  const lines = toLines(allText);

  const data = {};

  // ---- Contact: searched in the whole document -----------------------------
  const email = allText.match(EMAIL_RE);
  if (email) data.mail = email[0];
  const linkedin = allText.match(LINKEDIN_RE);
  if (linkedin) data.linkedin = linkedin[0].replace(/[.,;]$/, '');
  const github = allText.match(GITHUB_RE);
  if (github) data.github = github[0].replace(/[.,;]$/, '');
  const phone = findPhone(allText);
  if (phone) data.mobile = phone.replace(/\s+/g, ' ').trim();
  const otherUrl = (allText.match(URL_RE) || []).find(
    (u) => !/linkedin\.com|github\.com/i.test(u) && !EMAIL_RE.test(u)
  );
  if (otherUrl) data.other = otherUrl.replace(/[.,;]$/, '');

  // ---- Split into sections -------------------------------------------------
  const sections = []; // { key, label, lines }
  let currentSection = { key: 'header', label: 'Header', lines: [] };
  lines.forEach((line) => {
    const heading = line.wasBullet ? null : headingFor(line.text);
    if (heading) {
      sections.push(currentSection);
      currentSection = { key: heading.key, label: heading.label, lines: [] };
      return;
    }
    currentSection.lines.push(line);
  });
  sections.push(currentSection);

  // ---- Header block: name, title, stray summary prose ----------------------
  const header = sections.find((s) => s.key === 'header');
  const headerProse = [];
  if (header) {
    let nameFound = false;
    let titleFound = false;
    header.lines.slice(0, 10).forEach(({ text }) => {
      const contactFree = stripContact(text);
      if (!contactFree || EMAIL_RE.test(text) || DATE_RE.test(text)) return;
      if (findPhone(text)) return;
      const words = wordsIn(contactFree);
      if (!nameFound && words >= 2 && words <= 5 && contactFree.length <= 40 && !/\d/.test(contactFree)) {
        data.fullName = contactFree;
        nameFound = true;
        return;
      }
      if (nameFound && !titleFound && words <= 6 && contactFree.length <= 60 && !/\d/.test(contactFree)) {
        data.professionalTitle = contactFree;
        data.showProfessionalTitle = true;
        titleFound = true;
        return;
      }
      if (words >= 8) headerProse.push(text);
    });
  }

  // ---- Each recognised section --------------------------------------------
  const sectionLines = (key) => sections.filter((s) => s.key === key).flatMap((s) => s.lines);

  const summaryLines = sectionLines('summary');
  if (summaryLines.length > 0) {
    data.summary = summaryLines.map((l) => l.text).join('\n');
  } else if (headerProse.length > 0) {
    // No summary heading, but the header held real prose — that is a summary.
    data.summary = headerProse.join('\n');
  }

  const skillLines = sectionLines('skills');
  if (skillLines.length > 0) {
    data.skills = skillLines
      .map((l) => l.text.replace(/[,;]\s*$/, ''))
      .join(', ')
      .replace(/\s+/g, ' ');
  }

  const experienceLines = sectionLines('experiences');
  const experiences = parseDatedEntries(experienceLines, 'experience');
  if (experiences.length > 0) data.experiences = experiences;

  const educationLines = sectionLines('education');
  const education = parseDatedEntries(educationLines, 'education');
  if (education.length > 0) data.education = education;

  const projectLines = sectionLines('projects');
  const projects = parseProjectEntries(projectLines);
  if (projects.length > 0) data.projects = projects;

  // Every others-type section becomes one entry titled with its own heading.
  const others = sections
    .filter((s) => s.key === 'others' && s.lines.length > 0)
    .map((s) => ({
      title: s.label,
      description: s.lines.map((l) => l.text).join('\n'),
    }));
  if (others.length > 0) data.others = others;

  const stats = {
    name: !!data.fullName,
    contactParts: ['mail', 'mobile', 'linkedin', 'github'].filter((k) => data[k]).length,
    summary: !!data.summary,
    skills: !!data.skills,
    experiences: experiences.length,
    education: education.length,
    projects: projects.length,
    others: others.length,
    foundAnything:
      !!(data.fullName || data.summary || data.skills || data.mail) ||
      experiences.length + education.length + projects.length + others.length > 0,
  };

  return { data, stats };
};

// File extraction (PDF/DOCX readers) lives in resumeImportFiles.js — it uses
// import.meta for the pdf.js worker URL, which Jest cannot parse, and this
// module needs to stay importable by plain unit tests.
