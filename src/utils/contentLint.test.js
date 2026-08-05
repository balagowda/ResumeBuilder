import { lintSources } from './contentLint';

const sourceWith = (text) => [{ section: 'experiences', index: 0, label: 'Experience: Test', text }];

// Weak opener and nothing measured — the two rules a genuinely padded bullet
// trips. No digits: a number in the text would satisfy the metric rule and make
// this a milder fixture than it reads as.
const weakBullets = (count) =>
  sourceWith(
    Array.from({ length: count }, () => 'Responsible for maintaining the internal billing system').join('\n')
  );

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

describe('scoring', () => {
  // The score used to be a raw sum of issue weights, so it measured length as
  // much as quality: past about a dozen issues every resume read 0 and stopped
  // responding to edits.
  test('does not depend on how many bullets a resume has', () => {
    const short = lintSources(weakBullets(4)).score;
    const long = lintSources(weakBullets(30)).score;
    expect(Math.abs(short - long)).toBeLessThanOrEqual(2);
  });

  test('a resume of consistently weak bullets scores badly without bottoming out', () => {
    const { score } = lintSources(weakBullets(20));
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(40);
  });

  test('fixing some of the bullets moves the score', () => {
    const allWeak = lintSources(weakBullets(10)).score;
    const halfFixed = lintSources(
      sourceWith(
        [
          ...Array.from({ length: 5 }, () => 'Responsible for maintaining the internal billing system'),
          ...Array.from({ length: 5 }, (_, i) => `Rebuilt the billing pipeline, cutting failures by ${i + 10}%`),
        ].join('\n')
      )
    ).score;
    expect(halfFixed).toBeGreaterThan(allWeak + 10);
  });

  test('a well-written resume still scores near the top', () => {
    const { score } = lintSources(
      sourceWith(
        [
          'Rebuilt the payments pipeline, cutting transaction failures by 38%',
          'Shipped a real-time analytics service handling 2M events per minute',
          'Mentored 4 engineers and drove adoption of service-level objectives',
        ].join('\n')
      )
    );
    expect(score).toBeGreaterThanOrEqual(90);
  });

  test('a resume with no bullets scores 0 rather than a misleading 100', () => {
    expect(lintSources([]).score).toBe(0);
  });
});
