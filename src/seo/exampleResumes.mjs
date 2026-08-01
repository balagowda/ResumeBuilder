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
  {
    slug: 'frontend-developer',
    role: 'Frontend Developer',
    year: '2026',
    published: '2026-08-01',
    updated: '2026-08-01',
    navLabel: 'Frontend developer',
    templateId: 10,
    templateNote: 'Modern Accent — contemporary but still strictly single-column and ATS-safe',
    summaryLine: 'Interface work measured in load time, conversion and accessibility, not screenshots.',
    intro:
      'A complete frontend developer resume example. Frontend resumes drown in framework lists; this one leads with what the interfaces achieved — faster loads, higher conversion, accessibility shipped — and lets the stack support the story. Open it in the editor, replace the content with your own, and export a PDF.',
    whatWorks: [
      'Performance work is stated in numbers a hiring manager can check — LCP, bundle size, conversion',
      'Accessibility appears as shipped work, not a keyword',
      'The stack list is specific (React, TypeScript, Next.js) without padding every tool ever touched',
      'A real open-source project with adoption numbers backs up the skills',
      'Single column, standard headings — nothing for a parser to misread',
    ],
    data: {
      ...baseFields,
      fullName: 'Mateo Alvarez',
      professionalTitle: 'Frontend Developer',
      mail: 'mateo.alvarez@email.com',
      mobile: '+1 (512) 555-0163',
      linkedin: 'linkedin.com/in/mateoalvarez',
      github: 'github.com/mateoalvarez',
      summary:
        'Frontend developer with 5 years building consumer and e-commerce interfaces in React and TypeScript. Halved the largest contentful paint on a storefront serving 2M monthly visitors and led the accessibility work that took it to WCAG 2.1 AA.',
      skills:
        'JavaScript, TypeScript, React, Next.js, Redux, HTML, CSS, Tailwind CSS, Web Performance, Accessibility (WCAG 2.1), Jest, Playwright, Webpack, Vite, REST APIs, GraphQL',
      experiences: [
        {
          title: 'Frontend Developer',
          company: 'Harbor Commerce',
          dates: 'Feb 2023 – Present',
          description:
            'Cut largest contentful paint from 4.2s to 1.9s on a storefront with 2M monthly visitors by code-splitting routes and deferring third-party scripts, lifting checkout conversion 11%\nLed the WCAG 2.1 AA remediation across 40 components, clearing every blocker flagged in an enterprise client audit and unblocking a $1.2M contract\nRebuilt the design system in TypeScript and Storybook, used by 5 teams and cutting new-page build time from days to hours\nReduced the main bundle from 610KB to 270KB gzipped by auditing dependencies and replacing three libraries with platform APIs',
        },
        {
          title: 'Web Developer',
          company: 'Craftpost Studio',
          dates: 'Jun 2021 – Jan 2023',
          description:
            'Shipped 14 marketing and e-commerce sites in React and Next.js, all scoring 90+ on Lighthouse performance at launch\nBuilt a reusable checkout flow adopted across 6 client projects, cutting integration time by roughly a week each\nIntroduced Playwright end-to-end tests to the agency workflow, catching regressions that had previously reached 3 client launches per year',
        },
      ],
      projects: [
        {
          title: 'usetable — headless React table library',
          dates: '2025',
          description:
            'Open-source headless table component with keyboard navigation and virtualised rows; 900 GitHub stars and 40K npm downloads per month',
        },
      ],
      education: [
        {
          studyTitle: 'B.S. Computer Science',
          school: 'University of Texas at Austin',
          date: '2017 – 2021',
          score: 'GPA 3.5/4.0',
        },
      ],
    },
  },

  {
    slug: 'devops-engineer',
    role: 'DevOps Engineer',
    year: '2026',
    published: '2026-08-01',
    updated: '2026-08-01',
    navLabel: 'DevOps engineer',
    templateId: 9,
    templateNote: 'Compact One-Page — dense and scannable, right for infrastructure careers',
    summaryLine: 'Infrastructure work framed as reliability and cost, the two numbers that get DevOps hired.',
    intro:
      'A complete DevOps engineer resume example. Infrastructure resumes are judged on two numbers — how reliable you made it and what you saved — so every bullet here carries uptime, deploy frequency or dollars. Open it in the editor, swap in your own systems, and export a PDF.',
    whatWorks: [
      'Reliability is quantified: error budgets, MTTR, deploy frequency — not "improved stability"',
      'Cloud cost work is stated in dollars, the number every engineering leader tracks',
      'Tools appear in context ("migrated to Terraform") rather than as a wall of logos',
      'On-call and incident work shows ownership, not just tooling',
      'A dense single page — senior infrastructure careers do not need two',
    ],
    data: {
      ...baseFields,
      fullName: 'Amara Diallo',
      professionalTitle: 'DevOps Engineer',
      mail: 'amara.diallo@email.com',
      mobile: '+1 (720) 555-0184',
      linkedin: 'linkedin.com/in/amaradiallo',
      github: 'github.com/amaradiallo',
      summary:
        'DevOps engineer with 6 years running Kubernetes platforms on AWS for high-traffic products. Took deploys from weekly to 30 a day with zero-downtime releases, cut the cloud bill by $38K a month, and brought p1 incident MTTR under 25 minutes.',
      skills:
        'AWS, Kubernetes, Terraform, Docker, Helm, ArgoCD, GitHub Actions, Jenkins, Prometheus, Grafana, Datadog, Python, Bash, Linux, PostgreSQL, Incident Response, SRE Practices',
      experiences: [
        {
          title: 'Senior DevOps Engineer',
          company: 'Ridgeline Systems',
          dates: 'May 2022 – Present',
          description:
            'Migrated 60 services from hand-managed EC2 to Kubernetes with Terraform and ArgoCD, taking deploy frequency from weekly to 30 per day with zero-downtime releases\nCut the AWS bill by $38K per month (31%) through rightsizing, spot instances for batch workloads, and deleting 14 orphaned environments\nBuilt the observability stack on Prometheus and Grafana with SLO-based alerts, reducing pages per on-call week from 22 to 6 and p1 MTTR from 90 to 24 minutes\nWrote the incident review process now used by all 5 product teams, closing 85% of action items within two sprints',
        },
        {
          title: 'DevOps Engineer',
          company: 'Bluepeak Software',
          dates: 'Aug 2019 – Apr 2022',
          description:
            'Replaced a 45-minute manual release with a GitHub Actions pipeline running tests, canary deploy and automatic rollback in under 12 minutes\nAutomated database failover drills in Python, cutting recovery time in the annual DR test from 4 hours to 40 minutes\nStood up centralised logging for 30 services, cutting mean time to diagnose customer-reported bugs by half',
        },
      ],
      projects: [
        {
          title: 'kube-janitor-policies',
          dates: '2024',
          description:
            'Open-source policy pack that finds and expires orphaned Kubernetes resources; adopted by 20+ companies and saving one adopter a reported $9K per month',
        },
      ],
      education: [
        {
          studyTitle: 'B.S. Information Technology',
          school: 'Colorado State University',
          date: '2013 – 2017',
          score: 'GPA 3.4/4.0',
        },
      ],
    },
  },

  {
    slug: 'ux-designer',
    role: 'UX Designer',
    year: '2026',
    published: '2026-08-01',
    updated: '2026-08-01',
    navLabel: 'UX designer',
    templateId: 19,
    templateNote: 'Swiss Minimal — design-led typography that still parses as a single column',
    summaryLine: 'Design decisions tied to task completion and conversion, with the portfolio one click away.',
    intro:
      'A complete UX designer resume example. The portfolio shows the craft; the resume has one job — proving the designs moved a metric. Every bullet here pairs a design decision with what it changed. Open it in the editor, replace the content with your own, and export a PDF.',
    whatWorks: [
      'The portfolio URL is written out in full where a parser and a recruiter both find it',
      'Bullets tie design work to task completion, conversion and support volume',
      'Research is concrete — participants, methods, what changed because of it',
      'The tools line is short; nobody is hired for knowing Figma',
      'Distinctive typography that stays single-column, so an ATS reads it in order',
    ],
    data: {
      ...baseFields,
      fullName: 'Sofia Marchetti',
      professionalTitle: 'UX Designer',
      mail: 'sofia.marchetti@email.com',
      mobile: '+1 (646) 555-0121',
      linkedin: 'linkedin.com/in/sofiamarchetti',
      github: '',
      other: 'sofiamarchetti.design',
      summary:
        'UX designer with 5 years on B2B and healthcare products. Redesigned an insurance claims flow that raised completion from 54% to 81%, and built the research practice that now runs 8 studies a quarter. Portfolio at sofiamarchetti.design.',
      skills:
        'User Research, Usability Testing, Wireframing, Prototyping, Interaction Design, Information Architecture, Design Systems, Figma, Accessibility, A/B Testing, Journey Mapping',
      experiences: [
        {
          title: 'Senior UX Designer',
          company: 'Clearpath Insurance',
          dates: 'Mar 2023 – Present',
          description:
            'Redesigned the claims submission flow after 24 usability sessions, raising completion from 54% to 81% and cutting related support calls by 35%\nBuilt the design system with engineering — 48 components in Figma mapped one-to-one to code — cutting design-to-build handoff time by half\nRan the accessibility push to WCAG 2.1 AA across the customer portal, opening two enterprise deals that required conformance\nEstablished the quarterly research cadence of 8 studies, giving product teams evidence for 60% of roadmap decisions within a year',
        },
        {
          title: 'Product Designer',
          company: 'Loop Health',
          dates: 'Jul 2020 – Feb 2023',
          description:
            'Designed the appointment booking redesign that took mobile conversion from 2.9% to 4.6% across 400 clinics\nMapped the end-to-end patient journey with 30 interviews, surfacing the three drop-off points that shaped the next two quarters of work\nPrototyped and tested 5 onboarding variants; the winner cut time-to-first-booking from 11 minutes to 4',
        },
      ],
      projects: [
        {
          title: 'Open-source icon accessibility audit',
          dates: '2024',
          description:
            'Audited 3 popular open-source icon sets for screen-reader and contrast issues; findings adopted upstream in two of them and presented at a 300-person local UX meetup',
        },
      ],
      education: [
        {
          studyTitle: 'B.F.A. Interaction Design',
          school: 'Parsons School of Design',
          date: '2016 – 2020',
          score: 'GPA 3.7/4.0',
        },
      ],
    },
  },

  {
    slug: 'marketing-manager',
    role: 'Marketing Manager',
    year: '2026',
    published: '2026-08-01',
    updated: '2026-08-01',
    navLabel: 'Marketing manager',
    templateId: 23,
    templateNote: 'Coral Warm — approachable single-column style suited to customer-facing roles',
    summaryLine: 'Campaigns reported as pipeline and revenue, the way a CMO reads them.',
    intro:
      'A complete marketing manager resume example. Marketing resumes fail when they list channels instead of results; this one reports pipeline, CAC and revenue — the numbers the hiring CMO actually manages. Open it in the editor, swap in your own campaigns, and export a PDF.',
    whatWorks: [
      'Every campaign bullet ends in pipeline, revenue or CAC — not impressions',
      'Budget ownership is explicit, which is what separates manager from coordinator',
      'Channel breadth shows without a buzzword wall: paid, lifecycle, content, events each appear once with a result',
      'Team leadership is quantified — headcount, and what the team shipped',
      'A warm but conventional layout that parses cleanly',
    ],
    data: {
      ...baseFields,
      fullName: 'Rachel Osei',
      professionalTitle: 'Marketing Manager',
      mail: 'rachel.osei@email.com',
      mobile: '+1 (404) 555-0139',
      linkedin: 'linkedin.com/in/rachelosei',
      github: '',
      summary:
        'Marketing manager with 7 years in B2B SaaS demand generation. Grew qualified pipeline 68% year over year on a $1.4M budget, cut blended CAC by 22%, and built the lifecycle programme that now sources a third of expansion revenue.',
      skills:
        'Demand Generation, Lifecycle Marketing, Paid Search, Paid Social, SEO, Content Strategy, Marketing Analytics, HubSpot, Salesforce, Google Analytics, A/B Testing, Budget Management, Team Leadership',
      experiences: [
        {
          title: 'Marketing Manager',
          company: 'Fieldstone Software',
          dates: 'Jan 2023 – Present',
          description:
            'Owned a $1.4M demand generation budget across paid, content and events, growing qualified pipeline 68% year over year while cutting blended CAC 22%\nBuilt the lifecycle email programme from scratch — 14 automated journeys in HubSpot — now sourcing 31% of expansion revenue\nLaunched the customer webinar series that became the second-highest converting channel, producing 240 opportunities in its first year\nManaged a team of 3 specialists, promoting two, and established the weekly experiment review that ships 6 tests a month',
        },
        {
          title: 'Digital Marketing Specialist',
          company: 'Brightgrove Analytics',
          dates: 'Apr 2019 – Dec 2022',
          description:
            'Grew organic traffic from 18K to 75K monthly sessions in two years through a keyword-led content programme of 90 articles\nRestructured paid search accounts, cutting cost per qualified lead from $310 to $185 across a $40K monthly spend\nRan the rebrand launch campaign that delivered 1,900 signups in six weeks, 40% above target',
        },
      ],
      projects: [
        {
          title: 'Attribution model rebuild',
          dates: '2024',
          description:
            'Led the switch from last-touch to position-based attribution with revenue ops, reallocating 20% of paid budget and adding an estimated $400K in annual pipeline at flat spend',
        },
      ],
      education: [
        {
          studyTitle: 'B.B.A. Marketing',
          school: 'Georgia State University',
          date: '2013 – 2017',
          score: 'GPA 3.6/4.0',
        },
      ],
    },
  },

  {
    slug: 'financial-analyst',
    role: 'Financial Analyst',
    year: '2026',
    published: '2026-08-01',
    updated: '2026-08-01',
    navLabel: 'Financial analyst',
    templateId: 8,
    templateNote: 'Harvard Classic — the format finance and consulting recruiters expect',
    summaryLine: 'Modelling and reporting work stated in decisions funded and dollars found.',
    intro:
      'A complete financial analyst resume example in the conservative Harvard format finance recruiters expect. The bullets do what finance resumes must: name the model, the decision it informed, and the dollars involved. Open it in the editor, replace the content with your own, and export a PDF.',
    whatWorks: [
      'Every bullet names the decision the analysis informed, with the dollar amount attached',
      'Modelling skill is shown through the model built, not the phrase "financial modelling"',
      'Process improvements are timed — days cut from the close, hours automated away',
      'The CFA progress sits in a dedicated line where screeners look for it',
      'The Harvard layout: centered name, ruled headings, zero decoration to confuse a parser',
    ],
    data: {
      ...baseFields,
      fullName: 'James Whitfield',
      professionalTitle: 'Financial Analyst',
      mail: 'james.whitfield@email.com',
      mobile: '+1 (212) 555-0158',
      linkedin: 'linkedin.com/in/jameswhitfield',
      github: '',
      summary:
        'Financial analyst with 4 years in FP&A at a $220M revenue software company. Built the driver-based forecast now used for board planning, found $2.1M in cost savings, and cut the monthly close reporting package from five days to two. CFA Level III candidate.',
      skills:
        'Financial Modelling, FP&A, Budgeting, Forecasting, Variance Analysis, Excel (advanced), SQL, Power BI, NetSuite, Anaplan, SaaS Metrics, GAAP Reporting',
      experiences: [
        {
          title: 'Financial Analyst II',
          company: 'Meridian Cloud Group',
          dates: 'Jun 2023 – Present',
          description:
            'Built the driver-based revenue forecast in Anaplan now used for board planning, cutting forecast error from 9% to 3% over four quarters\nIdentified $2.1M in annual savings through a vendor and cloud-spend review, presented to the CFO and fully realised within two quarters\nAutomated the monthly reporting package with SQL and Power BI, cutting preparation from 5 days to 2 and freeing 25 analyst hours a month\nPartnered with sales leadership on pricing scenarios for the enterprise tier, supporting a repricing that lifted average contract value 14%',
        },
        {
          title: 'Junior Financial Analyst',
          company: 'Hartwell Manufacturing',
          dates: 'Jul 2021 – May 2023',
          description:
            'Ran monthly variance analysis across 12 cost centres, flagging the raw-material overrun that led to renegotiating two supplier contracts worth $800K annually\nRebuilt the capex approval model in Excel, cutting approval turnaround from three weeks to one\nSupported the annual budget cycle for a $95M division, consolidating inputs from 9 department heads',
        },
      ],
      projects: [
        {
          title: 'SaaS metrics dashboard',
          dates: '2024',
          description:
            'Designed the ARR, net retention and CAC-payback dashboard in Power BI that replaced quarterly spreadsheet reporting; now reviewed weekly by the executive team',
        },
      ],
      education: [
        {
          studyTitle: 'B.S. Finance',
          school: 'New York University, Stern School of Business',
          date: '2017 – 2021',
          score: 'GPA 3.8/4.0',
        },
      ],
      others: [
        {
          title: 'Certifications',
          description: 'CFA Level III candidate (Level II passed, 2025)\nFinancial Modeling & Valuation Analyst (FMVA), 2022',
        },
      ],
    },
  },

  {
    slug: 'registered-nurse',
    role: 'Registered Nurse',
    year: '2026',
    published: '2026-08-01',
    updated: '2026-08-01',
    navLabel: 'Registered nurse',
    templateId: 16,
    templateNote: 'Corporate Blue — a familiar, trusted format that reads well to clinical recruiters',
    summaryLine: 'Clinical experience with the license, unit type and patient ratios screeners scan for.',
    intro:
      'A complete registered nurse resume example. Nursing screeners look for four things in seconds — license, unit type, patient ratio, certifications — so this resume puts all four where they cannot be missed. Open it in the editor, replace the content with your own, and export a PDF.',
    whatWorks: [
      'License and certifications sit in their own section with numbers and expiry-ready formatting',
      'Each role states the unit, bed count and typical patient ratio up front',
      'Quality work is quantified — falls reduced, audit scores, response times',
      'Precepting and charge experience show leadership without a management title',
      'A conventional format; clinical recruiters distrust decorative resumes',
    ],
    data: {
      ...baseFields,
      fullName: 'Grace Nakamura',
      professionalTitle: 'Registered Nurse (RN, BSN)',
      mail: 'grace.nakamura@email.com',
      mobile: '+1 (503) 555-0117',
      linkedin: 'linkedin.com/in/gracenakamura',
      github: '',
      summary:
        'Medical-surgical registered nurse with 5 years of acute care experience across 32-bed units, typically at a 1:4 ratio. Led the fall-prevention initiative that cut unit falls 40%, precept for new graduates, and serve as relief charge nurse two shifts a week.',
      skills:
        'Medical-Surgical Nursing, Telemetry, Patient Assessment, Medication Administration, IV Therapy, Wound Care, Epic EHR, Care Planning, Patient Education, Charge Nurse Duties, Precepting',
      experiences: [
        {
          title: 'Registered Nurse — Medical-Surgical/Telemetry',
          company: 'St. Alder Regional Medical Center, Portland, OR',
          dates: 'Sep 2022 – Present',
          description:
            'Provided direct care on a 32-bed med-surg/telemetry unit at a 1:4 ratio, maintaining a 96% patient satisfaction score across three years\nLed the unit fall-prevention initiative — hourly rounding and bed-alarm standardisation — reducing falls 40% in twelve months\nServed as relief charge nurse two shifts weekly, coordinating assignments, admissions and staffing for a team of 9\nPrecepted 7 new graduate nurses through a 12-week orientation, with all seven retained past their first year',
        },
        {
          title: 'Registered Nurse — Medical Unit',
          company: 'Cascade Valley Hospital, Salem, OR',
          dates: 'Jul 2020 – Aug 2022',
          description:
            'Managed care for 4–5 acute medical patients per shift, achieving 100% on quarterly medication administration audits for two years\nCut average call-light response time on the unit from 6 to 3 minutes by co-designing a shared response protocol adopted across 3 units\nEducated 200+ patients and families on discharge care plans, contributing to a 12% drop in 30-day readmissions for CHF patients',
        },
      ],
      projects: [
        {
          title: 'Bedside handoff standardisation',
          dates: '2023',
          description:
            'Co-led the switch to structured bedside shift reports across two units, raising handoff audit compliance from 61% to 94% and catching medication discrepancies earlier',
        },
      ],
      education: [
        {
          studyTitle: 'B.S.N. Nursing',
          school: 'Oregon Health & Science University',
          date: '2016 – 2020',
          score: 'GPA 3.7/4.0',
        },
      ],
      others: [
        {
          title: 'Licenses & Certifications',
          description: 'Registered Nurse, Oregon Board of Nursing — active\nBLS and ACLS, American Heart Association — current\nMedical-Surgical Nursing Certification (CMSRN), 2024',
        },
      ],
    },
  },

  {
    slug: 'project-manager',
    role: 'Project Manager',
    year: '2026',
    published: '2026-08-01',
    updated: '2026-08-01',
    navLabel: 'Project manager',
    templateId: 14,
    templateNote: 'Timeline Professional — career progression drawn as a timeline, apt for delivery roles',
    summaryLine: 'Delivery stated in budgets, dates hit, and what the projects returned.',
    intro:
      'A complete project manager resume example. PM resumes earn interviews on three numbers — budget managed, delivery record, and business result — and every bullet here carries at least one. Open it in the editor, swap in your own programmes, and export a PDF.',
    whatWorks: [
      'Budget and team size appear in the first line of every role',
      'On-time delivery is stated as a record ("11 of 12 milestones"), not a claim',
      'Each project names the business outcome, not just the go-live',
      'The PMP sits in a dedicated certifications line where screeners check for it',
      'Risk and stakeholder work is concrete — what was caught, what it saved',
    ],
    data: {
      ...baseFields,
      fullName: 'Omar Haddad',
      professionalTitle: 'Project Manager, PMP',
      mail: 'omar.haddad@email.com',
      mobile: '+1 (313) 555-0195',
      linkedin: 'linkedin.com/in/omarhaddad',
      github: '',
      summary:
        'PMP-certified project manager with 8 years delivering software and systems programmes up to $6M. Delivered 11 of the last 12 major milestones on or ahead of schedule, and brought a failing ERP migration back on track to launch within its revised budget.',
      skills:
        'Project Planning, Agile & Waterfall Delivery, Risk Management, Stakeholder Management, Budgeting, Resource Planning, Jira, MS Project, Confluence, Vendor Management, Change Management',
      experiences: [
        {
          title: 'Senior Project Manager',
          company: 'Lakeshore Digital',
          dates: 'Oct 2022 – Present',
          description:
            'Managed a $6M ERP migration across finance and operations with a 14-person cross-functional team, recovering a programme 4 months behind and launching within the revised budget\nDelivered 11 of 12 major milestones on or ahead of schedule across three concurrent client programmes worth $9M combined\nBuilt the risk register cadence that surfaced a vendor integration gap 10 weeks early, avoiding an estimated $400K in rework\nStandardised status reporting for the 30-person PMO, cutting weekly reporting effort by 12 hours while improving executive sign-off speed',
        },
        {
          title: 'Project Manager',
          company: 'Corviden Health Systems',
          dates: 'Mar 2018 – Sep 2022',
          description:
            'Led the rollout of a scheduling platform to 60 clinics in five phases, finishing 3 weeks early and 6% under the $2.3M budget\nCoordinated 8 third-party vendors through interface testing, cutting integration defects at go-live by 70% versus the previous rollout\nRan change management for 900 end users — training, champions network, feedback loops — reaching 92% adoption within two months',
        },
      ],
      projects: [
        {
          title: 'PMO intake redesign',
          dates: '2023',
          description:
            'Redesigned project intake and prioritisation scoring for the PMO, cutting approval lead time from 6 weeks to 2 and killing 9 low-value requests in the first quarter',
        },
      ],
      education: [
        {
          studyTitle: 'B.S. Industrial Engineering',
          school: 'University of Michigan',
          date: '2010 – 2014',
          score: 'GPA 3.5/4.0',
        },
      ],
      others: [
        {
          title: 'Certifications',
          description: 'Project Management Professional (PMP), PMI — 2019\nCertified ScrumMaster (CSM), 2021',
        },
      ],
    },
  },

  {
    slug: 'sales-manager',
    role: 'Sales Manager',
    year: '2026',
    published: '2026-08-01',
    updated: '2026-08-01',
    navLabel: 'Sales manager',
    templateId: 11,
    templateNote: 'Executive Slate — a stately format that suits revenue leadership',
    summaryLine: 'Quota attainment, team performance and pipeline discipline — the three lines sales leaders are hired on.',
    intro:
      'A complete sales manager resume example. Sales is the easiest resume to quantify and the most damaging to leave vague — this one states attainment for every period, and separates personal selling from team leadership. Open it in the editor, replace the numbers with your own, and export a PDF.',
    whatWorks: [
      'Quota attainment is stated per period — vague "exceeded targets" is a red flag in sales',
      'Team results are separated from personal results, showing real management',
      'Rep development is quantified: promotions, ramp time, retention',
      'Deal sizes and cycle lengths give the revenue context screeners need',
      'Process contributions (playbooks, forecasting) show the manager, not just the closer',
    ],
    data: {
      ...baseFields,
      fullName: 'Danielle Kovacs',
      professionalTitle: 'Sales Manager',
      mail: 'danielle.kovacs@email.com',
      mobile: '+1 (617) 555-0142',
      linkedin: 'linkedin.com/in/daniellekovacs',
      github: '',
      summary:
        'Sales manager with 8 years in B2B SaaS, the last three leading an 8-rep mid-market team to 112% average annual attainment on a $7.2M number. Cut new-rep ramp time from six months to four and kept regretted attrition to one rep in three years.',
      skills:
        'Sales Leadership, Pipeline Management, Forecasting, MEDDIC, Coaching, Territory Planning, Salesforce, Outreach, Negotiation, Mid-Market SaaS, Quota Setting, Hiring',
      experiences: [
        {
          title: 'Sales Manager, Mid-Market',
          company: 'Vantage Metrics',
          dates: 'Feb 2023 – Present',
          description:
            'Led an 8-rep mid-market team to 112% average attainment on a $7.2M annual number, finishing top team of five in two of three years\nCut new-rep ramp to first deal from 6 months to 4 by rebuilding onboarding around recorded call review and a 30-60-90 certification\nRaised forecast accuracy to within 5% of actuals for eight consecutive quarters by enforcing MEDDIC exit criteria per stage\nPromoted 3 reps into senior and enterprise seats; regretted attrition of one rep in three years against a company average of 22%',
        },
        {
          title: 'Senior Account Executive',
          company: 'Corestack Software',
          dates: 'Jan 2018 – Jan 2023',
          description:
            'Closed $1.6M in new business in the final year at 131% of quota, ranking 2nd of 24 AEs, on $45K average deals and a 62-day cycle\nLanded the company\'s first three six-figure contracts by building executive-level business cases with champions\nWrote the discovery playbook adopted across the AE team, lifting stage-two conversion 18%',
        },
      ],
      projects: [
        {
          title: 'Win-loss programme',
          dates: '2024',
          description:
            'Launched a quarterly win-loss interview programme with 40 closed deals a cycle; findings reshaped pricing tiers and lifted competitive win rate against the top rival from 34% to 46%',
        },
      ],
      education: [
        {
          studyTitle: 'B.A. Economics',
          school: 'Boston College',
          date: '2010 – 2014',
          score: 'GPA 3.4/4.0',
        },
      ],
    },
  },

  {
    slug: 'customer-service-representative',
    role: 'Customer Service Representative',
    year: '2026',
    published: '2026-08-01',
    updated: '2026-08-01',
    navLabel: 'Customer service rep',
    templateId: 18,
    templateNote: 'Teal Graduate — fresh and approachable, right for early-career and support roles',
    summaryLine: 'Support work with the metrics that prove it: CSAT, handle time, resolution rate.',
    intro:
      'A complete customer service representative resume example. Support roles generate metrics every single day — CSAT, resolution rate, handle time — and a resume that states them stands out from the stack that says "handled customer inquiries". Open it in the editor, add your own numbers, and export a PDF.',
    whatWorks: [
      'Every bullet carries a support metric — CSAT, first-contact resolution, tickets per day',
      'Going beyond the queue (macros, onboarding, knowledge base) shows initiative screeners rarely see',
      'Escalation handling is framed as saves and de-escalation, the hardest support skill',
      'Tools (Zendesk, Salesforce) are named for keyword filters without dominating the resume',
      'An approachable layout that still uses standard, parseable headings',
    ],
    data: {
      ...baseFields,
      fullName: 'Tyler Brennan',
      professionalTitle: 'Customer Service Representative',
      mail: 'tyler.brennan@email.com',
      mobile: '+1 (480) 555-0126',
      linkedin: 'linkedin.com/in/tylerbrennan',
      github: '',
      summary:
        'Customer service representative with 4 years in high-volume SaaS and retail support. Held a 97% CSAT across 11,000+ tickets, resolved 82% of contacts without escalation, and wrote the macro library that cut team handle time by a fifth.',
      skills:
        'Customer Support, Ticket Management, De-escalation, Live Chat & Phone Support, Zendesk, Salesforce Service Cloud, Knowledge Base Writing, CSAT Improvement, Order Management, Upselling',
      experiences: [
        {
          title: 'Customer Service Representative II',
          company: 'Brightcart Commerce',
          dates: 'May 2023 – Present',
          description:
            'Resolved 45–60 tickets daily across chat, email and phone with a 97% CSAT over 11,000+ tickets, against a team average of 91%\nAchieved 82% first-contact resolution by building a personal troubleshooting flow later adopted into team training\nWrote 35 support macros and 20 knowledge-base articles, cutting average handle time for the 14-person team by 20%\nDe-escalated an average of 15 at-risk cancellations a month, retaining roughly $8K in monthly recurring revenue',
        },
        {
          title: 'Customer Service Associate',
          company: 'Desert Peak Outfitters',
          dates: 'Jun 2021 – Apr 2023',
          description:
            'Handled 200+ weekly customer contacts across returns, orders and product questions in a retail chain\'s central support team\nMaintained a 4.9/5 average review score across two years of surveyed interactions\nTrained 6 seasonal hires on systems and tone, all of whom passed their 90-day review',
        },
      ],
      projects: [
        {
          title: 'Returns FAQ overhaul',
          dates: '2024',
          description:
            'Rewrote the top-20 returns and shipping help articles based on ticket-driver analysis, cutting contacts on those topics by 28% in the following quarter',
        },
      ],
      education: [
        {
          studyTitle: 'A.A. Business Administration',
          school: 'Mesa Community College',
          date: '2019 – 2021',
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
