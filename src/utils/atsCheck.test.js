import { checkResumeText, extractBullets } from './atsCheck';

// A short but well-formed resume: standard headings, contact details in the
// body, dates, and quantified bullets.
const GOOD_RESUME = `Priya Raghavan
Software Engineer
priya.raghavan@email.com | +1 (206) 555-0148 | linkedin.com/in/priyaraghavan

SUMMARY
Backend-leaning full-stack engineer with 5 years building payment and data infrastructure at consumer scale.

EXPERIENCE
Software Engineer II - Northwind Payments, Mar 2023 - Present
Rebuilt the checkout retry pipeline in Go, cutting failed transactions from 4.1% to 1.3% and recovering roughly $2.4M in annual volume
Reduced p95 API latency from 410ms to 90ms by adding read-through caching and removing three N+1 query paths
Mentored 3 engineers through onboarding and their first on-call rotation, cutting escalations to senior staff by half

EDUCATION
B.E. Computer Science, PES University, 2017 - 2021

SKILLS
Go, Python, TypeScript, React, PostgreSQL, Kafka, Kubernetes, AWS`;

const stateOf = (result, id) => result.checks.find((check) => check.id === id).state;

describe('extractBullets', () => {
  test('picks up achievement lines and leaves the scaffolding alone', () => {
    const bullets = extractBullets(GOOD_RESUME);

    // Three achievements plus the one-line summary — and nothing else. The
    // name, the contact line, the section headings, the role header with its
    // dates, the degree line and the comma-separated skills list are all
    // structure, not prose, and linting them produced nonsense like telling
    // someone their skills list should open with an action verb.
    expect(bullets.filter((b) => b.section === 'body')).toHaveLength(3);
    expect(bullets.filter((b) => b.section === 'summary')).toHaveLength(1);

    const text = bullets.map((b) => b.line).join('\n');
    expect(text).not.toMatch(/PES University/);
    expect(text).not.toMatch(/Kubernetes, AWS/);
    expect(text).not.toMatch(/Northwind Payments, Mar 2023/);
    expect(text).not.toMatch(/555-0148/);
  });

  test('reads bullets whatever glyph they start with', () => {
    const bullets = extractBullets(
      'EXPERIENCE\n• Shipped a Kafka ingestion service processing 1.8M events per minute reliably\n- Migrated 40 batch jobs from cron to Airflow, cutting pipeline failures by 70%'
    );

    expect(bullets).toHaveLength(2);
    expect(bullets[0].line.startsWith('Shipped')).toBe(true);
    expect(bullets[1].line.startsWith('Migrated')).toBe(true);
  });
});

describe('checkResumeText', () => {
  test('returns an empty result for empty input rather than a zero score', () => {
    expect(checkResumeText('   ').empty).toBe(true);
  });

  test('passes a well-formed resume on every structural check', () => {
    const result = checkResumeText(GOOD_RESUME);

    for (const id of ['contact', 'links', 'sections', 'quantified', 'dates', 'formatting']) {
      expect(stateOf(result, id)).toBe('pass');
    }
    expect(result.stats.bullets).toBe(3);
    expect(result.stats.quantified).toBe(3);
    expect(result.writing.issues).toHaveLength(0);
  });

  test('flags a resume with no contact details or headings', () => {
    const result = checkResumeText(
      'Some person\nDid various things at a company for a while and then did other things elsewhere too'
    );

    expect(stateOf(result, 'contact')).toBe('fail');
    expect(stateOf(result, 'sections')).toBe('fail');
    expect(result.score).toBeLessThan(50);
  });

  test('catches a weak opener inside an otherwise sound resume', () => {
    const weakened = GOOD_RESUME.replace(
      'Reduced p95 API latency',
      'Responsible for reducing p95 API latency'
    );
    const result = checkResumeText(weakened);

    expect(result.writing.issues.map((issue) => issue.rule)).toContain('weak-opener');
    expect(result.score).toBeLessThan(checkResumeText(GOOD_RESUME).score);
  });

  test('warns about decorative characters that break text extraction', () => {
    const result = checkResumeText(GOOD_RESUME.replace(/^EXPERIENCE$/m, '▪ EXPERIENCE │ ROLES'));

    expect(['warn', 'fail']).toContain(stateOf(result, 'formatting'));
  });

  test('orders failures ahead of passes', () => {
    const result = checkResumeText(GOOD_RESUME);
    const rank = { fail: 0, warn: 1, pass: 2 };
    const states = result.checks.map((check) => rank[check.state]);

    expect([...states].sort()).toEqual(states);
  });
});
