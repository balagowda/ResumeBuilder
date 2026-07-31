// Complete, role-specific resume examples.
//
// Each entry carries a full formData blob in exactly the shape the editor uses,
// so "Use this example" hands the builder a finished resume instead of a blank
// form. The same data is rendered as static text by scripts/seo-postbuild.js —
// a resume example page is only useful to a search engine if the example
// itself is on the page.
//
// JSX-free on purpose: the build scripts import this module directly.

const FONT = 'Arial, Helvetica, sans-serif';

// Every example shares the typography defaults so the editor opens them the
// same way it opens a new resume.
const baseFields = {
  other: '',
  others: [],
  jobDescription: '',
  addHeaderLine: true,
  showProfessionalTitle: true,
  fontHeading: FONT,
  fontSubheading: FONT,
  fontText: FONT,
  lineHeight: 1.4,
  contentScale: 1,
};

export const EXAMPLE_RESUMES = [
  {
    slug: 'software-engineer',
    role: 'Software Engineer',
    year: '2026',
    // Dates the example page reports in its Article markup, and what the
    // sitemap uses for this URL. Bump "updated" when the resume text changes.
    published: '2026-07-31',
    updated: '2026-07-31',
    navLabel: 'Software engineer',
    templateId: 6,
    templateNote: 'FAANG Engineer — the single-column layout big-tech recruiters expect',
    summaryLine:
      'Five years of backend and full-stack work, written the way engineering recruiters scan it.',
    intro:
      'A complete software engineer resume example: one page, single column, and quantified. Every bullet leads with a verb and ends in a number, because an engineering resume is judged on scope and impact rather than responsibilities. Open it in the editor, replace the content with your own, and export a PDF.',
    whatWorks: [
      'Bullets open with what was built or fixed, not with "Responsible for"',
      'Impact is measured — latency, error rate, users, cost — not adjectives',
      'The skills line names concrete technologies an ATS keyword filter looks for',
      'Links are written in full so a parser reads them as text, not as hidden markup',
      'One page, single column: no sidebar for an ATS to interleave',
    ],
    data: {
      ...baseFields,
      fullName: 'Priya Raghavan',
      professionalTitle: 'Software Engineer',
      mail: 'priya.raghavan@email.com',
      mobile: '+1 (206) 555-0148',
      linkedin: 'linkedin.com/in/priyaraghavan',
      github: 'github.com/priyaraghavan',
      summary:
        'Backend-leaning full-stack engineer with 5 years building payment and data infrastructure at consumer scale. Cut a checkout failure rate by two thirds, took a service from 400ms to 90ms at p95, and mentored three engineers through their first on-call rotation.',
      skills:
        'Go, Python, TypeScript, React, PostgreSQL, Redis, Kafka, gRPC, Docker, Kubernetes, AWS, Terraform, CI/CD, Distributed Systems, System Design',
      experiences: [
        {
          title: 'Software Engineer II',
          company: 'Northwind Payments',
          dates: 'Mar 2023 – Present',
          description:
            'Rebuilt the checkout retry pipeline in Go, cutting failed transactions from 4.1% to 1.3% and recovering roughly $2.4M in annual volume\nReduced p95 API latency from 410ms to 90ms by adding read-through caching and removing three N+1 query paths\nDesigned the idempotency layer now used by every payment service, eliminating duplicate charges during provider outages\nMentored 3 engineers through onboarding and their first on-call rotation, cutting escalations to senior staff by half',
        },
        {
          title: 'Software Engineer',
          company: 'Loomis Data',
          dates: 'Jul 2021 – Feb 2023',
          description:
            'Shipped a Kafka ingestion service processing 1.8M events per minute with an at-least-once delivery guarantee\nMigrated 40 batch jobs from cron to Airflow, cutting pipeline failures by 70% and making reruns self-service\nBuilt the internal metrics dashboard in React and TypeScript used daily by 120 engineers and analysts',
        },
      ],
      projects: [
        {
          title: 'pgshadow — Postgres query replay',
          dates: '2025',
          description:
            'Open-source tool that replays production query traffic against a staging database; 1.4K GitHub stars and used by 30+ teams to catch regressions before deploy',
        },
      ],
      education: [
        {
          studyTitle: 'B.E. Computer Science',
          school: 'PES University, Bangalore',
          date: '2017 – 2021',
          score: 'CGPA 8.9/10',
        },
      ],
    },
  },

  {
    slug: 'data-analyst',
    role: 'Data Analyst',
    year: '2026',
    // Dates the example page reports in its Article markup, and what the
    // sitemap uses for this URL. Bump "updated" when the resume text changes.
    published: '2026-07-31',
    updated: '2026-07-31',
    navLabel: 'Data analyst',
    templateId: 7,
    templateNote: 'ATS Pro Plain — plain headings that survive any parser',
    summaryLine:
      'Analytics work framed as decisions changed, not dashboards produced.',
    intro:
      'A complete data analyst resume example. The hard part of an analytics resume is showing that the analysis changed something — this one names the decision behind each project. Open it in the editor, swap in your own numbers, and export a PDF.',
    whatWorks: [
      'Each bullet names the decision the analysis drove, not just the tool used',
      'SQL, Python and the BI tool appear in the skills line and again in context',
      'Numbers are business numbers — retention, cost, hours saved — not row counts',
      'Certifications sit near the bottom where recruiters expect them',
      'Plain section headings ("Experience", "Education") that every ATS recognises',
    ],
    data: {
      ...baseFields,
      fullName: 'Daniel Okonkwo',
      professionalTitle: 'Data Analyst',
      mail: 'daniel.okonkwo@email.com',
      mobile: '+1 (312) 555-0192',
      linkedin: 'linkedin.com/in/danielokonkwo',
      github: '',
      summary:
        'Data analyst with 4 years turning product and revenue data into decisions at subscription businesses. Built the churn model that redirected a $600K retention budget, and cut the finance team\'s monthly close from six days to two.',
      skills:
        'SQL, Python (pandas, scikit-learn), dbt, Snowflake, Tableau, Looker, Excel, A/B Testing, Cohort Analysis, Forecasting, Statistics',
      experiences: [
        {
          title: 'Data Analyst',
          company: 'Cadence Software',
          dates: 'Jan 2024 – Present',
          description:
            'Built a churn propensity model in Python that identified the 12% of accounts driving 60% of lost revenue, redirecting a $600K retention budget\nRedesigned the executive revenue dashboard in Tableau, replacing 14 conflicting reports with one source finance and sales both sign off on\nAutomated the monthly close pipeline with dbt and Snowflake, cutting it from 6 days to 2 and removing 30 hours of manual work per month\nRan 22 pricing and onboarding A/B tests; the winning checkout variant lifted trial-to-paid conversion by 9%',
        },
        {
          title: 'Junior Data Analyst',
          company: 'Meridian Retail Group',
          dates: 'Aug 2022 – Dec 2023',
          description:
            'Segmented 2.1M customers into eight behavioural cohorts, raising email campaign revenue per send by 24%\nWrote the SQL library the analytics team still uses for cohort and retention queries, cutting ad-hoc request turnaround from 3 days to same day\nForecast weekly demand across 40 stores within 6% error, reducing overstock write-offs by $180K in the first year',
        },
      ],
      projects: [
        {
          title: 'Chicago transit reliability study',
          dates: '2024',
          description:
            'Analysed 3 years of public transit data in Python; published findings on delay clustering that were cited in two local news pieces',
        },
      ],
      education: [
        {
          studyTitle: 'B.S. Statistics, minor in Economics',
          school: 'University of Illinois Urbana-Champaign',
          date: '2018 – 2022',
          score: 'GPA 3.7/4.0',
        },
      ],
    },
  },

  {
    slug: 'product-manager',
    role: 'Product Manager',
    year: '2026',
    // Dates the example page reports in its Article markup, and what the
    // sitemap uses for this URL. Bump "updated" when the resume text changes.
    published: '2026-07-31',
    updated: '2026-07-31',
    navLabel: 'Product manager',
    templateId: 1,
    templateNote: 'Professional Executive — clean and conservative, reads well in any industry',
    summaryLine:
      'Outcomes and trade-offs rather than a list of features shipped.',
    intro:
      'A complete product manager resume example. PM resumes fail when they read as a feature changelog; this one leads with the outcome and names the trade-off behind it. Open it in the editor, replace the content with your own, and export a PDF.',
    whatWorks: [
      'Every bullet ends in a metric the business cares about, not a ship date',
      'Scope is explicit — team size, user count, revenue owned',
      'Discovery work is included, so the resume shows judgement and not just delivery',
      'No jargon stack ("synergised cross-functional alignment") that says nothing',
      'A conservative single-column layout that reads the same in any industry',
    ],
    data: {
      ...baseFields,
      fullName: 'Hannah Lindqvist',
      professionalTitle: 'Product Manager',
      mail: 'hannah.lindqvist@email.com',
      mobile: '+1 (415) 555-0177',
      linkedin: 'linkedin.com/in/hannahlindqvist',
      github: '',
      summary:
        'Product manager with 6 years on B2B SaaS platforms, owning roadmaps worth $18M in ARR. Took a self-serve onboarding flow from concept to 41% activation, and killed two projects early that would have cost a year of engineering time.',
      skills:
        'Product Discovery, Roadmapping, User Research, A/B Testing, SQL, Jira, Figma, Pricing Strategy, Go-to-Market, Stakeholder Management',
      experiences: [
        {
          title: 'Senior Product Manager',
          company: 'Alto Workflow',
          dates: 'Apr 2023 – Present',
          description:
            'Owned the self-serve onboarding roadmap for a $18M ARR platform, raising 30-day activation from 22% to 41% across four releases\nLed discovery with 60 customers that reframed the 2025 roadmap around permissions rather than reporting, the top churn driver in enterprise accounts\nKilled two in-flight initiatives after prototype testing showed no measurable lift, freeing roughly 9 engineer-months for the permissions work\nPartnered with sales and support to launch usage-based pricing, growing expansion revenue 27% year over year',
        },
        {
          title: 'Product Manager',
          company: 'Brightline Health',
          dates: 'Jun 2020 – Mar 2023',
          description:
            'Shipped the patient scheduling rebuild used by 400 clinics, cutting no-show rates by 18% through reminders and self-reschedule\nDefined the API strategy that opened three integration partnerships, adding 2,300 accounts in the first year\nBuilt the weekly product review with engineering and design that cut average cycle time from 21 days to 12',
        },
      ],
      projects: [
        {
          title: 'Accessibility audit programme',
          dates: '2022',
          description:
            'Ran a company-wide WCAG 2.1 audit and prioritised remediation across 6 teams, bringing the flagship product to AA conformance in two quarters',
        },
      ],
      education: [
        {
          studyTitle: 'B.A. Cognitive Science',
          school: 'University of California, San Diego',
          date: '2015 – 2019',
          score: 'GPA 3.6/4.0',
        },
      ],
    },
  },
];

export const findExample = (slug) =>
  EXAMPLE_RESUMES.find((example) => example.slug === String(slug || '').toLowerCase());

/** Flatten an example into the sections a static page (or a plain-text summary)
 *  needs. Shared by the React page and the pre-render script. */
export const exampleSections = (example) => {
  const { data } = example;
  return [
    { heading: 'Summary', lines: [data.summary] },
    {
      heading: 'Experience',
      lines: data.experiences.flatMap((entry) => [
        `${entry.title} — ${entry.company} (${entry.dates})`,
        ...entry.description.split('\n'),
      ]),
    },
    {
      heading: 'Projects',
      lines: data.projects.flatMap((entry) => [
        `${entry.title}${entry.dates ? ` (${entry.dates})` : ''}`,
        ...entry.description.split('\n'),
      ]),
    },
    {
      heading: 'Education',
      lines: data.education.map(
        (entry) => `${entry.studyTitle} — ${entry.school} (${entry.date}), ${entry.score}`
      ),
    },
    { heading: 'Skills', lines: [data.skills] },
  ];
};
