/**
 * Render the editor's formData as the plain text an ATS parser would extract
 * from the exported ATS PDF — standard headings, a contact line, one bullet
 * per line. Feeding this to checkResumeText gives the editor a live ATS score
 * that reflects the document a recruiting system will actually see.
 */

const line = (v) => String(v || '').trim();

export const resumeToAtsText = (formData, sectionOrder, experienceHeading) => {
  if (!formData) return '';
  const out = [];

  if (line(formData.fullName)) out.push(line(formData.fullName));
  if (formData.showProfessionalTitle && line(formData.professionalTitle)) {
    out.push(line(formData.professionalTitle));
  }
  const contact = [formData.mail, formData.mobile, formData.linkedin, formData.github, formData.other]
    .map(line)
    .filter(Boolean)
    .join(' | ');
  if (contact) out.push(contact);

  const bullets = (text) =>
    String(text || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

  const sections = {
    summary: () => {
      if (!line(formData.summary)) return;
      out.push('', 'SUMMARY', ...bullets(formData.summary));
    },
    skills: () => {
      if (!line(formData.skills)) return;
      out.push('', 'SKILLS', line(formData.skills));
    },
    experiences: () => {
      const entries = (formData.experiences || []).filter((e) => e && (line(e.title) || line(e.company)));
      if (entries.length === 0) return;
      out.push('', (experienceHeading || 'Experience').toUpperCase());
      entries.forEach((e) => {
        out.push([line(e.title), line(e.company)].filter(Boolean).join(' — ') + (line(e.dates) ? `, ${line(e.dates)}` : ''));
        out.push(...bullets(e.description));
      });
    },
    projects: () => {
      const entries = (formData.projects || []).filter((e) => e && line(e.title));
      if (entries.length === 0) return;
      out.push('', 'PROJECTS');
      entries.forEach((e) => {
        out.push(line(e.title) + (line(e.dates) ? ` (${line(e.dates)})` : ''));
        out.push(...bullets(e.description));
      });
    },
    education: () => {
      const entries = (formData.education || []).filter((e) => e && (line(e.studyTitle) || line(e.school)));
      if (entries.length === 0) return;
      out.push('', 'EDUCATION');
      entries.forEach((e) => {
        out.push(
          [line(e.studyTitle), line(e.school)].filter(Boolean).join(' — ') +
            (line(e.date) ? `, ${line(e.date)}` : '') +
            (line(e.score) ? `, ${line(e.score)}` : '')
        );
      });
    },
    others: () => {
      (formData.others || []).forEach((o) => {
        if (!o || !line(o.title)) return;
        out.push('', line(o.title).toUpperCase(), ...bullets(o.description));
      });
    },
  };

  (sectionOrder || Object.keys(sections)).forEach((key) => {
    if (sections[key]) sections[key]();
  });

  return out.join('\n').trim();
};

export default resumeToAtsText;
