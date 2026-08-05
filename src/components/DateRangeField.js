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

const BLANK_RANGE = { startMonth: '', startYear: '', endMonth: '', endYear: '', present: false };

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

  // A month on its own is what a half-filled range looks like after the user
  // has picked a month but not yet a year. Matched exactly rather than by
  // prefix, so a freeform word that merely starts like a month ("Marketing")
  // is still treated as freeform.
  const monthOnly = MONTHS.find((m) => m.toLowerCase() === text.toLowerCase());
  if (monthOnly) return { month: monthOnly, year: '' };

  return null;
};

/** Split "Jan 2020 - Present" into structured halves, or null if it is freeform. */
export const parseRange = (value) => {
  const text = (value || '').trim();
  if (!text) return { ...BLANK_RANGE };

  const halves = text.split(/\s*[-–—]\s*|\s+to\s+/i);
  if (halves.length > 2) return null;

  // A single point ("2024", "Jan 2020") is a legitimate date on its own, and is
  // also what a half-filled range is stored as. Either way it has to read back,
  // or reopening the entry would show empty pickers over a date that is there.
  if (halves.length === 1) {
    const only = part(halves[0]);
    if (!only) return null;
    if (only.present) return { ...BLANK_RANGE, present: true };
    return { ...BLANK_RANGE, startMonth: only.month || '', startYear: only.year || '' };
  }

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

/** Derive the field's whole view state from a stored date string. */
const seed = (value) => {
  const parsed = parseRange(value);
  // Freeform values open in text mode so nothing the user typed is ever
  // silently rewritten or lost.
  return { value, freeform: parsed === null, range: parsed || { ...BLANK_RANGE } };
};

const DateRangeField = ({ id, label = 'Dates', value = '', onChange }) => {
  // The range is held here as well as in the stored string, because a range
  // being filled in cannot always be spelled unambiguously as one: picking a
  // start year gives "2020", which on its own is indistinguishable from a
  // single-point date. Deriving the pickers from the string alone meant every
  // pick reset the one before it, so a range could never be built at all.
  //
  // It is re-derived whenever `value` arrives as something this field did not
  // itself write — switching resume, an undo, a restored backup, or an entry
  // being deleted above this one — so the pickers can never show another
  // entry's dates, and the mode always matches the value on screen.
  const [local, setLocal] = useState(() => seed(value));
  if (local.value !== value) setLocal(seed(value));

  const { freeform, range } = local;
  const setFreeform = (next) => setLocal((prev) => ({ ...prev, freeform: next }));

  const update = (patch) => {
    const next = { ...range, ...patch };
    const text = format(next);
    setLocal({ value: text, freeform: false, range: next });
    onChange(text);
  };

  const updateFreeform = (text) => {
    setLocal({ value: text, freeform: true, range: parseRange(text) || { ...BLANK_RANGE } });
    onChange(text);
  };

  if (freeform) {
    return (
      <div className="date-range-field">
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          type="text"
          className="input-field"
          value={value}
          onChange={(e) => updateFreeform(e.target.value)}
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
