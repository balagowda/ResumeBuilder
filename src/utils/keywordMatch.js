/**
 * Client-side job-description keyword matching.
 *
 * Everything here runs in the browser — no job description, resume text, or
 * derived data ever leaves the page. The approach is deliberately rule-based
 * rather than statistical: frequency ranking, plus a curated dictionary that
 * promotes real skills over generic prose so the "missing keywords" list stays
 * actionable instead of full of filler like "team" or "work".
 */

const STOPWORDS = new Set([
  'a', 'about', 'above', 'across', 'after', 'again', 'against', 'all', 'also', 'am', 'an',
  'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'but', 'by', 'can', 'could', 'did', 'do', 'does', 'doing', 'down',
  'during', 'each', 'else', 'etc', 'even', 'ever', 'every', 'few', 'for', 'from', 'further',
  'get', 'go', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'however', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'just', 'like', 'made', 'make', 'many', 'may', 'me', 'might', 'more', 'most', 'much',
  'must', 'my', 'myself', 'need', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once',
  'one', 'only', 'or', 'other', 'others', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'per', 'same', 'shall', 'she', 'should', 'so', 'some', 'such', 'than', 'that',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'upon', 'us', 'use', 'used',
  'using', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'whether', 'which', 'while',
  'who', 'whom', 'why', 'will', 'with', 'within', 'without', 'would', 'you', 'your', 'yours',
  'yourself',
  // Job-posting boilerplate that is never a useful resume keyword
  'ability', 'able', 'applicant', 'applicants', 'application', 'apply', 'benefits',
  'candidate', 'candidates', 'career', 'company', 'compensation', 'employee', 'employees',
  'employer', 'employment', 'equal', 'experience', 'experienced', 'gender', 'good', 'great',
  'help', 'hire', 'hiring', 'identity', 'including', 'job', 'join', 'looking', 'love',
  'opportunity', 'orientation', 'plus', 'position', 'preferred', 'proven', 'qualifications',
  'race', 'range', 'regard', 'related', 'req', 'required', 'requirements', 'responsibilities',
  'role', 'salary', 'seeking', 'strong', 'team', 'teams', 'want', 'well', 'work', 'working',
  'year', 'years',
  // Generic action verbs and filler nouns that pad out every posting
  'background', 'build', 'building', 'built', 'create', 'creating', 'deliver', 'delivering',
  'develop', 'developing', 'drive', 'driving', 'ensure', 'ensuring', 'excellent', 'existing',
  'familiarity', 'familiar', 'hands', 'improve', 'improving', 'knowledge', 'maintain',
  'maintaining', 'new', 'nice', 'operate', 'own', 'partner', 'participate', 'provide',
  'providing', 'solid', 'support', 'supporting', 'understanding',
  // Role and seniority nouns. These are the worst offenders in the match: a
  // backend posting says "engineer" six times and every engineer's resume says
  // it too, so they scored as covered keywords without carrying any signal —
  // padding "Already covered" and inflating the percentage.
  'developer', 'developers', 'development', 'engineer', 'engineers', 'engineering',
  'junior', 'lead', 'manager', 'managers', 'mid', 'principal', 'senior', 'staff',
  // Boilerplate that describes the posting rather than a skill
  'best', 'complex', 'critical', 'daily', 'deep', 'degree', 'detail', 'effectively',
  'expertise', 'highly', 'large', 'multiple', 'platform', 'platforms', 'practice',
  'practices', 'product', 'products', 'professional', 'proficiency', 'proficient',
  'quickly', 'record', 'responsible', 'scalable', 'stack', 'technologies', 'tools',
  'tooling', 'track', 'various',
  // Scale words. A posting boasting "billions of events" is describing itself,
  // not naming something a resume can claim.
  'billions', 'hundreds', 'millions', 'thousands',
]);

// Multi-word phrases worth surfacing verbatim. Stored space-normalised.
const PHRASES = [
  'machine learning', 'deep learning', 'data science', 'data analysis', 'data modeling',
  'data pipeline', 'data pipelines', 'data warehouse', 'data visualization', 'big data',
  'natural language processing', 'computer vision', 'neural networks', 'feature engineering',
  'a b testing', 'time series', 'business intelligence', 'predictive modeling',
  'project management', 'product management', 'product strategy', 'roadmap planning',
  'stakeholder management', 'cross functional', 'agile methodologies', 'scrum master',
  'sprint planning', 'user research', 'user experience', 'user interface',
  'continuous integration', 'continuous delivery', 'continuous deployment', 'ci cd',
  'version control', 'code review', 'pair programming', 'unit testing', 'integration testing',
  'end to end testing', 'test automation', 'test driven development', 'quality assurance',
  'object oriented', 'functional programming', 'design patterns', 'system design',
  'distributed systems', 'microservices', 'service oriented', 'event driven',
  'message queue', 'load balancing', 'fault tolerance', 'high availability',
  'rest api', 'restful api', 'api design', 'api development', 'web services',
  'front end', 'back end', 'full stack', 'web development', 'mobile development',
  'responsive design', 'cross browser', 'single page application',
  'cloud computing', 'cloud native', 'infrastructure as code', 'site reliability',
  'disaster recovery', 'capacity planning', 'cost optimization', 'performance tuning',
  'performance optimization', 'incident response', 'root cause analysis', 'on call',
  'security best practices', 'penetration testing', 'threat modeling', 'access control',
  'relational database', 'query optimization', 'database design', 'schema design',
  'problem solving', 'critical thinking', 'attention to detail', 'communication skills',
  'written communication', 'verbal communication', 'technical writing', 'public speaking',
  'team leadership', 'people management', 'mentoring', 'customer facing',
  // Newly added
  'generative ai', 'large language models', 'large language model', 'llm', 'llms',
  'css in js', 'tailwind css', 'server side rendering', 'static site generation',
  'web performance', 'accessibility', 'a11y', 'web components', 'progressive web app',
  'search engine optimization'
];

const PHRASE_SET = new Set(PHRASES);

// Single tokens that are almost always a genuine skill or technology.
const SKILL_TOKENS = new Set([
  'python', 'java', 'javascript', 'typescript', 'golang', 'go', 'rust', 'ruby', 'php',
  'scala', 'kotlin', 'swift', 'c', 'c++', 'c#', 'objective-c', 'perl', 'r', 'matlab',
  'bash', 'shell', 'powershell', 'sql', 'nosql', 'html', 'css', 'sass', 'scss',
  'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'node', 'node.js', 'deno',
  'express', 'django', 'flask', 'fastapi', 'rails', 'spring', 'laravel', 'dotnet',
  'jquery', 'redux', 'graphql', 'grpc', 'rest', 'soap', 'webpack', 'vite', 'babel',
  'jest', 'mocha', 'cypress', 'selenium', 'playwright', 'pytest', 'junit',
  'aws', 'azure', 'gcp', 'lambda', 'ec2', 's3', 'rds', 'dynamodb', 'cloudformation',
  'docker', 'kubernetes', 'helm', 'terraform', 'ansible', 'puppet', 'chef', 'vagrant',
  'jenkins', 'gitlab', 'github', 'bitbucket', 'circleci', 'argocd', 'prometheus',
  'grafana', 'datadog', 'splunk', 'elasticsearch', 'kibana', 'logstash',
  'postgresql', 'postgres', 'mysql', 'mariadb', 'oracle', 'mongodb', 'cassandra',
  'redis', 'memcached', 'sqlite', 'snowflake', 'redshift', 'bigquery', 'databricks',
  'kafka', 'rabbitmq', 'sqs', 'airflow', 'spark', 'hadoop', 'hive', 'flink', 'dbt',
  'pandas', 'numpy', 'scipy', 'sklearn', 'scikit-learn', 'tensorflow', 'pytorch',
  'keras', 'huggingface', 'langchain', 'opencv', 'nltk', 'spacy',
  'tableau', 'powerbi', 'looker', 'excel', 'sheets', 'jira', 'confluence', 'asana',
  'notion', 'figma', 'sketch', 'photoshop', 'illustrator', 'invision',
  'git', 'linux', 'unix', 'windows', 'macos', 'nginx', 'apache', 'kong', 'istio',
  'agile', 'scrum', 'kanban', 'devops', 'mlops', 'sre', 'saas', 'api', 'apis',
  'oauth', 'jwt', 'saml', 'ldap', 'ssl', 'tls', 'vpn', 'firewall',
  'salesforce', 'hubspot', 'sap', 'workday', 'quickbooks', 'netsuite',
  'accounting', 'auditing', 'forecasting', 'budgeting', 'reconciliation', 'payroll',
  'recruiting', 'onboarding', 'negotiation', 'copywriting', 'seo', 'sem', 'analytics',
  // Newly added
  'apollo', 'prisma', 'supabase', 'firebase', 'vercel', 'netlify', 'tailwindcss',
  'zustand', 'recoil', 'mobx', 'vitest', 'turborepo', 'nx', 'bun', 'pnpm'
]);

// Map common synonyms to a canonical term so "reactjs" matches "react".
// Applied to both the job description and the resume, so which side of a pair
// is canonical does not matter — but the canonical form should be the short,
// recognisable one, since it is what the "missing keywords" list displays.
// Multi-word keys are replaced before shorter ones (insertion order), so put
// the longest spelling of a term first.
const SYNONYMS = {
  'reactjs': 'react',
  'react.js': 'react',
  'nodejs': 'node',
  'vuejs': 'vue',
  'vue.js': 'vue',
  'angularjs': 'angular',
  'angular.js': 'angular',
  'nextjs': 'next.js',
  'nuxtjs': 'nuxt',
  'nuxt.js': 'nuxt',
  'expressjs': 'express',
  'express.js': 'express',
  'nestjs': 'nest',
  'nest.js': 'nest',
  'golang': 'go',
  'k8s': 'kubernetes',
  'amazon web services': 'aws',
  'google cloud platform': 'gcp',
  'microsoft azure': 'azure',
  'postgres': 'postgresql',
  'tailwindcss': 'tailwind css',
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'ml': 'machine learning',
  'nlp': 'natural language processing',
  'scikit learn': 'scikit-learn',
  'power bi': 'powerbi',
  'ms excel': 'excel',
  'microsoft excel': 'excel',
  'google sheets': 'sheets',
  'github actions': 'github actions',
  'vs code': 'vscode',
  'objective c': 'objective-c',
  'dot net': 'dotnet',
  'ux': 'user experience',
  'ui': 'user interface',
  'oop': 'object oriented',
  'tdd': 'test driven development',
  'qa': 'quality assurance',
  'sdlc': 'software development lifecycle',
  'poc': 'proof of concept',
  'kpis': 'kpi',
  'okrs': 'okr',
};

/** Lowercase and strip punctuation, keeping the characters that live inside
 *  real technology names (c++, c#, node.js, scikit-learn). */
export const normalizeText = (text) => {
  let normalized = String(text || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
    
  // Apply synonym mapping
  Object.entries(SYNONYMS).forEach(([synonym, canonical]) => {
    // Replace whole terms only. \b is the wrong boundary here: it treats "." as
    // a word break, so the "js" rule fired inside "next.js" and "node.js" and
    // rewrote them to "next.javascript" / "node.javascript" — which is what the
    // user then saw in the missing-keywords list, and which stopped either name
    // matching its SKILL_TOKENS entry. A term ends where the characters that
    // can live inside a technology name run out.
    // The trailing guard has to let a sentence-ending "." through — "…using
    // Amazon Web Services." is still the term — while still refusing a "." that
    // joins the term to another word.
    const escaped = synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^\\w.+#-])${escaped}(?![\\w+#-])(?!\\.\\w)`, 'g');
    normalized = normalized.replace(regex, (match, before) => `${before}${canonical}`);
  });

  return normalized;
};

const tokenize = (text) =>
  normalizeText(text)
    .split(' ')
    .map((t) => t.replace(/^[.+#-]+/, '').replace(/[.-]+$/, ''))
    .filter(Boolean);

/**
 * The haystack phrase lookups run against.
 *
 * A hyphenated compound is a single token ("cross-functional"), but the phrase
 * list spells the same idea with spaces ("cross functional"), so a literal
 * lookup never fired and a resume saying "cross-functional teams" was reported
 * as missing the keyword. Flattening hyphens to spaces here makes both
 * spellings look alike for phrase matching, while the token list itself keeps
 * the hyphens that belong to names like scikit-learn and objective-c.
 */
const phraseHaystack = (tokens) => ` ${tokens.join(' ').replace(/-/g, ' ')} `;

/** Crude suffix stripping so "pipelines" matches "pipeline". Applied to both
 *  sides of every comparison, so exactness matters less than consistency. */
const stem = (word) => {
  if (word.length <= 4) return word;
  let out = word;
  if (out.endsWith('ies')) {
    out = `${out.slice(0, -3)}y`;
  } else if (out.endsWith('ing') && out.length > 5) {
    // e.g. "optimizing" -> "optimiz", "building" -> "build"
    out = out.slice(0, -3);
  } else if (out.endsWith('ed') && out.length > 4) {
    out = out.slice(0, -2);
  } else if (out.endsWith('es') && out.length > 5) {
    out = out.slice(0, -2);
  } else if (out.endsWith('s') && !out.endsWith('ss')) {
    out = out.slice(0, -1);
  }
  // "planning" -> "plann" -> "plan", "planned" -> "plann" -> "plan"
  if (out.length > 3 && out[out.length - 1] === out[out.length - 2] && /[bdgmnprt]/.test(out[out.length - 1])) {
    out = out.slice(0, -1);
  }
  // "optimize"/"optimizing" both land on "optimiz"; "manage"/"managing" on "manag"
  if (out.length > 4 && out.endsWith('e')) {
    out = out.slice(0, -1);
  }
  return out;
};

/** Flatten every piece of resume content into one searchable string. */
export const resumeToText = (formData) => {
  const parts = [
    formData.fullName, formData.professionalTitle, formData.summary, formData.skills,
    formData.mail, formData.linkedin, formData.github, formData.other,
  ];
  (formData.experiences || []).forEach((e) => parts.push(e.title, e.company, e.description));
  (formData.projects || []).forEach((p) => parts.push(p.title, p.description));
  (formData.education || []).forEach((e) => parts.push(e.studyTitle, e.school));
  (formData.others || []).forEach((o) => parts.push(o.title, o.description));
  return parts.filter(Boolean).join(' ');
};

/**
 * Compare a job description against the resume.
 * Returns { score, matched, missing, total } where score is a weight-based
 * coverage percentage — hitting the terms the posting repeats counts for more
 * than hitting ones it mentions once.
 */
export const analyzeJobMatch = (jobDescription, formData, limit = 28) =>
  analyzeJobMatchText(jobDescription, resumeToText(formData), limit);

/**
 * Same comparison against resume text that did not come from the form — what
 * the standalone ATS checker has, since its input is a pasted document.
 */
export const analyzeJobMatchText = (jobDescription, resumeText, limit = 28) => {
  const jdTokens = tokenize(jobDescription);
  if (jdTokens.length < 15) {
    return { score: 0, matched: [], missing: [], total: 0, tooShort: true };
  }

  const jdJoined = phraseHaystack(jdTokens);
  const candidates = new Map(); // term -> { term, count, weight, isPhrase }

  // Phrases first, so their component words can be suppressed afterwards.
  const phraseWords = new Set();
  const countOccurrences = (haystack, needle) => {
    let count = 0;
    let idx = haystack.indexOf(needle);
    while (idx !== -1) {
      count += 1;
      idx = haystack.indexOf(needle, idx + 1);
    }
    return count;
  };

  PHRASES.forEach((phrase) => {
    // A plural spelling whose singular is also listed ("data pipelines" beside
    // "data pipeline") would be counted twice and shown as two chips for one
    // idea — the plural is already folded into the singular entry below.
    if (phrase.endsWith('s') && PHRASE_SET.has(phrase.slice(0, -1))) return;
    // "REST APIs" should still count towards the "rest api" phrase.
    const plural = `${phrase}s`;
    const count =
      countOccurrences(jdJoined, ` ${phrase} `) + countOccurrences(jdJoined, ` ${plural} `);
    if (count > 0) {
      candidates.set(phrase, { term: phrase, count, weight: count * 4, isPhrase: true });
      phrase.split(' ').forEach((w) => phraseWords.add(w));
      phraseWords.add(plural.split(' ').pop());
    }
  });

  jdTokens.forEach((token) => {
    if (token.length < 2) return;
    const isSkill = SKILL_TOKENS.has(token);
    // A handful of real technologies collide with ordinary English — "Go"
    // above all, which the stopword list would otherwise swallow, hiding the
    // language from every posting that asks for it. Being a known skill wins.
    if (!isSkill && STOPWORDS.has(token)) return;
    // Anything opening with a digit is a quantity, not a keyword: "5+" (from
    // "5+ years"), "2m", "300k", "95th". The old test only caught bare digits,
    // so the ones carrying a unit or a plus ranked as key terms. No entry in
    // SKILL_TOKENS or PHRASES starts with a digit, so nothing real is lost.
    if (/^\d/.test(token)) return;
    // Already represented by a phrase like "machine learning"
    if (phraseWords.has(token)) return;
    // ...including when the posting hyphenates it: "cross-functional" is one
    // token, but the phrase entry already claimed both of its halves.
    if (token.includes('-') && token.split('-').every((part) => phraseWords.has(part))) return;

    const existing = candidates.get(token);
    if (existing) {
      existing.count += 1;
      existing.weight += isSkill ? 3 : 1;
    } else {
      candidates.set(token, {
        term: token,
        count: 1,
        weight: isSkill ? 3 : 1,
        isPhrase: false,
        isSkill,
      });
    }
  });

  const ranked = [...candidates.values()]
    .sort((a, b) => b.weight - a.weight || b.count - a.count || a.term.localeCompare(b.term))
    .slice(0, limit);

  // Build the resume's searchable forms once.
  const resumeTokens = tokenize(resumeText);
  const resumeStems = new Set(resumeTokens.map(stem));
  const resumeJoined = phraseHaystack(resumeTokens);

  const isPresent = (entry) => {
    // Only a multi-word entry has to be found as a run of words. Several
    // entries in the phrase list are single words ("mentoring",
    // "microservices", "accessibility"); those are ordinary tokens and have to
    // go through the stemmer, or a resume saying "Mentored 4 engineers" is
    // reported as missing "mentoring".
    if (entry.isPhrase && entry.term.includes(' ')) {
      return (
        resumeJoined.includes(` ${entry.term} `) || resumeJoined.includes(` ${entry.term}s `)
      );
    }
    if (resumeStems.has(stem(entry.term))) return true;
    // Catch "node" inside "node.js" and similar compound spellings
    return resumeTokens.some((t) => t.includes(entry.term) && entry.term.length >= 4);
  };

  const matched = [];
  const missing = [];
  let matchedWeight = 0;
  let totalWeight = 0;

  ranked.forEach((entry) => {
    totalWeight += entry.weight;
    if (isPresent(entry)) {
      matchedWeight += entry.weight;
      matched.push(entry);
    } else {
      missing.push(entry);
    }
  });

  return {
    score: totalWeight ? Math.round((matchedWeight / totalWeight) * 100) : 0,
    matched,
    missing,
    total: ranked.length,
    tooShort: false,
  };
};
