/**
 * One-click ATS PDF: a real text-layer PDF built with jsPDF's text API.
 *
 * The image PDF is an exact snapshot of the chosen template; this one is its
 * deliberate opposite — a clean single-column document in a standard PDF font,
 * with selectable text, clickable links, and page breaks that only ever land
 * between blocks. That is exactly the shape ATS parsers read most reliably,
 * so it does not try to reproduce the template's visual design.
 *
 * Everything runs in the browser; nothing leaves the page.
 */

import { jsPDF } from 'jspdf';

// A4 in points.
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;

const SIZE = {
  name: 20,
  title: 12,
  contact: 9.5,
  heading: 11.5,
  entryTitle: 10.5,
  body: 10,
};

const LINE_GAP = 1.35;

/** Map the editor's CSS font stacks onto the two standard PDF font families. */
const pdfFontFor = (cssStack) => {
  const stack = String(cssStack || '').toLowerCase();
  if (/times|georgia|garamond|cambria|source serif/.test(stack)) return 'times';
  // A generic `serif` fallback also signals a serif choice — but `sans-serif`
  // contains the substring "serif", so rule that out explicitly.
  if (/(^|[^-])\bserif\b/.test(stack.replace(/sans-serif/g, ''))) return 'times';
  return 'helvetica';
};

/** Split a description field into bullet lines the same way templates render it. */
const toLines = (text) =>
  String(text || '')
    .split('\n')
    .map((line) => line.replace(/^[\s•\-*–—+·]+/, '').trim())
    .filter(Boolean);

const ensureUrl = (value) => {
  const v = String(value || '').trim();
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
};

export default function generateAtsPdf({ formData, sectionOrder, experienceHeading }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const bodyFont = pdfFontFor(formData.fontText);
  const headFont = pdfFontFor(formData.fontHeading);

  let y = MARGIN;

  const lineHeight = (size) => size * LINE_GAP;

  /** Start a new page when the next block of `height` pt would not fit. */
  const ensureSpace = (height) => {
    if (y + height > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  /** Write wrapped text, paginating between wrapped lines. */
  const writeWrapped = (text, { size = SIZE.body, font = bodyFont, style = 'normal', x = MARGIN, width = CONTENT_W, color = 20 } = {}) => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, width);
    lines.forEach((line) => {
      ensureSpace(lineHeight(size));
      doc.text(line, x, y);
      y += lineHeight(size);
    });
  };

  /** A bullet with a hanging indent, kept on one page when it fits. */
  const writeBullet = (text) => {
    doc.setFont(bodyFont, 'normal');
    doc.setFontSize(SIZE.body);
    doc.setTextColor(20);
    const indent = 12;
    const lines = doc.splitTextToSize(text, CONTENT_W - indent);
    ensureSpace(Math.min(lines.length, 2) * lineHeight(SIZE.body));
    lines.forEach((line, i) => {
      ensureSpace(lineHeight(SIZE.body));
      if (i === 0) doc.text('•', MARGIN + 2, y);
      doc.text(line, MARGIN + indent, y);
      y += lineHeight(SIZE.body);
    });
    y += 1;
  };

  /** Section heading with a hairline rule under it. */
  const writeHeading = (label) => {
    // Never strand a heading at the foot of a page.
    ensureSpace(lineHeight(SIZE.heading) + lineHeight(SIZE.body) * 2);
    y += 6;
    doc.setFont(headFont, 'bold');
    doc.setFontSize(SIZE.heading);
    doc.setTextColor(20);
    doc.text(label.toUpperCase(), MARGIN, y);
    y += 4;
    doc.setDrawColor(120);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += lineHeight(SIZE.body) * 0.9;
  };

  /** Entry header: bold title on the left, dates right-aligned on the same line. */
  const writeEntryHeader = (title, dates) => {
    ensureSpace(lineHeight(SIZE.entryTitle) + lineHeight(SIZE.body) * 2);
    doc.setFont(bodyFont, 'bold');
    doc.setFontSize(SIZE.entryTitle);
    doc.setTextColor(20);
    const dateText = String(dates || '').trim();
    const dateW = dateText ? doc.getTextWidth(dateText) : 0;
    const titleLines = doc.splitTextToSize(String(title || '').trim(), CONTENT_W - dateW - 12);
    titleLines.forEach((line, i) => {
      ensureSpace(lineHeight(SIZE.entryTitle));
      doc.text(line, MARGIN, y);
      if (i === 0 && dateText) {
        doc.setFont(bodyFont, 'normal');
        doc.text(dateText, PAGE_W - MARGIN - dateW, y);
        doc.setFont(bodyFont, 'bold');
      }
      y += lineHeight(SIZE.entryTitle);
    });
  };

  // ---- Header ---------------------------------------------------------------
  const fullName = String(formData.fullName || '').trim() || 'Your Name';
  doc.setFont(headFont, 'bold');
  doc.setFontSize(SIZE.name);
  doc.setTextColor(10);
  doc.text(fullName, MARGIN, y + SIZE.name * 0.35);
  y += lineHeight(SIZE.name);

  if (formData.showProfessionalTitle && formData.professionalTitle) {
    doc.setFont(headFont, 'normal');
    doc.setFontSize(SIZE.title);
    doc.setTextColor(60);
    doc.text(String(formData.professionalTitle).trim(), MARGIN, y);
    y += lineHeight(SIZE.title);
  }

  // Contact line: plain visible text (ATS parsers read it), clickable where a
  // target exists.
  const contacts = [
    formData.mail && { text: String(formData.mail).trim(), url: `mailto:${String(formData.mail).trim()}` },
    formData.mobile && { text: String(formData.mobile).trim() },
    formData.linkedin && { text: String(formData.linkedin).trim(), url: ensureUrl(formData.linkedin) },
    formData.github && { text: String(formData.github).trim(), url: ensureUrl(formData.github) },
    formData.other && { text: String(formData.other).trim(), url: ensureUrl(formData.other) },
  ].filter(Boolean);

  if (contacts.length > 0) {
    doc.setFont(bodyFont, 'normal');
    doc.setFontSize(SIZE.contact);
    doc.setTextColor(40);
    const sep = '   |   ';
    const sepW = doc.getTextWidth(sep);
    let x = MARGIN;
    contacts.forEach((c, i) => {
      const w = doc.getTextWidth(c.text);
      if (x > MARGIN && x + w > PAGE_W - MARGIN) {
        x = MARGIN;
        y += lineHeight(SIZE.contact);
      }
      if (c.url) doc.textWithLink(c.text, x, y, { url: c.url });
      else doc.text(c.text, x, y);
      x += w;
      if (i < contacts.length - 1) {
        doc.text(sep, x, y);
        x += sepW;
      }
    });
    y += lineHeight(SIZE.contact);
  }

  y += 2;
  doc.setDrawColor(60);
  doc.setLineWidth(1);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += lineHeight(SIZE.body);

  // ---- Sections, in the user's order ---------------------------------------
  const hasEntries = (list, key) =>
    Array.isArray(list) && list.some((e) => e && String(e[key] || '').trim());

  const sections = {
    summary: () => {
      if (!String(formData.summary || '').trim()) return;
      writeHeading('Summary');
      toLines(formData.summary).forEach((line) => writeWrapped(line));
    },
    skills: () => {
      if (!String(formData.skills || '').trim()) return;
      writeHeading('Skills');
      writeWrapped(String(formData.skills).trim());
    },
    experiences: () => {
      if (!hasEntries(formData.experiences, 'title') && !hasEntries(formData.experiences, 'company')) return;
      writeHeading(experienceHeading || 'Experience');
      (formData.experiences || []).forEach((exp) => {
        if (!exp || (!String(exp.title || '').trim() && !String(exp.company || '').trim())) return;
        writeEntryHeader(exp.title || exp.company, exp.dates);
        if (String(exp.title || '').trim() && String(exp.company || '').trim()) {
          writeWrapped(String(exp.company).trim(), { style: 'italic', color: 60 });
        }
        toLines(exp.description).forEach(writeBullet);
        y += 3;
      });
    },
    projects: () => {
      if (!hasEntries(formData.projects, 'title')) return;
      writeHeading('Projects');
      (formData.projects || []).forEach((proj) => {
        if (!proj || !String(proj.title || '').trim()) return;
        writeEntryHeader(proj.title, proj.dates);
        toLines(proj.description).forEach(writeBullet);
        y += 3;
      });
    },
    education: () => {
      if (!hasEntries(formData.education, 'studyTitle') && !hasEntries(formData.education, 'school')) return;
      writeHeading('Education');
      (formData.education || []).forEach((edu) => {
        if (!edu || (!String(edu.studyTitle || '').trim() && !String(edu.school || '').trim())) return;
        writeEntryHeader(edu.studyTitle || edu.school, edu.date);
        const detail = [
          String(edu.studyTitle || '').trim() && String(edu.school || '').trim() ? String(edu.school).trim() : '',
          String(edu.score || '').trim(),
        ]
          .filter(Boolean)
          .join(' — ');
        if (detail) writeWrapped(detail, { style: 'italic', color: 60 });
        y += 3;
      });
    },
    others: () => {
      if (!hasEntries(formData.others, 'title')) return;
      writeHeading('Additional');
      (formData.others || []).forEach((item) => {
        if (!item || !String(item.title || '').trim()) return;
        writeEntryHeader(item.title, item.dates);
        toLines(item.description).forEach(writeBullet);
        y += 3;
      });
    },
  };

  (sectionOrder || Object.keys(sections)).forEach((key) => {
    if (sections[key]) sections[key]();
  });

  const filename = `${formData.fullName ? String(formData.fullName).trim().replace(/\s+/g, '_') : 'Resume'}_ATS.pdf`;
  doc.save(filename);
}
