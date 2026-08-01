import { analyzeJobMatchText, normalizeText } from './keywordMatch';

// analyzeJobMatchText refuses job descriptions under 15 tokens, so pad the
// term under test into a realistic posting.
const jd = (terms) =>
  `We are looking for an engineer to join the team. You will design and ship
   features, collaborate with product, and own delivery end to end using ${terms}.`;

const missingTerms = (result) => result.missing.map((m) => m.term);
const matchedTerms = (result) => result.matched.map((m) => m.term);

describe('synonym handling', () => {
  test('JS in the posting matches JavaScript on the resume', () => {
    const result = analyzeJobMatchText(jd('JS and CSS'), 'Built SPAs with JavaScript and CSS');
    expect(matchedTerms(result)).toContain('javascript');
    expect(missingTerms(result)).not.toContain('js');
  });

  test('Amazon Web Services collapses to aws on both sides', () => {
    expect(normalizeText('Amazon Web Services')).toBe('aws');
    const result = analyzeJobMatchText(jd('Amazon Web Services'), 'Deployed services on AWS');
    expect(matchedTerms(result)).toContain('aws');
  });

  test('K8s matches Kubernetes', () => {
    const result = analyzeJobMatchText(jd('K8s and Docker'), 'Ran workloads on Kubernetes with Docker');
    expect(matchedTerms(result)).toContain('kubernetes');
  });
});

describe('stemming', () => {
  test('inflections of the same verb match each other', () => {
    const result = analyzeJobMatchText(
      jd('optimizing databases and planning capacity'),
      'Optimized PostgreSQL databases and planned capacity for 3 services'
    );
    expect(missingTerms(result)).not.toContain('optimizing');
    expect(missingTerms(result)).not.toContain('planning');
  });

  test('still reports genuinely missing keywords', () => {
    const result = analyzeJobMatchText(jd('Terraform and GraphQL'), 'Wrote Python scripts for reporting');
    expect(missingTerms(result)).toEqual(expect.arrayContaining(['terraform', 'graphql']));
  });
});
