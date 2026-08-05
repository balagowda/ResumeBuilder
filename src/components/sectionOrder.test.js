import { DEFAULT_SECTION_ORDER, normalizeSectionOrder } from './ResumeTemplates';

// A drag that did not start on a section handle used to reorder anyway:
// indexOf('') is -1, so the splice deleted the last section and left an empty
// entry behind. The order was persisted, so the section stayed gone across
// reloads — this is the repair for anyone who already hit it.
describe('normalizeSectionOrder', () => {
  test('leaves a valid custom order alone', () => {
    const custom = ['skills', 'summary', 'experiences', 'projects', 'education', 'others'];
    expect(normalizeSectionOrder(custom)).toEqual(custom);
  });

  test('drops an empty entry and restores the section it displaced', () => {
    const corrupted = ['summary', 'skills', '', 'experiences', 'projects', 'education'];
    const repaired = normalizeSectionOrder(corrupted);
    expect(repaired).not.toContain('');
    expect(repaired).toEqual(expect.arrayContaining(DEFAULT_SECTION_ORDER));
    expect(repaired).toHaveLength(DEFAULT_SECTION_ORDER.length);
  });

  test('keeps the surviving sections in the order the user arranged them', () => {
    expect(normalizeSectionOrder(['skills', 'summary', ''])).toEqual([
      'skills',
      'summary',
      'experiences',
      'projects',
      'education',
      'others',
    ]);
  });

  test('discards duplicates and names it does not recognise', () => {
    expect(normalizeSectionOrder(['skills', 'skills', 'nonsense'])).toEqual([
      'skills',
      'summary',
      'experiences',
      'projects',
      'education',
      'others',
    ]);
  });

  test('falls back to the default when there is no usable order', () => {
    expect(normalizeSectionOrder(null)).toEqual(DEFAULT_SECTION_ORDER);
    expect(normalizeSectionOrder('summary')).toEqual(DEFAULT_SECTION_ORDER);
  });
});
