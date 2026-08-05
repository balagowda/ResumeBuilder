import { parseRange } from './DateRangeField';

// The pickers write a single display string and read it back on every render,
// so anything format() can produce has to survive the round trip. When it did
// not, each pick reset the one before it and a range could never be built.
describe('parseRange round trip', () => {
  const cases = [
    ['', { startMonth: '', startYear: '', endMonth: '', endYear: '', present: false }],
    ['Jan', { startMonth: 'Jan', startYear: '', endMonth: '', endYear: '', present: false }],
    ['2020', { startMonth: '', startYear: '2020', endMonth: '', endYear: '', present: false }],
    ['Jan 2020', { startMonth: 'Jan', startYear: '2020', endMonth: '', endYear: '', present: false }],
    ['Present', { startMonth: '', startYear: '', endMonth: '', endYear: '', present: true }],
    ['Jan 2020 - Dec', { startMonth: 'Jan', startYear: '2020', endMonth: 'Dec', endYear: '', present: false }],
    [
      'Jan 2020 - Dec 2023',
      { startMonth: 'Jan', startYear: '2020', endMonth: 'Dec', endYear: '2023', present: false },
    ],
    ['2020 - 2023', { startMonth: '', startYear: '2020', endMonth: '', endYear: '2023', present: false }],
    [
      'Jan 2020 - Present',
      { startMonth: 'Jan', startYear: '2020', endMonth: '', endYear: '', present: true },
    ],
  ];

  test.each(cases)('%s parses back to its parts', (value, expected) => {
    expect(parseRange(value)).toEqual(expected);
  });
});

describe('freeform detection', () => {
  test.each(['Summer 2021', '2019-21', 'Fall semester', 'Q3 2022 onwards'])(
    'keeps %s as freeform text',
    (value) => {
      expect(parseRange(value)).toBeNull();
    }
  );

  test('a word that merely starts like a month is not a month', () => {
    expect(parseRange('Marketing')).toBeNull();
  });
});
