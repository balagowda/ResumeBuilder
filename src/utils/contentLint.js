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

// Common misspellings, biased towards the words that actually appear on
// resumes. A curated map rather than a full dictionary: it stays a few KB,
// needs no download, and — unlike dictionary lookup — can never false-positive
// on a name, a product, or a technology it has not heard of. Only unambiguous
// misspellings belong here; regional variants (organise, licence, fulfil) do not.
const MISSPELLINGS = {
  accomodate: 'accommodate',
  acheive: 'achieve',
  acheived: 'achieved',
  acheivement: 'achievement',
  acheivements: 'achievements',
  achievment: 'achievement',
  achievments: 'achievements',
  acommplish: 'accomplish',
  aquire: 'acquire',
  aquired: 'acquired',
  aquisition: 'acquisition',
  adress: 'address',
  adressed: 'addressed',
  alot: 'a lot',
  analize: 'analyze',
  analized: 'analyzed',
  anual: 'annual',
  apparant: 'apparent',
  aswell: 'as well',
  begining: 'beginning',
  beleive: 'believe',
  benifit: 'benefit',
  benifits: 'benefits',
  buisness: 'business',
  calender: 'calendar',
  catagory: 'category',
  catagories: 'categories',
  cheif: 'chief',
  collegue: 'colleague',
  collegues: 'colleagues',
  comittee: 'committee',
  commited: 'committed',
  communciation: 'communication',
  comunication: 'communication',
  competance: 'competence',
  completly: 'completely',
  concious: 'conscious',
  consistant: 'consistent',
  curiculum: 'curriculum',
  definately: 'definitely',
  develope: 'develop',
  developement: 'development',
  developped: 'developed',
  diffrent: 'different',
  dilligent: 'diligent',
  efficent: 'efficient',
  enviroment: 'environment',
  enviroments: 'environments',
  excelent: 'excellent',
  experiance: 'experience',
  experianced: 'experienced',
  expierence: 'experience',
  familar: 'familiar',
  finacial: 'financial',
  finantial: 'financial',
  foriegn: 'foreign',
  futher: 'further',
  goverment: 'government',
  gaurantee: 'guarantee',
  garantee: 'guarantee',
  greatful: 'grateful',
  harrass: 'harass',
  immediatly: 'immediately',
  implemention: 'implementation',
  improvment: 'improvement',
  improvments: 'improvements',
  independant: 'independent',
  initated: 'initiated',
  inovative: 'innovative',
  intergrated: 'integrated',
  intrest: 'interest',
  knowlege: 'knowledge',
  knowledgable: 'knowledgeable',
  liason: 'liaison',
  lisence: 'license',
  maintainance: 'maintenance',
  maintenence: 'maintenance',
  managment: 'management',
  mangement: 'management',
  marketting: 'marketing',
  neccessary: 'necessary',
  necessery: 'necessary',
  noticable: 'noticeable',
  occassion: 'occasion',
  occassionally: 'occasionally',
  occured: 'occurred',
  occurence: 'occurrence',
  oppurtunity: 'opportunity',
  oppurtunities: 'opportunities',
  opportunty: 'opportunity',
  orginization: 'organization',
  orginized: 'organized',
  paralel: 'parallel',
  perfomance: 'performance',
  performace: 'performance',
  personel: 'personnel',
  persue: 'pursue',
  persued: 'pursued',
  posession: 'possession',
  postion: 'position',
  postions: 'positions',
  practicle: 'practical',
  prefered: 'preferred',
  presense: 'presence',
  priortize: 'prioritize',
  priortized: 'prioritized',
  proffesional: 'professional',
  profesional: 'professional',
  proffit: 'profit',
  programing: 'programming',
  prominant: 'prominent',
  quater: 'quarter',
  quaterly: 'quarterly',
  recieve: 'receive',
  recieved: 'received',
  recomend: 'recommend',
  recomended: 'recommended',
  reccomend: 'recommend',
  reccomended: 'recommended',
  refered: 'referred',
  relevent: 'relevant',
  responsable: 'responsible',
  responsibilty: 'responsibility',
  responsiblity: 'responsibility',
  responsibilites: 'responsibilities',
  responsiblities: 'responsibilities',
  resturant: 'restaurant',
  schedual: 'schedule',
  seperate: 'separate',
  seperated: 'separated',
  seperately: 'separately',
  similiar: 'similar',
  sucess: 'success',
  sucessful: 'successful',
  successfull: 'successful',
  succesful: 'successful',
  sucessfully: 'successfully',
  successfuly: 'successfully',
  succesfully: 'successfully',
  supercede: 'supersede',
  supervized: 'supervised',
  targetted: 'targeted',
  technolgy: 'technology',
  technolgies: 'technologies',
  transfered: 'transferred',
  truely: 'truly',
  untill: 'until',
  upto: 'up to',
  wich: 'which',
  writen: 'written',
};

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
  if (!formData) return { score: 0, issues: [], bulletCount: 0 };
  return lintSources(collectSources(formData), formData.summary);
};

/**
 * The rules themselves, over any list of {section, label, text} sources.
 *
 * Exported separately so the standalone ATS checker can lint pasted text,
 * which has no form structure for collectSources to walk.
 */
export const lintSources = (sources, summaryText = null) => {
  issueSeq = 0;

  const issues = [];
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

      // One spelling issue per bullet, naming every misspelt word in it —
      // per-word issues would let two typos in one line dominate the score.
      const misspelt = [];
      for (const w of words) {
        const bare = w.replace(/^'+|'+$/g, '').replace(/'s$/, '');
        const correct = MISSPELLINGS[bare];
        if (correct && !misspelt.some(([from]) => from === bare)) {
          misspelt.push([bare, correct]);
        }
      }
      if (misspelt.length > 0) {
        issues.push(
          issue('high', 'spelling', source,
            misspelt.length === 1
              ? `Possible spelling mistake: "${misspelt[0][0]}"`
              : `Possible spelling mistakes: ${misspelt.map(([from]) => `"${from}"`).join(', ')}`,
            misspelt.map(([from, to]) => `"${from}" → "${to}"`).join(', '),
            shorten(line))
        );
      }

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

  if (summaryText && summaryText.trim().split(/\s+/).length < 20) {
    issues.push(
      issue('low', 'thin-summary', { section: 'summary', label: 'Summary' },
        'Summary is very short',
        'Two or three sentences: your role, your strongest proof, what you want next.',
        null)
    );
  }

  const WEIGHT = { high: 12, medium: 7, low: 3 };

  // Bullet-level issues are scored by density, not by raw count. Summing them
  // outright punished length rather than quality: a thirty-bullet resume
  // collects more issues than a six-bullet one however well it is written, so
  // any resume of normal length hit zero and stopped being able to show
  // improvement — fixing three bullets moved nothing.
  //
  // Dividing by the bullet count makes the score mean "how bad is a typical
  // bullet here", which is length-independent and responds to every edit. The
  // multiplier is calibrated so that a resume where most bullets trip the usual
  // pair of rules (weak opener, no metric) lands in the teens rather than the
  // seventies, while one bad bullet among twenty barely registers.
  const PER_BULLET_WEIGHT = 4;
  // Two rules describe the document rather than any one bullet, so they stay
  // flat — dividing them by the bullet count would let a long resume repeat the
  // same verb for free.
  const DOCUMENT_RULES = new Set(['repeated-verb', 'thin-summary']);

  let bulletPenalty = 0;
  let documentPenalty = 0;
  issues.forEach((i) => {
    if (DOCUMENT_RULES.has(i.rule)) documentPenalty += WEIGHT[i.severity];
    else bulletPenalty += WEIGHT[i.severity];
  });

  const density = bulletCount === 0 ? 0 : (bulletPenalty / bulletCount) * PER_BULLET_WEIGHT;
  const score =
    bulletCount === 0 ? 0 : Math.max(0, Math.min(100, Math.round(100 - density - documentPenalty)));

  const RANK = { high: 0, medium: 1, low: 2 };
  issues.sort((a, b) => RANK[a.severity] - RANK[b.severity]);

  return { score, issues, bulletCount };
};

export default lintResume;
