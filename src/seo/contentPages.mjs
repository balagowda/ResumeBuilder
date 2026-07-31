// Content for the static, text-heavy pages (/about, /faq, /alternatives).
//
// Written as plain data — no JSX — so two consumers can render it:
//   1. src/components/ContentPage.js, for people using the app;
//   2. scripts/seo-postbuild.js, which serialises the same content into static
//      HTML at build time so crawlers that never run JavaScript (Googlebot's
//      first pass, GPTBot, PerplexityBot, social unfurlers) see real text.
//
// Keeping one source means the crawled page and the rendered page can't drift.

export const SITE_URL = 'https://hatchresume.com';
export const BRAND = 'HatchResume';

export const CONTENT_PAGES = [
  {
    path: '/about',
    dir: 'about',
    navLabel: 'About',
    title: 'About HatchResume — The Free, Private Resume Builder',
    description:
      'HatchResume is a free online resume builder with 25+ ATS-friendly templates. No sign-up, no watermark, no subscription — and your resume never leaves your browser.',
    h1: 'About HatchResume',
    intro:
      'HatchResume (hatchresume.com) is a free online resume builder. You pick one of 25+ professional, ATS-friendly templates, type your details into the editor, and download a print-ready PDF — with no account, no watermark, and no payment step at the end.',
    sections: [
      {
        h2: 'What HatchResume is',
        body: [
          'HatchResume is a single-page web app that runs entirely in your browser. There is no server holding your work history, no database of users, and nothing to cancel later. Open the site, build the resume, download the PDF, close the tab.',
        ],
        bullets: [
          '25+ free professional resume templates, including single-column ATS layouts',
          'A job-description matcher that shows which keywords from a posting your resume is missing',
          'A writing review that flags weak openers, passive voice, unquantified claims and repeated verbs',
          'Two PDF exports: a text-based one applicant tracking systems can read, and a pixel-exact image one',
          'Page-overflow warnings with one-click "fit to one page" resizing',
          'Drag-and-drop section reordering',
          'Multiple saved resume versions with undo and redo',
          'Backup and restore as a JSON file, so your work can move between browsers without an account',
        ],
      },
      {
        h2: 'Why it is free',
        body: [
          'HatchResume has no paid tier because there is nothing to bill for: it is a static site with no servers to run and no accounts to support. Most resume builders let you design a resume for free and then ask for a card at the download step. HatchResume does not have a download step to paywall — the export happens on your own machine.',
        ],
      },
      {
        h2: 'How your data is handled',
        body: [
          'Everything you type stays in your browser\'s local storage. Your resume content is never uploaded, never transmitted to HatchResume, and never shared with a third party, because the app has no backend to send it to. Clearing your browser storage deletes it permanently — HatchResume keeps no copy.',
          'The PDF is generated in the browser as well, so the finished file exists only on your device.',
        ],
      },
      {
        h2: 'Who it is for',
        body: [
          'Students applying for their first internship, engineers targeting FAANG-style single-column formats, and anyone who needs a clean resume today without signing up for a subscription. The ATS-optimized templates avoid the tables, columns, and graphics that applicant tracking systems commonly mis-parse.',
        ],
      },
    ],
    cta: { to: '/templates', label: 'Browse the free templates' },
  },

  {
    path: '/faq',
    dir: 'faq',
    navLabel: 'FAQ',
    title: 'HatchResume FAQ — Is It Really Free? Is My Data Private?',
    description:
      'Answers to common questions about HatchResume: pricing, sign-up, data privacy, ATS compatibility, PDF downloads, and mobile support.',
    h1: 'HatchResume — Frequently Asked Questions',
    intro:
      'Common questions about HatchResume, the free resume builder at hatchresume.com.',
    faqs: [
      {
        q: 'What is HatchResume?',
        a: 'HatchResume is a free online resume builder at hatchresume.com. It gives you 25+ professional, ATS-friendly templates, an editor for your details, and a one-click PDF download — with no account required.',
      },
      {
        q: 'Is HatchResume really free?',
        a: 'Yes. Every template, every feature, and the PDF download are free, with no trial, no watermark, and no card required at any point. There is no paid tier.',
      },
      {
        q: 'Do I need to sign up or log in?',
        a: 'No. There are no accounts on HatchResume. You can start editing a resume the moment the page loads.',
      },
      {
        q: 'Where is my resume data stored? Is it private?',
        a: 'Your resume is stored only in your own browser\'s local storage. It is never uploaded to a server, because HatchResume has no backend — the whole app runs client-side. Clearing your browser data deletes the resume permanently, and no copy exists anywhere else.',
      },
      {
        q: 'Are the templates ATS-friendly?',
        a: 'Yes. The templates in the ATS-Optimized category use single-column layouts, standard section headings, and plain-text contact details and links — the structure applicant tracking systems parse most reliably. Other categories trade some of that for visual design.',
      },
      {
        q: 'How do I download my resume as a PDF?',
        a: 'There are two export buttons in the editor. "Download ATS PDF" goes through your browser\'s print-to-PDF and keeps the text selectable, which is what applicant tracking systems need in order to read it — use this one when applying. "Download Print PDF" captures the preview as an image, so the layout is pixel-exact but the text cannot be parsed; use it for printing or emailing a human. Both are free, generated on your own device, and support multi-page resumes.',
      },
      {
        q: 'Does HatchResume check how my resume is written?',
        a: 'Yes. The Writing Review panel scores your bullet points and flags the specific problems recruiters notice: openers like "Responsible for", passive voice, first-person phrasing, claims with no number attached, bullets that run too long, and the same verb starting three different lines. It runs as you type, in your browser.',
      },
      {
        q: 'Can I move my resume to another browser or computer?',
        a: 'Yes, with the Backup button: it downloads your resume as a JSON file, and Restore loads it back in anywhere. There is no cloud sync — that would mean storing your resume on a server, which is exactly what HatchResume avoids — so the file is the handoff.',
      },
      {
        q: 'Can I make my resume fit on one page?',
        a: 'Yes. HatchResume warns you as soon as your content spills onto a second page and offers a one-click "fit to one page" action that scales the whole layout down proportionally.',
      },
      {
        q: 'What is the job description matcher?',
        a: 'Paste a job posting into the matcher and HatchResume extracts its key terms, compares them against your resume, and lists the keywords you are missing, ranked by importance. The comparison runs in your browser — the posting is not uploaded either.',
      },
      {
        q: 'Can I keep more than one resume?',
        a: 'Yes. You can save several resume versions in the same browser and switch between them, which is useful when tailoring one resume per role. Undo and redo are available while editing.',
      },
      {
        q: 'Does HatchResume work on a phone?',
        a: 'The site loads and works on mobile browsers, but the editor with its live A4 preview is far more comfortable on a laptop or desktop screen.',
      },
      {
        q: 'Can I switch templates without losing what I typed?',
        a: 'Yes. Your content is kept separately from the design, so you can move between any of the 25+ templates at any time and your details carry over.',
      },
      {
        q: 'Who made HatchResume?',
        a: 'HatchResume is an independent, open project built and maintained by a solo developer. Feedback and bug reports go through the form on the home page.',
      },
    ],
    cta: { to: '/templates', label: 'Start building — it\'s free' },
  },

  {
    path: '/alternatives',
    dir: 'alternatives',
    navLabel: 'Alternatives',
    title: 'Free Resume Builder Alternative — HatchResume vs Paid Builders',
    description:
      'Looking for a free alternative to Zety, Resume.io, Novoresume, Enhancv, Kickresume, Resume Genius or Canva? HatchResume builds ATS-friendly resumes and exports PDFs free, with no sign-up and no watermark.',
    h1: 'A Free Alternative to Paid Resume Builders',
    intro:
      'Most popular resume builders are free to design in and ask for payment, a subscription, or an account at the point where you download the file. HatchResume is built the other way round: the download is free because the PDF is generated on your own computer. If you arrived here comparing resume builders, this page lays out the differences honestly.',
    sections: [
      {
        h2: 'The usual trade-off',
        body: [
          'Paid builders — Zety, Resume.io, Novoresume, Enhancv, Kickresume, Resume Genius and similar tools — invest in large template libraries, AI phrasing help, cover-letter tooling, and hosted storage of your documents. That work is funded by subscriptions, so the export, the watermark removal, or both usually sit behind a paywall or a trial that renews.',
          'Canva sits in between: its resume templates export free, but they are design-first documents, and heavily styled multi-column layouts with graphics are the ones applicant tracking systems most often mis-read.',
          'HatchResume is deliberately smaller in scope. It has no AI writing assistant and no cloud sync, and in exchange there is nothing to pay for and no account to create. What it does include for free is the part that changes whether you get called: keyword matching against the posting, a writing review of your bullet points, and a text-based PDF export that parsers can actually read. Check any competitor\'s current pricing and features on their own site before deciding — plans change.',
        ],
      },
      {
        h2: 'How HatchResume compares',
        table: {
          headers: ['', 'HatchResume', 'Typical subscription builder'],
          rows: [
            ['Price to download a finished PDF', 'Free, always', 'Usually paid, trial, or subscription'],
            ['Account required', 'No', 'Yes'],
            ['Watermark on the free export', 'None', 'Common on free tiers'],
            ['Where your resume is stored', 'Your browser only', 'The provider\'s servers'],
            ['ATS-friendly single-column templates', 'Yes, a dedicated category', 'Usually yes'],
            ['Job-description keyword matching', 'Included, free', 'Often a premium feature'],
            ['Writing feedback on your bullets', 'Included, free', 'Often a premium feature'],
            ['Text-based PDF an ATS can read', 'Yes, a dedicated export', 'Usually yes'],
            ['AI writing assistant', 'No', 'Often included'],
            ['Cover letter builder', 'No', 'Often included'],
            ['Moving your resume between devices', 'Backup and restore as a file', 'Cloud sync'],
          ],
        },
      },
      {
        h2: 'When another builder is the better choice',
        body: [
          'If you want AI to draft your bullet points, a matching cover-letter suite, or your documents synced across devices and accessible from any computer, a subscription builder will serve you better and this page is not trying to talk you out of it.',
          'HatchResume is the better fit when you want a clean, ATS-safe resume today, at no cost, without handing your employment history to another company.',
        ],
      },
      {
        h2: 'Switching is quick',
        body: [
          'There is no import step to wait on: open a template, paste your existing sections in, use the job-description matcher against the role you are targeting, and download the PDF. It takes a few minutes and costs nothing.',
        ],
      },
    ],
    cta: { to: '/templates', label: 'Try the free builder' },
  },
];

export const findContentPage = (pathname) => {
  const normalised = (pathname || '').replace(/\/+$/, '').toLowerCase() || '/';
  return CONTENT_PAGES.find((page) => page.path === normalised);
};
