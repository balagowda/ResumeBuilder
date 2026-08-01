import { lintSources } from './contentLint';

const sourceWith = (text) => [{ section: 'experiences', index: 0, label: 'Experience: Test', text }];

const rulesIn = (result) => result.issues.map((i) => i.rule);

describe('spelling rule', () => {
  test('flags a known misspelling with its correction', () => {
    const result = lintSources(sourceWith('Recieved the managment award for 3 projects'));
    const spelling = result.issues.filter((i) => i.rule === 'spelling');

    expect(spelling).toHaveLength(1);
    expect(spelling[0].severity).toBe('high');
    expect(spelling[0].message).toMatch(/recieved/);
    expect(spelling[0].message).toMatch(/managment/);
    expect(spelling[0].fix).toMatch(/"recieved" → "received"/);
    expect(spelling[0].fix).toMatch(/"managment" → "management"/);
  });

  test('one issue per bullet, not per word', () => {
    const result = lintSources(
      sourceWith('Acheived sucessful seperate outcomes across 4 enviroments')
    );
    expect(result.issues.filter((i) => i.rule === 'spelling')).toHaveLength(1);
  });

  test('stays quiet on correctly spelled text and unknown proper nouns', () => {
    const result = lintSources(
      sourceWith('Delivered the Kubernetes migration for HatchResume, cutting deploy time 40%')
    );
    expect(rulesIn(result)).not.toContain('spelling');
  });

  test('regional variants are not treated as mistakes', () => {
    const result = lintSources(sourceWith('Organised the annual fulfilment programme review with 6 teams'));
    expect(rulesIn(result)).not.toContain('spelling');
  });
});
