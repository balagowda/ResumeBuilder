import { pdfSafe } from './textPdf';

// jsPDF's standard fonts encode CP1252 only. One character outside that set
// makes jsPDF emit the whole string as UTF-16, and since a standard font ships
// no ToUnicode map, the PDF then *looks* right but copies back as
// "J o s e   G a r c i a". pdfSafe is what keeps the export selectable, so
// these cases guard the encodable boundary rather than the cosmetics.
describe('pdfSafe', () => {
  test('leaves plain ASCII untouched', () => {
    expect(pdfSafe('Java, Python, Go — React')).toBe('Java, Python, Go — React');
  });

  test('recomposes decomposed accents into their CP1252 form', () => {
    // "José" is what a paste out of Word or macOS often carries.
    const decomposed = 'José García';
    expect(decomposed).not.toBe('José García');
    expect(pdfSafe(decomposed)).toBe('José García');
  });

  test('keeps accents, currency and smart quotes that CP1252 covers', () => {
    expect(pdfSafe('Café Zürich façade')).toBe('Café Zürich façade');
    expect(pdfSafe('£50k €30k')).toBe('£50k €30k');
    expect(pdfSafe('“quoted” ‘single’ • – —')).toBe('“quoted” ‘single’ • – —');
  });

  test('substitutes symbols the font cannot encode with readable ASCII', () => {
    expect(pdfSafe('growth 25% ↑')).toBe('growth 25% ^');
    expect(pdfSafe('a → b')).toBe('a -> b');
    expect(pdfSafe('score ≥ 90')).toBe('score >= 90');
    expect(pdfSafe('₹5L')).toBe('Rs.5L');
  });

  test('strips invisible characters that would poison the whole line', () => {
    expect(pdfSafe('Java​Script')).toBe('JavaScript'); // zero-width space
    expect(pdfSafe('Java­Script')).toBe('JavaScript'); // soft hyphen
    expect(pdfSafe('﻿Java')).toBe('Java'); // BOM
  });

  test('normalises exotic spaces so they copy as a plain space', () => {
    expect(pdfSafe('Java Script')).toBe('Java Script');
    expect(pdfSafe('Java Script')).toBe('Java Script');
  });

  test('drops glyphs it cannot represent rather than breaking the line', () => {
    // The surrounding text has to stay copyable — that is the whole point.
    expect(pdfSafe('🚀 shipped')).toBe(' shipped');
    expect(pdfSafe('✓ certified')).toBe(' certified');
    expect(pdfSafe('日本語, Python')).toBe(', Python');
  });

  test('handles null and undefined', () => {
    expect(pdfSafe(null)).toBe('');
    expect(pdfSafe(undefined)).toBe('');
  });

  test('every output character is encodable by a CP1252 font', () => {
    const CP1252_EXTRAS = new Set([...'€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ']);
    const messy = 'José 🚀 ₹5L ≥90 日本語 Java​Script ✓ a→b £€ “x” 25%↑';
    [...pdfSafe(messy)].forEach((ch) => {
      const code = ch.codePointAt(0);
      const encodable =
        (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || CP1252_EXTRAS.has(ch);
      expect(encodable).toBe(true);
    });
  });
});
