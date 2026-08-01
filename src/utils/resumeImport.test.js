import { parseResumeText } from './resumeImport';

const SAMPLE = `Priya Raghavan
Software Engineer
priya.raghavan@email.com | +1 (206) 555-0148 | linkedin.com/in/priyaraghavan | github.com/priyar

SUMMARY
Backend-leaning full-stack engineer with 5 years building payment and data infrastructure at consumer scale.

EXPERIENCE
Software Engineer II | Northwind Payments | Mar 2023 - Present
• Rebuilt the checkout retry pipeline in Go, cutting failed transactions from 4.1% to 1.3%
• Reduced p95 API latency from 410ms to 90ms by adding read-through caching

Software Engineer
Nimbus Labs | Jun 2020 - Dec 2022
• Developed customer-facing dashboard in React used by 300K monthly users

PROJECTS
OpenDeploy — CI/CD Toolkit
Open-source deployment toolkit with 2.1K GitHub stars; automated canary rollouts on Kubernetes

EDUCATION
B.E. Computer Science, PES University, 2017 - 2021
GPA: 8.9/10

SKILLS
Go, Python, TypeScript, React, PostgreSQL, Kafka, Kubernetes, AWS

CERTIFICATIONS
AWS Solutions Architect Associate, 2023`;

describe('parseResumeText', () => {
  const { data, stats } = parseResumeText(SAMPLE);

  test('finds name and professional title', () => {
    expect(data.fullName).toBe('Priya Raghavan');
    expect(data.professionalTitle).toBe('Software Engineer');
    expect(data.showProfessionalTitle).toBe(true);
  });

  test('extracts contact details without mistaking date ranges for phones', () => {
    expect(data.mail).toBe('priya.raghavan@email.com');
    expect(data.mobile).toContain('555-0148');
    expect(data.linkedin).toBe('linkedin.com/in/priyaraghavan');
    expect(data.github).toBe('github.com/priyar');
  });

  test('captures summary and skills', () => {
    expect(data.summary).toMatch(/full-stack engineer with 5 years/);
    expect(data.skills).toMatch(/Go, Python, TypeScript/);
  });

  test('splits experience entries on dated headers, both one- and two-line forms', () => {
    expect(data.experiences).toHaveLength(2);

    const [first, second] = data.experiences;
    expect(first.title).toBe('Software Engineer II');
    expect(first.company).toBe('Northwind Payments');
    expect(first.dates).toMatch(/Mar 2023 - Present/i);
    expect(first.description).toMatch(/Rebuilt the checkout retry pipeline/);
    expect(first.description.split('\n')).toHaveLength(2);

    // Title on its own line, company + dates on the next.
    expect(second.title).toBe('Software Engineer');
    expect(second.company).toBe('Nimbus Labs');
    expect(second.description).toMatch(/customer-facing dashboard/);
  });

  test('parses education with score', () => {
    expect(data.education).toHaveLength(1);
    expect(data.education[0].date).toMatch(/2017 - 2021/);
    expect(data.education[0].score).toMatch(/8.9/);
  });

  test('parses projects without requiring dates', () => {
    expect(data.projects).toHaveLength(1);
    expect(data.projects[0].title).toMatch(/OpenDeploy/);
    expect(data.projects[0].description).toMatch(/canary rollouts/);
  });

  test('keeps unrecognised sections as others entries', () => {
    expect(data.others).toHaveLength(1);
    expect(data.others[0].title).toBe('CERTIFICATIONS');
    expect(data.others[0].description).toMatch(/Solutions Architect/);
  });

  test('reports what it found', () => {
    expect(stats.foundAnything).toBe(true);
    expect(stats.experiences).toBe(2);
    expect(stats.contactParts).toBe(4);
  });

  test('empty input finds nothing', () => {
    expect(parseResumeText('').stats.foundAnything).toBe(false);
  });

  test('header prose without a summary heading becomes the summary', () => {
    const { data: d } = parseResumeText(
      'Alex Chen\nProduct designer with a decade of experience shipping consumer mobile apps at scale.\n\nSKILLS\nFigma, Prototyping'
    );
    expect(d.fullName).toBe('Alex Chen');
    expect(d.summary).toMatch(/decade of experience/);
  });
});
