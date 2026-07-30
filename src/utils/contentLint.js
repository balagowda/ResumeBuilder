/**
 * Resume content linter.
 *
 * The strength meter only asks "is this field filled in?". This asks "is what
 * you wrote any good?" — the checks a recruiter or a resume coach would make on
 * a first read: does the bullet lead with a verb, does it prove anything with a
 * number, is it written in the passive voice, is it padded with buzzwords.
 *
 * Deliberately rule-based, like keywordMatch.js: every check is plain string
 * work that runs in the browser, so no resume text ever leaves the page.
 */

// Verbs strong enough to open a bullet. Not exhaustive — it only needs to cover
// enough real usage that a genuinely well-written bullet is not flagged.
const ACTION_VERBS = new Set([
  'accelerated', 'achieved', 'acquired', 'adapted', 'added', 'addressed', 'administered',
  'advanced', 'advised', 'advocated', 'analyzed', 'analysed', 'architected', 'assembled',
  'audited', 'authored', 'automated', 'balanced', 'benchmarked', 'boosted', 'briefed',
  'budgeted', 'built', 'centralized', 'chaired', 'championed', 'clarified', 'coached',
  'collaborated', 'compiled', 'completed', 'composed', 'conducted', 'configured',
  'consolidated', 'constructed', 'consulted', 'converted', 'coordinated', 'created',
  'cut', 'debugged', 'decreased', 'defined', 'delivered', 'deployed', 'designed',
  'developed', 'devised', 'diagnosed', 'directed', 'documented', 'doubled', 'drafted',
  'drove', 'earned', 'edited', 'eliminated', 'enabled', 'engineered', 'enhanced',
  'established', 'evaluated', 'executed', 'expanded', 'expedited', 'facilitated',
  'forecast', 'formulated', 'founded', 'generated', 'grew', 'guided', 'halved',
  'headed', 'identified', 'implemented', 'improved', 'increased', 'influenced',
  'initiated', 'innovated', 'installed', 'instituted', 'integrated', 'introduced',
  'invented', 'investigated', 'launched', 'led', 'leveraged', 'maintained', 'managed',
  'mapped', 'marketed', 'mentored', 'merged', 'migrated', 'minimized', 'modeled',
  'modernized', 'monitored', 'negotiated', 'onboarded', 'operated', 'optimized',
  'orchestrated', 'organized', 'overhauled', 'oversaw', 'partnered', 'performed',
  'pioneered', 'planned', 'presented', 'prioritized', 'produced', 'programmed',
  'promoted', 'prototyped', 'published', 'launched', 'quantified', 'raised',
  'ranked', 'rearchitected', 'rebuilt', 'reduced', 'refactored', 'redesigned',
  'researched', 'resolved', 'restructured', 'revamped', 'reviewed', 'saved',
  'scaled', 'scoped', 'secured', 'shipped', 'simplified', 'solved', 'spearheaded',
  'standardized', 'streamlined', 'strengthened', 'structured', 'supervised',
  'supported', 'surveyed', 'sustained', 'tested', 'trained', 'transformed',
  'translated', 'tripled', 'troubleshot', 'unified', 'upgraded', 'validated', 'wrote',
  // Newly added
  'navigated', 'modernised', 'provisioned', 'conceptualized', 'conceived', 'drafted',
  'maximized', 'minimised', 'capitalized', 'mobilized', 'moderated', 'navigated',
  'formalized', 'fostered', 'generated', 'halted', 'illustrated', 'incorporated',
  'masterminded', 'maximized', 'motivated', 'negotiated', 'networked', 'operated',
  'piloted', 'pinpointed', 'spearheaded', 'steered', 'strategized', 'systematized',
  'targeted', 'uncovered', 'united', 'visualized', 'yielded'
]);

// Openers that bury the achievement in job-description language.
const WEAK_OPENERS = [
  'responsible for',
  'duties included',
  'tasked with',
  'in charge of',
  'worked on',
  'helped with',
  'helped to',
  'assisted with',
  'assisted in',
  'involved in',
  'participated in',
  'part of a team',
  'my role was',
  'accountable for',
  'served as',
  'worked collaboratively',
  'collaborated with',
  'helped design'
];

// Self-description that asserts instead of demonstrating.
const BUZZWORDS = [
  'team player',
  'hard worker',
  'hard working',
  'go-getter',
  'self-motivated',
  'self motivated',
  'detail-oriented',
  'detail oriented',
  'results-driven',
  'results driven',
  'proven track record',
  'think outside the box',
  'synergy',
  'synergies',
  'dynamic professional',
  'fast learner',
  'excellent communication skills',
  'strong work ethic',
  'passionate about',
  'wear many hats',
  'ninja',
  'rockstar',
  'guru',
  'thought leader',
  'game changer',
  'value-add',
  'value add',
  'best in class',
  'proactive',
  'visionary'
];

const FIRST_PERSON = /\b(i|i'm|i've|my|me|myself)\b/i;

// "was deployed", "were reviewed", "been migrated" — the achievement happening
// to the writer rather than the writer doing it.
const PASSIVE = /\b(was|were|been|being|is|are)\s+(\w+ed|written|built|made|given|taken|shown|known|led|kept|held|sent|brought|driven|chosen|run)\b/i;

const HAS_NUMBER = /\d/;

// We measure bullet length by words to be more accurate to readability.
const LONG_BULLET_WORDS = 35;

const stripBullet = (line) => line.replace(/^[\s•\-*–—+·]+/, '').trim();

/** Split a description field the same way the templates render it. */
export const toBullets = (text) =>
  (text || '')
    .split('\n')
    .map(stripBullet)
    .filter((line) => line.length > 0);

const firstWord = (line) =>
  (line.toLowerCase().match(/[a-z']+/) || [''])[0].replace(/'s$/, '');

/**
 * Collect every description field alongside a human-readable label, so an issue
 * can point the user at the exact entry it came from.
 */
const collectSources = (formData) => {
  const sources = [];

  if (formData.summary && formData.summary.trim()) {
    sources.push({ section: 'summary', label: 'Summary', text: formData.summary });
  }

  const walk = (list, section, sectionLabel, titleKey) => {
    (list || []).forEach((entry, index) => {
      if (!entry || !entry.description) return;
      const title = (entry[titleKey] || '').trim();
      sources.push({
        section,
        index,
        label: title ? `${sectionLabel}: ${title}` : `${sectionLabel} #${index + 1}`,
        text: entry.description,
      });
    });
  };

  walk(formData.experiences, 'experiences', 'Experience', 'title');
  walk(formData.projects, 'projects', 'Project', 'title');
  walk(formData.others, 'others', 'Other', 'title');

  return sources;
};

let issueSeq = 0;
const issue = (severity, rule, source, message, fix, excerpt) => {
  issueSeq += 1;
  return {
    id: `${rule}-${source.section}-${source.index ?? 'x'}-${issueSeq}`,
    rule,
    severity,
    section: source.section,
    entryIndex: source.index,
    where: source.label,
    message,
    fix,
    excerpt,
  };
};

const shorten = (line) => (line.length > 90 ? `${line.slice(0, 90)}…` : line);

/**
 * Run every rule over a resume.
 *
 * Returns issues ordered worst-first, plus a 0-100 score that starts at 100 and
 * loses points per issue — a resume with no bullets scores 0 rather than a
 * misleading 100, since there is nothing there to be good.
 */
export const lintResume = (formData) => {
  issueSeq = 0;
  if (!formData) return { score: 0, issues: [], bulletCount: 0 };

  const issues = [];
  const sources = collectSources(formData);
  const verbCounts = new Map();
  let bulletCount = 0;

  sources.forEach((source) => {
    const bullets = toBullets(source.text);

    bullets.forEach((line) => {
      bulletCount += 1;
      const lower = line.toLowerCase();

      const weak = WEAK_OPENERS.find((phrase) => lower.startsWith(phrase));
      if (weak) {
        issues.push(
          issue('high', 'weak-opener', source,
            `Starts with "${weak}"`,
            'Lead with what you actually did — "Rebuilt…", "Cut…", "Shipped…".',
            shorten(line))
        );
      } else if (source.section !== 'summary' && !ACTION_VERBS.has(firstWord(line))) {
        issues.push(
          issue('medium', 'no-action-verb', source,
            'Does not open with an action verb',
            'Start the bullet with a past-tense verb so the achievement leads.',
            shorten(line))
        );
      }

      if (source.section !== 'summary' && !HAS_NUMBER.test(line)) {
        issues.push(
          issue('medium', 'no-metric', source,
            'No number to prove the impact',
            'Add a figure — how much faster, how many users, how much saved.',
            shorten(line))
        );
      }

      if (FIRST_PERSON.test(line)) {
        issues.push(
          issue('high', 'first-person', source,
            'Uses "I" or "my"',
            'Resumes are written without pronouns — drop them and start at the verb.',
            shorten(line))
        );
      }

      // Only flag the passive when the bullet's own action is passive. A bullet
      // that already opens with a strong verb ("Mentored 4 engineers, 2 of whom
      // were promoted") is fine — the passive there describes someone else.
      if (!ACTION_VERBS.has(firstWord(line)) && PASSIVE.test(line)) {
        issues.push(
          issue('medium', 'passive-voice', source,
            'Written in the passive voice',
            'Say who did it: "Migrated the service", not "the service was migrated".',
            shorten(line))
        );
      }

      const words = lower.match(/[a-z']+/g) || [];
      if (words.length > LONG_BULLET_WORDS) {
        issues.push(
          issue('low', 'too-long', source,
            `Bullet is very long (${words.length} words)`,
            'Split it, or cut it back to a single achievement (aim for under 30 words).',
            shorten(line))
        );
      }

      const found = BUZZWORDS.find((word) => lower.includes(word));
      if (found) {
        issues.push(
          issue('low', 'buzzword', source,
            `Contains "${found}"`,
            'Show it with an example instead of claiming it.',
            shorten(line))
        );
      }
      
      if (/^[a-z]/.test(line)) {
        issues.push(
          issue('low', 'lowercase-start', source,
            'Starts with a lowercase letter',
            'Capitalize the first letter of each bullet.',
            shorten(line))
        );
      }

      // Check for repeated strong verbs within the same bullet
      const seenWords = new Set();
      let repeated = null;
      for (const w of words) {
        if (w.length > 4 && ACTION_VERBS.has(w)) {
          if (seenWords.has(w)) {
            repeated = w;
            break;
          }
          seenWords.add(w);
        }
      }
      if (repeated) {
         issues.push(
          issue('medium', 'repeated-word', source,
            `Repeats the verb "${repeated}"`,
            'Use a wider variety of verbs within the same sentence to stay engaging.',
            shorten(line))
        );
      }

      // Track opening verbs across the whole resume to catch repetition.
      const verb = firstWord(line);
      if (ACTION_VERBS.has(verb)) {
        verbCounts.set(verb, (verbCounts.get(verb) || 0) + 1);
      }
    });
  });

  verbCounts.forEach((count, verb) => {
    if (count >= 3) {
      issues.push(
        issue('low', 'repeated-verb', { section: 'global', label: 'Across your resume' },
          `"${verb}" opens ${count} bullets`,
          'Vary the verbs so the bullets do not read as one long list.',
          null)
      );
    }
  });

  if (formData.summary && formData.summary.trim().split(/\s+/).length < 20) {
    issues.push(
      issue('low', 'thin-summary', { section: 'summary', label: 'Summary' },
        'Summary is very short',
        'Two or three sentences: your role, your strongest proof, what you want next.',
        null)
    );
  }

  const WEIGHT = { high: 12, medium: 7, low: 3 };
  const penalty = issues.reduce((sum, i) => sum + WEIGHT[i.severity], 0);
  const score = bulletCount === 0 ? 0 : Math.max(0, Math.min(100, 100 - penalty));

  const RANK = { high: 0, medium: 1, low: 2 };
  issues.sort((a, b) => RANK[a.severity] - RANK[b.severity]);

  return { score, issues, bulletCount };
};

export default lintResume;
