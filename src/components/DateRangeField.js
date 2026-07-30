import React, { useState } from 'react';

/**
 * Month/year pickers for a date range.
 *
 * The stored value stays a single display string ("Jan 2020 - Present"), which
 * is what every template already renders — so this changes how dates are
 * entered without touching the templates or migrating anyone's saved data.
 *
 * Anything already typed that does not parse (e.g. "Summer 2021", "2019-21") is
 * kept verbatim and edited as free text, with a way to switch to the pickers.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CURRENT_YEAR = new Date().getFullYear();
// Far enough back for a long career, and a little ahead for expected grad dates.
const YEARS = Array.from({ length: 56 }, (_, i) => String(CURRENT_YEAR + 5 - i));

const PRESENT_WORDS = /^(present|current|now|ongoing|till date|to date)$/i;

const part = (raw) => {
  const text = (raw || '').trim();
  if (!text) return { month: '', year: '' };
  if (PRESENT_WORDS.test(text)) return { present: true };

  const withMonth = text.match(/^([A-Za-z]{3,9})\.?\s+(\d{4})$/);
  if (withMonth) {
    const month = MONTHS.find((m) => withMonth[1].toLowerCase().startsWith(m.toLowerCase()));
    if (month) return { month, year: withMonth[2] };
    return null;
  }

  const yearOnly = text.match(/^(\d{4})$/);
  if (yearOnly) return { month: '', year: yearOnly[1] };

  return null;
};

/** Split "Jan 2020 - Present" into structured halves, or null if it is freeform. */
export const parseRange = (value) => {
  const text = (value || '').trim();
  if (!text) return { startMonth: '', startYear: '', endMonth: '', endYear: '', present: false };

  const halves = text.split(/\s*[-–—]\s*|\s+to\s+/i);
  if (halves.length !== 2) return null;

  const start = part(halves[0]);
  const end = part(halves[1]);
  if (!start || !end || start.present) return null;

  return {
    startMonth: start.month || '',
    startYear: start.year || '',
    endMonth: end.present ? '' : end.month || '',
    endYear: end.present ? '' : end.year || '',
    present: Boolean(end.present),
  };
};

const format = ({ startMonth, startYear, endMonth, endYear, present }) => {
  const side = (month, year) => [month, year].filter(Boolean).join(' ');
  const left = side(startMonth, startYear);
  const right = present ? 'Present' : side(endMonth, endYear);
  if (!left && !right) return '';
  if (!right) return left;
  if (!left) return right;
  return `${left} - ${right}`;
};

const DateRangeField = ({ id, label = 'Dates', value, onChange }) => {
  const parsed = parseRange(value);
  // Freeform values open in text mode so nothing the user typed is ever
  // silently rewritten or lost.
  const [freeform, setFreeform] = useState(parsed === null);

  const range = parsed || { startMonth: '', startYear: '', endMonth: '', endYear: '', present: false };

  const update = (patch) => onChange(format({ ...range, ...patch }));

  if (freeform) {
    return (
      <div className="date-range-field">
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          type="text"
          className="input-field"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., Jan 2020 - Dec 2021"
        />
        <button type="button" className="date-range-switch" onClick={() => setFreeform(false)}>
          <i className="fas fa-calendar-days"></i> Use date pickers
        </button>
      </div>
    );
  }

  return (
    <div className="date-range-field">
      <label htmlFor={`${id}-start-month`}>{label}</label>

      <div className="date-range-row">
        <select
          id={`${id}-start-month`}
          className="date-range-select"
          value={range.startMonth}
          onChange={(e) => update({ startMonth: e.target.value })}
          aria-label="Start month"
        >
          <option value="">Month</option>
          {MONTHS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          className="date-range-select"
          value={range.startYear}
          onChange={(e) => update({ startYear: e.target.value })}
          aria-label="Start year"
        >
          <option value="">Year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <span className="date-range-dash">to</span>

        <select
          className="date-range-select"
          value={range.endMonth}
          onChange={(e) => update({ endMonth: e.target.value })}
          disabled={range.present}
          aria-label="End month"
        >
          <option value="">Month</option>
          {MONTHS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          className="date-range-select"
          value={range.endYear}
          onChange={(e) => update({ endYear: e.target.value })}
          disabled={range.present}
          aria-label="End year"
        >
          <option value="">Year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="date-range-foot">
        <label className="date-range-present">
          <input
            type="checkbox"
            checked={range.present}
            onChange={(e) => update({ present: e.target.checked })}
          />
          I am here now
        </label>
        <button type="button" className="date-range-switch" onClick={() => setFreeform(true)}>
          Type it instead
        </button>
      </div>
    </div>
  );
};

export default DateRangeField;
