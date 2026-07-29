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
];

const FIRST_PERSON = /\b(i|i'm|i've|my|me|myself)\b/i;

// "was deployed", "were reviewed", "been migrated" — the achievement happening
// to the writer rather than the writer doing it.
const PASSIVE = /\b(was|were|been|being|is|are)\s+(\w+ed|written|built|made|given|taken|shown|known|led|kept|held|sent|brought|driven|chosen|run)\b/i;

const HAS_NUMBER = /\d/;

// Roughly two printed lines in the preview sheet.
const LONG_BULLET = 220;

const stripBullet = (line) => line.replace(/^[\s•\-*–—+·]+/, '').trim();

/** Split a description field the same way the templates render it. */
export const toBullets = (text) =>
  (text || '')
    .split('\n')
    .map(stripBullet)
    .filter((line) => line.length > 0);

/**
 * Same split, but keeping each line's index in the original text so a rewrite
 * can put the edited bullet back exactly where it came from.
 */
const indexedBullets = (text) =>
  (text || '')
    .split('\n')
    .map((raw, rawIndex) => ({ raw, rawIndex, clean: stripBullet(raw) }))
    .filter((line) => line.clean.length > 0);

const firstWord = (line) =>
  (line.toLowerCase().match(/[a-z']+/) || [''])[0].replace(/'s$/, '');

/* -------------------------------------------------------------------------
   Action-verb suggestions
   ------------------------------------------------------------------------- */

// Verbs whose past tense the regular "drop -ing, add -ed" rule gets wrong.
const IRREGULAR_PAST = {
  leading: 'led',
  building: 'built',
  writing: 'wrote',
  making: 'made',
  running: 'ran',
  setting: 'set',
  rebuilding: 'rebuilt',
  overseeing: 'oversaw',
  driving: 'drove',
  growing: 'grew',
  cutting: 'cut',
  holding: 'held',
  keeping: 'kept',
  teaching: 'taught',
  winning: 'won',
  speaking: 'spoke',
  taking: 'took',
  bringing: 'brought',
  choosing: 'chose',
  rewriting: 'rewrote',
  spending: 'spent',
};

/**
 * Past tense of a gerund, or null when the guess is not trustworthy.
 *
 * Everything derived here is checked against ACTION_VERBS before being offered,
 * so a wrong guess is dropped rather than shown — that check is what lets this
 * stay a few naive rules instead of a conjugation library.
 */
export const gerundToPast = (word) => {
  const lower = (word || '').toLowerCase();
  if (!lower.endsWith('ing') || lower.length < 5) return null;
  if (IRREGULAR_PAST[lower]) return IRREGULAR_PAST[lower];

  const stem = lower.slice(0, -3);

  // "applying" -> "applied", but "playing" -> "played": only a consonant before
  // the y turns into -ied.
  if (stem.endsWith('y') && stem.length > 1 && !'aeiou'.includes(stem[stem.length - 2])) {
    return `${stem.slice(0, -1)}ied`;
  }

  // "shipping" -> "shipped", "planning" -> "planned".
  const doubled = stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2];
  if (doubled) return `${stem}ed`;

  // "creat" + "ed" -> "created", "manag" + "ed" -> "managed".
  return `${stem}ed`;
};

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

// Verbs grouped by what a bullet is about, so the suggestions fit the sentence
// instead of being the same five every time.
const VERB_THEMES = [
  { test: /\b(team|teams|engineers?|interns?|juniors?|mentor|hir(ed|ing)|onboard)/i,
    verbs: ['Led', 'Mentored', 'Coached', 'Onboarded'] },
  { test: /\b(bug|bugs|issue|issues|incident|outage|defect|fix)/i,
    verbs: ['Resolved', 'Diagnosed', 'Debugged', 'Eliminated'] },
  { test: /\b(latency|performance|speed|slow|cost|costs|spend|time|efficiency)/i,
    verbs: ['Reduced', 'Cut', 'Optimized', 'Accelerated'] },
  { test: /\b(test|tests|testing|qa|coverage|quality)/i,
    verbs: ['Tested', 'Validated', 'Automated', 'Verified'] },
  { test: /\b(design|ui|ux|interface|layout|prototype)/i,
    verbs: ['Designed', 'Redesigned', 'Prototyped', 'Rebuilt'] },
  { test: /\b(data|report|reports|analysis|dashboard|metrics|insights?)/i,
    verbs: ['Analyzed', 'Modeled', 'Tracked', 'Reported'] },
  { test: /\b(process|workflow|pipeline|manual|repetitive|deploy)/i,
    verbs: ['Streamlined', 'Automated', 'Standardized', 'Simplified'] },
  { test: /\b(document|documentation|guide|spec|wiki|readme)/i,
    verbs: ['Documented', 'Authored', 'Wrote', 'Published'] },
  { test: /\b(migrat|upgrade|legacy|refactor|rewrite|port)/i,
    verbs: ['Migrated', 'Refactored', 'Modernized', 'Upgraded'] },
  { test: /\b(customer|client|stakeholder|user|sales|partner)/i,
    verbs: ['Partnered', 'Advised', 'Negotiated', 'Supported'] },
  { test: /\b(feature|product|service|app|api|system|platform)/i,
    verbs: ['Built', 'Shipped', 'Launched', 'Developed'] },
];

const FALLBACK_VERBS = ['Led', 'Built', 'Delivered', 'Improved'];

/** Up to four verbs that suit what this bullet is talking about. */
export const suggestVerbs = (line) => {
  const matched = VERB_THEMES.filter((theme) => theme.test.test(line)).flatMap((t) => t.verbs);
  const unique = [...new Set(matched.concat(FALLBACK_VERBS))];
  return unique.slice(0, 4);
};

/**
 * The verb already hiding in the sentence, if there is one.
 *
 * "Responsible for maintaining the payment service" has "maintaining" sitting
 * right there — turning it into "Maintained" keeps the user's own wording
 * rather than replacing it with a generic verb, so it is offered first.
 */
const verbFromGerund = (rest) => {
  const token = (rest.match(/^([A-Za-z]+)/) || [])[1];
  if (!token) return null;
  const past = gerundToPast(token);
  if (!past || !ACTION_VERBS.has(past)) return null;
  return { verb: capitalize(past), gerund: token };
};

const weakOpenerOf = (clean) => {
  const lower = clean.toLowerCase();
  return WEAK_OPENERS.find((phrase) => lower.startsWith(phrase)) || null;
};

/**
 * Work out how a flagged bullet could be rewritten.
 *
 * Returns null when no rewrite would read correctly — a bullet like "The
 * migration was completed by the team" cannot be fixed by bolting a verb onto
 * the front, so it gets advice and no button rather than a broken one-click fix.
 */
export const planRewrite = (clean, rule) => {
  const weak = weakOpenerOf(clean);
  const rest = weak ? clean.slice(weak.length).trim() : clean;
  const fromGerund = verbFromGerund(rest);

  if (!weak && !fromGerund) return null;

  // When the sentence already carries its own verb ("…for *maintaining* the
  // service"), that verb is the only safe rewrite: swapping in an unrelated one
  // strands the gerund — "Built maintaining the payment service". Offering a
  // single correct option beats four where three are broken.
  //
  // With no gerund the remainder is a plain noun phrase ("the checkout
  // redesign"), so any contextual verb prepends cleanly and we can offer a
  // choice.
  const suggestions = fromGerund ? [fromGerund.verb] : suggestVerbs(clean);

  return {
    weak,
    gerund: fromGerund ? fromGerund.gerund : null,
    suggestions: suggestions.slice(0, 4),
  };
};

/** Apply a chosen verb to one bullet, returning the whole rewritten line. */
export const rewriteLine = (clean, verb, rule) => {
  const plan = planRewrite(clean, rule);
  if (!plan) return clean;

  let rest = plan.weak ? clean.slice(plan.weak.length).trim() : clean;

  // The gerund *is* the verb being promoted, so it always comes out. planRewrite
  // only ever offers the verb derived from it, so nothing is lost here.
  if (plan.gerund) {
    rest = rest.slice(plan.gerund.length).trim();
  }

  // Lower-case the first letter of the remainder unless it looks like a name or
  // an acronym ("API", "Kubernetes"), which should keep their capitals.
  const head = (rest.match(/^([A-Za-z]+)/) || [])[1];
  if (head && !(head === head.toUpperCase() && head.length > 1) && head[0] === head[0].toUpperCase()) {
    const isProper = /^(I|A)$/.test(head) === false && head.slice(1) !== head.slice(1).toLowerCase();
    if (!isProper) rest = rest.charAt(0).toLowerCase() + rest.slice(1);
  }

  return `${capitalize(verb)} ${rest}`.replace(/\s+/g, ' ').trim();
};

/**
 * Rewrite one bullet inside a description, preserving every other line and any
 * bullet marker the user typed.
 */
export const applyVerbToDescription = (text, rawIndex, verb, rule) => {
  const lines = (text || '').split('\n');
  if (rawIndex < 0 || rawIndex >= lines.length) return text;

  const raw = lines[rawIndex];
  const marker = (raw.match(/^[\s•\-*–—+·]+/) || [''])[0];
  const clean = stripBullet(raw);

  lines[rawIndex] = `${marker}${rewriteLine(clean, verb, rule)}`;
  return lines.join('\n');
};

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
const issue = (severity, rule, source, message, fix, excerpt, extra = {}) => {
  issueSeq += 1;
  return {
    ...extra,
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
    const bullets = indexedBullets(source.text);

    bullets.forEach(({ clean: line, rawIndex }) => {
      bulletCount += 1;
      const lower = line.toLowerCase();

      // Verb suggestions only make sense on bullets, not on summary prose, and
      // only where a rewrite would actually read correctly.
      const verbHelp = (rule) => {
        if (source.section === 'summary') return {};
        const plan = planRewrite(line, rule);
        if (!plan) return {};
        return { rawIndex, suggestions: plan.suggestions, keepsOwnWording: Boolean(plan.gerund) };
      };

      const weak = WEAK_OPENERS.find((phrase) => lower.startsWith(phrase));
      if (weak) {
        issues.push(
          issue('high', 'weak-opener', source,
            `Starts with "${weak}"`,
            'Lead with what you actually did — "Rebuilt…", "Cut…", "Shipped…".',
            shorten(line),
            verbHelp('weak-opener'))
        );
      } else if (source.section !== 'summary' && !ACTION_VERBS.has(firstWord(line))) {
        issues.push(
          issue('medium', 'no-action-verb', source,
            'Does not open with an action verb',
            'Start the bullet with a past-tense verb so the achievement leads.',
            shorten(line),
            verbHelp('no-action-verb'))
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

      if (line.length > LONG_BULLET) {
        issues.push(
          issue('low', 'too-long', source,
            `Runs to ${line.length} characters`,
            'Split it, or cut it back to a single achievement.',
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
