import React, { useMemo, useState } from 'react';

/**
 * Side-by-side diff of two saved resumes, so someone tailoring one resume per
 * role can see exactly what differs between versions — which bullets were
 * reworded, which skills added — without eyeballing two previews.
 *
 * Pure presentation: it flattens each resume's data into labelled fields and
 * shows the rows that differ. Nothing here mutates the store.
 */

const fieldsFor = (record) => {
  const data = record.data || {};
  const fields = [];
  const push = (key, label, value) => {
    const v = String(value || '').trim();
    fields.push({ key, label, value: v });
  };

  push('fullName', 'Name', data.fullName);
  push('professionalTitle', 'Professional title', data.professionalTitle);
  push('mail', 'Email', data.mail);
  push('mobile', 'Phone', data.mobile);
  push('linkedin', 'LinkedIn', data.linkedin);
  push('github', 'GitHub', data.github);
  push('other', 'Other link', data.other);
  push('summary', 'Summary', data.summary);
  push('skills', 'Skills', data.skills);

  const walk = (list, section, sectionLabel, titleKey, extraKeys) => {
    const seenTitles = new Map();
    (list || []).forEach((entry, i) => {
      if (!entry) return;
      const title = String(entry[titleKey] || '').trim();
      const label = title ? `${sectionLabel}: ${title}` : `${sectionLabel} #${i + 1}`;
      const parts = [title, ...extraKeys.map((k) => String(entry[k] || '').trim())].filter(Boolean);
      // Entries are keyed by their title so a renamed entry shows as one
      // changed row, and reordering alone does not flag every entry.
      const base = title ? title.toLowerCase() : String(i);
      // Two entries can share a title — the same job title at two companies, or
      // two degrees from one school. Left alone they collapse onto one key, so
      // one silently overwrote the other in the diff and React saw duplicates.
      const occurrence = (seenTitles.get(base) || 0) + 1;
      seenTitles.set(base, occurrence);
      const key = `${section}:${base}${occurrence > 1 ? `#${occurrence}` : ''}`;
      push(key, label, parts.join('\n'));
    });
  };

  walk(data.experiences, 'exp', 'Experience', 'title', ['company', 'dates', 'description']);
  walk(data.projects, 'proj', 'Project', 'title', ['dates', 'description']);
  walk(data.education, 'edu', 'Education', 'studyTitle', ['school', 'date', 'score']);
  walk(data.others, 'other-entry', 'Other', 'title', ['description']);

  return fields.filter((f) => f.value);
};

const diffRecords = (a, b) => {
  const aFields = fieldsFor(a);
  const bFields = fieldsFor(b);
  const bByKey = new Map(bFields.map((f) => [f.key, f]));
  const seen = new Set();
  const rows = [];

  aFields.forEach((f) => {
    seen.add(f.key);
    const other = bByKey.get(f.key);
    if (!other) {
      rows.push({ key: f.key, label: f.label, a: f.value, b: '', kind: 'removed' });
    } else if (other.value !== f.value) {
      rows.push({ key: f.key, label: f.label, a: f.value, b: other.value, kind: 'changed' });
    }
  });
  bFields.forEach((f) => {
    if (!seen.has(f.key)) {
      rows.push({ key: f.key, label: f.label, a: '', b: f.value, kind: 'added' });
    }
  });

  return rows;
};

const KIND_LABEL = {
  changed: 'Different',
  added: 'Only in right',
  removed: 'Only in left',
};

const ResumeCompare = ({ resumes, active, onClose }) => {
  const others = resumes.filter((r) => r.id !== active.id);
  const [otherId, setOtherId] = useState(others[0] ? others[0].id : null);
  const other = resumes.find((r) => r.id === otherId) || others[0];

  const rows = useMemo(
    () => (other ? diffRecords(active, other) : []),
    [active, other]
  );

  if (!other) return null;

  return (
    <div className="compare-modal" onClick={onClose}>
      <div className="compare-content" onClick={(e) => e.stopPropagation()}>
        <div className="compare-header">
          <h3>
            <i className="fas fa-code-compare"></i> Compare resumes
          </h3>
          <button className="compare-close" onClick={onClose} title="Close" aria-label="Close comparison">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="compare-picker">
          <span className="compare-side-name">{active.name}</span>
          <span className="compare-vs">vs</span>
          <select
            value={other.id}
            onChange={(e) => setOtherId(e.target.value)}
            aria-label="Resume to compare against"
          >
            {others.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {rows.length === 0 ? (
          <p className="compare-empty">
            <i className="fas fa-circle-check"></i> These two resumes have identical content.
          </p>
        ) : (
          <>
            <p className="compare-summary">
              {rows.length} difference{rows.length === 1 ? '' : 's'} — matching content is hidden.
            </p>
            <div className="compare-rows">
              {rows.map((row) => (
                <div key={row.key} className={`compare-row compare-${row.kind}`}>
                  <div className="compare-row-head">
                    <span className="compare-row-label">{row.label}</span>
                    <span className={`compare-kind compare-kind-${row.kind}`}>{KIND_LABEL[row.kind]}</span>
                  </div>
                  <div className="compare-cells">
                    <div className="compare-cell">
                      {row.a ? <pre>{row.a}</pre> : <span className="compare-missing">— not present —</span>}
                    </div>
                    <div className="compare-cell">
                      {row.b ? <pre>{row.b}</pre> : <span className="compare-missing">— not present —</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeCompare;
