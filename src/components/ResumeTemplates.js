import React from 'react';

/* ==========================================================================
   Shared resume template registry.
   Every renderer receives a `ctx` object:
   { formData, sectionOrder, experienceHeading, formatTextToList }
   ========================================================================== */

export const DEFAULT_SECTION_ORDER = ['summary', 'skills', 'experiences', 'projects', 'education', 'others'];

export const formatTextToList = (text) => {
  if (!text) return null;
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length > 1) {
    return (
      <ul>
        {lines.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>
    );
  }
  return <p>{text}</p>;
};

// Professional title shown under the name (free text, e.g. "Software Engineer")
export const getProfessionalTitle = (formData) => formData.professionalTitle || '';

export const SAMPLE_DATA = {
  fullName: 'Alex Morgan',
  professionalTitle: 'Software Engineer',
  mail: 'alex.morgan@email.com',
  mobile: '+1 (415) 555-0134',
  linkedin: 'https://linkedin.com/in/alexmorgan',
  github: 'https://github.com/alexmorgan',
  other: '',
  summary: 'Software engineer with 5+ years of experience building large-scale distributed systems and consumer products. Shipped features used by 40M+ users and led cross-functional teams of up to 6 engineers.',
  skills: 'Java, Python, Go, React, Kubernetes, AWS, PostgreSQL, Redis, Kafka, System Design',
  experiences: [
    {
      title: 'Senior Software Engineer',
      company: 'Streamline Inc.',
      dates: 'Jan 2023 – Present',
      description: 'Led redesign of the payments pipeline, cutting transaction failures by 38%\nBuilt a real-time analytics service handling 2M events/min on Kafka and Go\nMentored 4 engineers and drove adoption of service-level objectives',
    },
    {
      title: 'Software Engineer',
      company: 'Nimbus Labs',
      dates: 'Jun 2020 – Dec 2022',
      description: 'Developed customer-facing dashboard in React used by 300K monthly users\nReduced API p95 latency from 900ms to 210ms via caching and query tuning',
    },
  ],
  projects: [
    {
      title: 'OpenDeploy — CI/CD Toolkit',
      dates: '2024',
      description: 'Open-source deployment toolkit with 2.1K GitHub stars; automated canary rollouts on Kubernetes',
    },
  ],
  education: [
    {
      studyTitle: 'B.S. Computer Science',
      school: 'University of California, Berkeley',
      date: '2016 – 2020',
      score: 'GPA 3.8/4.0',
    },
  ],
  others: [],
  addHeaderLine: true,
  showProfessionalTitle: true,
  fontHeading: 'Arial, Helvetica, sans-serif',
  fontSubheading: 'Arial, Helvetica, sans-serif',
  fontText: 'Arial, Helvetica, sans-serif',
  lineHeight: 1.4,
};

export const TEMPLATES = [
  {
    id: 1,
    name: 'Professional Executive',
    description: 'A classic, clean single-column layout optimized for corporate and executive jobs. Recommended for traditional industries.',
    category: 'Professional',
    tags: ['ATS-Optimized', 'Corporate', 'Clean'],
  },
  {
    id: 2,
    name: 'Modern Creative',
    description: 'A split-column layout designed to maximize space and readability. Best suited for tech, design, and marketing roles.',
    category: 'Creative',
    tags: ['2-Column', 'Design & Art', 'Slate theme'],
  },
  {
    id: 3,
    name: 'Executive Centered',
    description: 'A pristine, center-aligned corporate structure with full-width section borders. Highly professional.',
    category: 'Professional',
    tags: ['Top-tier Corporate', 'Clean Borders', 'Whitespace'],
  },
  {
    id: 4,
    name: 'Bold Tech Header',
    description: 'Featuring a high-contrast dark indigo top header band and tech-oriented grid layouts. Best for engineering and developers.',
    category: 'Creative',
    tags: ['Bold Accent', 'Tech & Devs', 'High Contrast'],
  },
  {
    id: 5,
    name: 'Modern Professional',
    description: 'A sleek two-column header with heavy section borders in a strict black-and-white aesthetic.',
    category: 'Professional',
    tags: ['Two-Column Header', 'B&W Aesthetic', 'Structured'],
  },
  {
    id: 6,
    name: 'FAANG Engineer',
    description: 'The single-column engineering standard used for Google, Meta and Amazon applications. Dense, scannable, and 100% ATS-parseable with full URLs in plain text.',
    category: 'ATS-Optimized',
    tags: ['FAANG Standard', 'Single Column', '100% ATS'],
  },
  {
    id: 7,
    name: 'ATS Pro Plain',
    description: 'Maximum parser compatibility: no lines, no columns, no graphics. Bold uppercase headers and plain text designed to pass every applicant tracking system.',
    category: 'ATS-Optimized',
    tags: ['Max Compatibility', 'Plain Text', 'Recruiter Safe'],
  },
  {
    id: 8,
    name: 'Harvard Classic',
    description: 'The timeless Harvard-style format trusted by consulting, finance, and MBA applicants. Centered small-caps name with full-width ruled section headers.',
    category: 'ATS-Optimized',
    tags: ['Consulting & Finance', 'Ivy League', 'Timeless'],
  },
  {
    id: 9,
    name: 'Compact One-Page',
    description: 'A dense, space-efficient layout that fits senior careers on a single page. Navy accents and compact skill pills keep it modern yet parseable.',
    category: 'ATS-Optimized',
    tags: ['Space Efficient', 'Senior Careers', 'Navy Accent'],
  },
  {
    id: 10,
    name: 'Modern Accent',
    description: 'A contemporary single-column design with indigo accent bars on section headers. ATS-safe structure with just enough color to stand out.',
    category: 'Professional',
    tags: ['Accent Bars', 'ATS-Friendly', 'Contemporary'],
  },
  {
    id: 11,
    name: 'Executive Slate',
    description: 'A stately gray header band with wide-tracked section headings. Designed for directors, VPs, and senior management applications at top MNCs.',
    category: 'Professional',
    tags: ['Leadership', 'Header Band', 'Elegant Rules'],
  },
  {
    id: 12,
    name: 'Elegant Minimal',
    description: 'Light, airy typography with hairline rules and wide letter-spacing. A refined minimal look that stays fully single-column and parser-friendly.',
    category: 'Creative',
    tags: ['Minimalist', 'Hairline Rules', 'Airy'],
  },
  {
    id: 13,
    name: 'Right Rail Modern',
    description: 'The balanced two-column standard used by leading resume builders: experience on the left, a light-gray rail on the right for contact, skills, and education.',
    category: 'Professional',
    tags: ['2-Column', 'Light Sidebar', 'Balanced'],
  },
  {
    id: 14,
    name: 'Timeline Professional',
    description: 'Your career path drawn as a vertical timeline with connected milestones. A favorite modern style for showing steady progression.',
    category: 'Professional',
    tags: ['Timeline Dots', 'Career Path', 'Sky Accent'],
  },
  {
    id: 15,
    name: 'Classic Serif',
    description: 'The timeless Times-style resume trusted for decades in law, government, and academia. Understated serif typography, fully single-column and ATS-safe.',
    category: 'ATS-Optimized',
    tags: ['Times Classic', 'Traditional', '100% ATS'],
  },
  {
    id: 16,
    name: 'Corporate Blue',
    description: 'A solid blue header band over a clean single-column body — the most widely used corporate style at banks, consultancies, and Fortune 500 companies.',
    category: 'Professional',
    tags: ['Blue Header', 'Corporate', 'Single Column'],
  },
  {
    id: 17,
    name: 'Monogram Modern',
    description: 'A personal-brand favorite: your initials in a badge beside your name, followed by a clean modern layout.',
    category: 'Creative',
    tags: ['Initials Badge', 'Personal Brand', 'Modern'],
  },
  {
    id: 18,
    name: 'Teal Graduate',
    description: 'A fresh, approachable layout with teal accents — the go-to standard for students, internships, and first jobs.',
    category: 'Creative',
    tags: ['Entry Level', 'Fresh & Clean', 'Teal Accent'],
  },
  {
    id: 19,
    name: 'Swiss Minimal',
    description: 'Design-led Swiss typography: an oversized name, generous whitespace, and a single red rule. Popular for design, media, and marketing portfolios.',
    category: 'Creative',
    tags: ['Big Typography', 'Red Accent', 'Design-Led'],
  },
  {
    id: 20,
    name: 'Boxed Headers Classic',
    description: 'The classic office-document style with shaded section header bars — instantly familiar to recruiters and cleanly parsed by tracking systems.',
    category: 'ATS-Optimized',
    tags: ['Shaded Headers', 'Office Standard', 'Structured'],
  },
];

/* --------------------------------------------------------------------------
   Templates 1–5 (original layouts)
   -------------------------------------------------------------------------- */

const renderTemplate1 = (ctx) => {
  const { formData, sectionOrder, experienceHeading, formatTextToList } = ctx;
  const profTitle = getProfessionalTitle(formData);
  return (
    <div className="resume-content tmpl-classic">
      <div className={`resume-header ${formData.addHeaderLine ? 'with-line' : ''}`}>
        <h1>{formData.fullName || 'Your Name'}</h1>
        {profTitle && <p className="prof-title" style={{ marginTop: '2px', marginBottom: '8px', fontSize: '1.0rem', color: '#64748b', fontWeight: '500' }}>{profTitle}</p>}
        <div className="contact-info">
          {formData.mail && <span><i className="fas fa-envelope"></i> {formData.mail}</span>}
          {formData.mobile && <span><i className="fas fa-phone"></i> {formData.mobile}</span>}
          {formData.linkedin && <span><i className="fab fa-linkedin"></i> <a href={formData.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></span>}
          {formData.github && <span><i className="fab fa-github"></i> <a href={formData.github} target="_blank" rel="noopener noreferrer">GitHub</a></span>}
          {formData.other && <span>🔗 <a href={formData.other} target="_blank" rel="noopener noreferrer">Other</a></span>}
        </div>
      </div>
      {sectionOrder.map((section) => {
        if (section === 'summary' && formData.summary) {
          return (
            <div key={section} className="resume-section">
              <h3>Summary</h3>
              {formatTextToList(formData.summary)}
            </div>
          );
        }
        if (section === 'skills' && formData.skills) {
          return (
            <div key={section} className="resume-section">
              <h3>Skills</h3>
              <p className="skills-line">{formData.skills}</p>
            </div>
          );
        }
        if (section === 'experiences' && formData.experiences.length > 0 && formData.experiences[0].title) {
          return (
            <div key={section} className="resume-section">
              <h3>{experienceHeading}</h3>
              {formData.experiences.map((exp, idx) => exp.title && (
                <div key={idx} className="experience-entry">
                  <p className="entry-header"><strong>{exp.title}</strong> | {exp.company} <span className="date-right">{exp.dates}</span></p>
                  {formatTextToList(exp.description)}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'projects' && formData.projects.length > 0 && formData.projects[0].title) {
          return (
            <div key={section} className="resume-section">
              <h3>Projects</h3>
              {formData.projects.map((proj, idx) => proj.title && (
                <div key={idx} className="project-entry">
                  <p className="entry-header"><strong>{proj.title}</strong> <span className="date-right">{proj.dates}</span></p>
                  {formatTextToList(proj.description)}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'education' && formData.education.length > 0 && formData.education[0].studyTitle) {
          return (
            <div key={section} className="resume-section">
              <h3>Education</h3>
              {formData.education.map((edu, idx) => edu.studyTitle && (
                <div key={idx} className="education-entry">
                  <p className="entry-header"><strong>{edu.studyTitle}</strong> <span className="date-right">{edu.date}</span></p>
                  <p className="edu-school">{edu.school} | {edu.score}</p>
                </div>
              ))}
            </div>
          );
        }
        if (section === 'others' && formData.others.length > 0 && formData.others[0].title) {
          return (
            <div key={section} className="resume-section">
              <h3>Others</h3>
              {formData.others.map((oth, idx) => oth.title && (
                <div key={idx} className="other-entry">
                  <p className="entry-header"><strong>{oth.title}</strong></p>
                  {formatTextToList(oth.description)}
                </div>
              ))}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

const renderTemplate2 = (ctx) => {
  const { formData, sectionOrder, experienceHeading, formatTextToList } = ctx;
  const profTitle = getProfessionalTitle(formData);
  return (
    <div className="resume-content tmpl-creative">
      <div className="creative-split-container">
        {/* Left Dark Sidebar */}
        <div className="creative-sidebar">
          <div className="sidebar-section contact-sidebar">
            <h4>Contact</h4>
            <ul>
              {formData.mail && <li><i className="fas fa-envelope"></i> {formData.mail}</li>}
              {formData.mobile && <li><i className="fas fa-phone"></i> {formData.mobile}</li>}
              {formData.linkedin && <li><i className="fab fa-linkedin"></i> <a href={formData.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>}
              {formData.github && <li><i className="fab fa-github"></i> <a href={formData.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>}
              {formData.other && <li>🔗 <a href={formData.other} target="_blank" rel="noopener noreferrer">Other</a></li>}
            </ul>
          </div>
          {sectionOrder.map((section) => {
            if (section === 'skills' && formData.skills) {
              return (
                <div key={section} className="sidebar-section">
                  <h4>Skills</h4>
                  <div className="skills-tags-container">
                    {formData.skills.split(',').map((skill, sIdx) => skill.trim() && (
                      <span key={sIdx} className="sidebar-skill-tag">{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              );
            }
            if (section === 'education' && formData.education.length > 0 && formData.education[0].studyTitle) {
              return (
                <div key={section} className="sidebar-section">
                  <h4>Education</h4>
                  {formData.education.map((edu, idx) => edu.studyTitle && (
                    <div key={idx} className="sidebar-edu-item">
                      <p className="edu-title">{edu.studyTitle}</p>
                      <p className="edu-school">{edu.school}</p>
                      <p className="edu-date">{edu.date} {edu.score && `| ${edu.score}`}</p>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Right Main Body */}
        <div className="creative-main">
          <div className="creative-header">
            <h1>{formData.fullName || 'Your Name'}</h1>
            {profTitle && <p className="creative-title">{profTitle}</p>}
          </div>
          {sectionOrder.map((section) => {
            if (section === 'summary' && formData.summary) {
              return (
                <div key={section} className="creative-section">
                  <h3>Profile</h3>
                  {formatTextToList(formData.summary)}
                </div>
              );
            }
            if (section === 'experiences' && formData.experiences.length > 0 && formData.experiences[0].title) {
              return (
                <div key={section} className="creative-section">
                  <h3>{experienceHeading}</h3>
                  {formData.experiences.map((exp, idx) => exp.title && (
                    <div key={idx} className="creative-entry">
                      <p className="entry-header"><strong>{exp.title}</strong> | {exp.company} <span className="date-right">{exp.dates}</span></p>
                      {formatTextToList(exp.description)}
                    </div>
                  ))}
                </div>
              );
            }
            if (section === 'projects' && formData.projects.length > 0 && formData.projects[0].title) {
              return (
                <div key={section} className="creative-section">
                  <h3>Projects</h3>
                  {formData.projects.map((proj, idx) => proj.title && (
                    <div key={idx} className="creative-entry">
                      <p className="entry-header"><strong>{proj.title}</strong> <span className="date-right">{proj.dates}</span></p>
                      {formatTextToList(proj.description)}
                    </div>
                  ))}
                </div>
              );
            }
            if (section === 'others' && formData.others.length > 0 && formData.others[0].title) {
              return (
                <div key={section} className="creative-section">
                  <h3>Others</h3>
                  {formData.others.map((oth, idx) => oth.title && (
                    <div key={idx} className="creative-entry">
                      <p className="entry-header"><strong>{oth.title}</strong></p>
                      {formatTextToList(oth.description)}
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

const renderTemplate3 = (ctx) => {
  const { formData, sectionOrder, experienceHeading, formatTextToList } = ctx;
  const profTitle = getProfessionalTitle(formData);
  return (
    <div className="resume-content tmpl-minimal">
      <div className="minimal-header">
        <h1>{formData.fullName || 'Your Name'}</h1>
        {profTitle && <p className="prof-title" style={{ marginTop: '2px', marginBottom: '4px', fontSize: '1.0rem', color: '#475569', fontWeight: '500' }}>{profTitle}</p>}
        <div className="minimal-contact">
          {formData.mail && <span>{formData.mail}</span>}
          {formData.mobile && <span>{formData.mobile}</span>}
          {formData.linkedin && <span><a href={formData.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></span>}
          {formData.github && <span><a href={formData.github} target="_blank" rel="noopener noreferrer">GitHub</a></span>}
          {formData.other && <span><a href={formData.other} target="_blank" rel="noopener noreferrer">Portfolio</a></span>}
        </div>
      </div>

      {sectionOrder.map((section) => {
        if (section === 'summary' && formData.summary) {
          return (
            <div key={section} className="minimal-section">
              <h3>Professional Summary</h3>
              <div className="sec-body">{formatTextToList(formData.summary)}</div>
            </div>
          );
        }
        if (section === 'experiences' && formData.experiences.length > 0 && formData.experiences[0].title) {
          return (
            <div key={section} className="minimal-section">
              <h3>{experienceHeading}</h3>
              <div className="sec-body">
                {formData.experiences.map((exp, idx) => exp.title && (
                  <div key={idx} className="minimal-entry">
                    <div className="minimal-entry-header">
                      <span className="minimal-title"><strong>{exp.title}</strong></span>
                      <span className="minimal-date">{exp.dates}</span>
                    </div>
                    {exp.company && <div className="minimal-company"><strong>{exp.company}</strong></div>}
                    <div className="minimal-desc">{formatTextToList(exp.description)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'projects' && formData.projects.length > 0 && formData.projects[0].title) {
          return (
            <div key={section} className="minimal-section">
              <h3>Projects</h3>
              <div className="sec-body">
                {formData.projects.map((proj, idx) => proj.title && (
                  <div key={idx} className="minimal-entry">
                    <div className="minimal-entry-header">
                      <span className="minimal-title"><strong>{proj.title}</strong></span>
                      <span className="minimal-date">{proj.dates}</span>
                    </div>
                    <div className="minimal-desc">{formatTextToList(proj.description)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'education' && formData.education.length > 0 && formData.education[0].studyTitle) {
          return (
            <div key={section} className="minimal-section">
              <h3>Education</h3>
              <div className="sec-body">
                {formData.education.map((edu, idx) => edu.studyTitle && (
                  <div key={idx} className="minimal-entry">
                    <div className="minimal-entry-header">
                      <span className="minimal-title"><strong>{edu.studyTitle}</strong></span>
                      <span className="minimal-date">{edu.date}</span>
                    </div>
                    {edu.school && <div className="minimal-company">{edu.school} {edu.score && `• ${edu.score}`}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'skills' && formData.skills) {
          return (
            <div key={section} className="minimal-section">
              <h3>Expert-Level Skills</h3>
              <div className="sec-body" style={{ marginTop: '4px' }}>
                {formData.skills}
              </div>
            </div>
          );
        }
        if (section === 'others' && formData.others.length > 0 && formData.others[0].title) {
          return (
            <div key={section} className="minimal-section">
              <h3>Others</h3>
              <div className="sec-body">
                {formData.others.map((oth, idx) => oth.title && (
                  <div key={idx} className="minimal-entry" style={{ marginBottom: '8px' }}>
                    <div className="minimal-entry-header">
                      <span className="minimal-title"><strong>{oth.title}</strong></span>
                    </div>
                    <div className="minimal-desc">{formatTextToList(oth.description)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

const renderTemplate4 = (ctx) => {
  const { formData, sectionOrder, formatTextToList } = ctx;
  const profTitle = getProfessionalTitle(formData);
  return (
    <div className="resume-content tmpl-tech">
      <div className="tech-header-band">
        <h1>{formData.fullName || 'Your Name'}</h1>
        {profTitle && <p className="prof-title" style={{ marginTop: '2px', marginBottom: '8px', fontSize: '1.0rem', color: '#cbd5e1', fontWeight: '500' }}>{profTitle}</p>}
        <div className="tech-contact">
          {formData.mail && <span><i className="fas fa-envelope"></i> {formData.mail}</span>}
          {formData.mobile && <span><i className="fas fa-phone"></i> {formData.mobile}</span>}
          {formData.linkedin && <span><i className="fab fa-linkedin"></i> <a href={formData.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></span>}
          {formData.github && <span><i className="fab fa-github"></i> <a href={formData.github} target="_blank" rel="noopener noreferrer">GitHub</a></span>}
          {formData.other && <span>🔗 <a href={formData.other} target="_blank" rel="noopener noreferrer">Portfolio</a></span>}
        </div>
      </div>

      <div className="tech-container">
        {/* Left Column (65%) */}
        <div className="tech-main-col">
          {sectionOrder.map((section) => {
            if (section === 'summary' && formData.summary) {
              return (
                <div key={section} className="tech-section">
                  <h3>Professional Summary</h3>
                  {formatTextToList(formData.summary)}
                </div>
              );
            }
            if (section === 'experiences' && formData.experiences.length > 0 && formData.experiences[0].title) {
              return (
                <div key={section} className="tech-section">
                  <h3>Professional Experience</h3>
                  {formData.experiences.map((exp, idx) => exp.title && (
                    <div key={idx} className="tech-entry">
                      <div className="tech-entry-title">
                        <strong>{exp.title}</strong> &mdash; <span>{exp.company}</span>
                        <span className="tech-date">{exp.dates}</span>
                      </div>
                      {formatTextToList(exp.description)}
                    </div>
                  ))}
                </div>
              );
            }
            if (section === 'projects' && formData.projects.length > 0 && formData.projects[0].title) {
              return (
                <div key={section} className="tech-section">
                  <h3>Projects</h3>
                  {formData.projects.map((proj, idx) => proj.title && (
                    <div key={idx} className="tech-entry">
                      <div className="tech-entry-title">
                        <strong>{proj.title}</strong>
                        <span className="tech-date">{proj.dates}</span>
                      </div>
                      {formatTextToList(proj.description)}
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Right Column (35%) */}
        <div className="tech-side-col">
          {sectionOrder.map((section) => {
            if (section === 'skills' && formData.skills) {
              return (
                <div key={section} className="tech-side-section">
                  <h3>Technical Skills</h3>
                  <div className="tech-skills-grid">
                    {formData.skills.split(',').map((skill, sIdx) => skill.trim() && (
                      <span key={sIdx} className="tech-skill-pill">{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              );
            }
            if (section === 'education' && formData.education.length > 0 && formData.education[0].studyTitle) {
              return (
                <div key={section} className="tech-side-section">
                  <h3>Education</h3>
                  {formData.education.map((edu, idx) => edu.studyTitle && (
                    <div key={idx} className="tech-side-edu-item">
                      <p className="edu-title">{edu.studyTitle}</p>
                      <p className="edu-school">{edu.school}</p>
                      <p className="edu-date">{edu.date} {edu.score && `(${edu.score})`}</p>
                    </div>
                  ))}
                </div>
              );
            }
            if (section === 'others' && formData.others.length > 0 && formData.others[0].title) {
              return (
                <div key={section} className="tech-side-section">
                  <h3>Other Details</h3>
                  {formData.others.map((oth, idx) => oth.title && (
                    <div key={idx} className="tech-side-other-item">
                      <p className="oth-title">{oth.title}</p>
                      {formatTextToList(oth.description)}
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

const renderTemplate5 = (ctx) => {
  const { formData, sectionOrder, formatTextToList } = ctx;
  const profTitle = getProfessionalTitle(formData);
  return (
    <div className="resume-content tmpl-academic">
      <div className="academic-header">
        <div className="academic-header-left">
          <h1>{formData.fullName || 'YOUR NAME'}</h1>
          {profTitle && <p className="academic-prof-title">{profTitle}</p>}
        </div>
        <div className="academic-header-right">
          {formData.mobile && <p>{formData.mobile}</p>}
          {formData.mail && <p>{formData.mail}</p>}
          {formData.linkedin && <p>{formData.linkedin}</p>}
          {formData.github && <p>{formData.github}</p>}
          {formData.other && <p>{formData.other}</p>}
        </div>
      </div>

      {sectionOrder.map((section) => {
        if (section === 'summary' && formData.summary) {
          return (
            <div key={section} className="academic-section">
              <h3>Professional Summary</h3>
              <div className="academic-sec-content">{formatTextToList(formData.summary)}</div>
            </div>
          );
        }
        if (section === 'experiences' && formData.experiences.length > 0 && formData.experiences[0].title) {
          return (
            <div key={section} className="academic-section">
              <h3>Work Experience</h3>
              <div className="academic-sec-content">
                {formData.experiences.map((exp, idx) => exp.title && (
                  <div key={idx} className="academic-entry">
                    <p className="entry-header">
                      <strong>{exp.title}</strong>
                      {exp.company && <span> - {exp.company}</span>}
                      {exp.dates && <span className="academic-date"> - {exp.dates}</span>}
                    </p>
                    {formatTextToList(exp.description)}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'projects' && formData.projects.length > 0 && formData.projects[0].title) {
          return (
            <div key={section} className="academic-section">
              <h3>Projects</h3>
              <div className="academic-sec-content">
                {formData.projects.map((proj, idx) => proj.title && (
                  <div key={idx} className="academic-entry">
                    <p className="entry-header">
                      <strong>{proj.title}</strong>
                      {proj.dates && <span className="academic-date"> - {proj.dates}</span>}
                    </p>
                    {formatTextToList(proj.description)}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'education' && formData.education.length > 0 && formData.education[0].studyTitle) {
          return (
            <div key={section} className="academic-section">
              <h3>Education & Certifications</h3>
              <div className="academic-sec-content">
                {formData.education.map((edu, idx) => edu.studyTitle && (
                  <div key={idx} className="academic-entry">
                    <p className="entry-header">
                      <strong>{edu.school || 'School'}</strong> - {edu.studyTitle}
                      {edu.date && <span className="academic-date"> - {edu.date}</span>}
                    </p>
                    {edu.score && <p className="academic-sub" style={{ paddingLeft: '12px' }}>Score: {edu.score}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'skills' && formData.skills) {
          return (
            <div key={section} className="academic-section">
              <h3>Skills</h3>
              <div className="academic-sec-content font-medium">
                <p>{formData.skills}</p>
              </div>
            </div>
          );
        }
        if (section === 'others' && formData.others.length > 0 && formData.others[0].title) {
          return (
            <div key={section} className="academic-section">
              <h3>Others</h3>
              <div className="academic-sec-content">
                {formData.others.map((oth, idx) => oth.title && (
                  <div key={idx} className="academic-entry">
                    <p className="entry-header"><strong>{oth.title}</strong></p>
                    {formatTextToList(oth.description)}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

/* --------------------------------------------------------------------------
   Templates 6–12: ATS-first single-column family.
   One parameterized renderer; each variant differs in class name (visual
   style lives in CSS), contact separator, link display, and skill styling.
   -------------------------------------------------------------------------- */

const displayUrl = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

const renderSingleColumn = (ctx, opts) => {
  const { formData, sectionOrder, experienceHeading, formatTextToList } = ctx;
  const profTitle = getProfessionalTitle(formData);
  const headings = opts.headings || {};

  const contactItems = [];
  if (formData.mail) contactItems.push(<span key="mail">{formData.mail}</span>);
  if (formData.mobile) contactItems.push(<span key="mobile">{formData.mobile}</span>);
  [['linkedin', 'LinkedIn'], ['github', 'GitHub'], ['other', 'Portfolio']].forEach(([field, label]) => {
    if (formData[field]) {
      contactItems.push(
        <a key={field} href={formData[field]} target="_blank" rel="noopener noreferrer">
          {opts.showUrls ? displayUrl(formData[field]) : label}
        </a>
      );
    }
  });

  const renderSkills = () => {
    if (opts.skillsAs === 'pills') {
      return (
        <div className="sc-skill-pills">
          {formData.skills.split(',').map((skill, i) => skill.trim() && (
            <span key={i} className="sc-skill-pill">{skill.trim()}</span>
          ))}
        </div>
      );
    }
    return <p className="sc-skills-line">{formData.skills}</p>;
  };

  const initials = (formData.fullName || 'Your Name')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`resume-content tmpl-single ${opts.className}`}>
      <div className="sc-header">
        {opts.monogram && <div className="sc-monogram">{initials}</div>}
        <div className="sc-header-main">
          <h1>{formData.fullName || 'Your Name'}</h1>
          {profTitle && <p className="sc-prof-title">{profTitle}</p>}
          <div className="sc-contact">
            {contactItems.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="sc-sep">{opts.contactSep || '|'}</span>}
                {item}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      {sectionOrder.map((section) => {
        if (section === 'summary' && formData.summary) {
          return (
            <div key={section} className="sc-section">
              <h3>{headings.summary || 'Summary'}</h3>
              {formatTextToList(formData.summary)}
            </div>
          );
        }
        if (section === 'skills' && formData.skills) {
          return (
            <div key={section} className="sc-section">
              <h3>{headings.skills || 'Skills'}</h3>
              {renderSkills()}
            </div>
          );
        }
        if (section === 'experiences' && formData.experiences.length > 0 && formData.experiences[0].title) {
          return (
            <div key={section} className="sc-section">
              <h3>{experienceHeading}</h3>
              {formData.experiences.map((exp, idx) => exp.title && (
                <div key={idx} className="sc-entry">
                  <p className="entry-header">
                    <strong>{exp.title}</strong>
                    {exp.company && <span className="sc-company"> | {exp.company}</span>}
                    <span className="date-right">{exp.dates}</span>
                  </p>
                  {formatTextToList(exp.description)}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'projects' && formData.projects.length > 0 && formData.projects[0].title) {
          return (
            <div key={section} className="sc-section">
              <h3>{headings.projects || 'Projects'}</h3>
              {formData.projects.map((proj, idx) => proj.title && (
                <div key={idx} className="sc-entry">
                  <p className="entry-header">
                    <strong>{proj.title}</strong>
                    <span className="date-right">{proj.dates}</span>
                  </p>
                  {formatTextToList(proj.description)}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'education' && formData.education.length > 0 && formData.education[0].studyTitle) {
          return (
            <div key={section} className="sc-section">
              <h3>{headings.education || 'Education'}</h3>
              {formData.education.map((edu, idx) => edu.studyTitle && (
                <div key={idx} className="sc-entry">
                  <p className="entry-header">
                    <strong>{edu.studyTitle}</strong>
                    <span className="date-right">{edu.date}</span>
                  </p>
                  <p className="sc-edu-school">{edu.school}{edu.score && ` • ${edu.score}`}</p>
                </div>
              ))}
            </div>
          );
        }
        if (section === 'others' && formData.others.length > 0 && formData.others[0].title) {
          return (
            <div key={section} className="sc-section">
              <h3>{headings.others || 'Additional'}</h3>
              {formData.others.map((oth, idx) => oth.title && (
                <div key={idx} className="sc-entry">
                  <p className="entry-header"><strong>{oth.title}</strong></p>
                  {formatTextToList(oth.description)}
                </div>
              ))}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

/* --- Template 13: Right Rail Modern — light sidebar on the right --------- */

const renderSidebarRight = (ctx) => {
  const { formData, sectionOrder, experienceHeading, formatTextToList } = ctx;
  const profTitle = getProfessionalTitle(formData);
  return (
    <div className="resume-content tmpl-rightbar">
      <div className="rb-container">
        {/* Main column */}
        <div className="rb-main">
          <div className="rb-header">
            <h1>{formData.fullName || 'Your Name'}</h1>
            {profTitle && <p className="rb-prof-title">{profTitle}</p>}
          </div>
          {sectionOrder.map((section) => {
            if (section === 'summary' && formData.summary) {
              return (
                <div key={section} className="rb-section">
                  <h3>Profile</h3>
                  {formatTextToList(formData.summary)}
                </div>
              );
            }
            if (section === 'experiences' && formData.experiences.length > 0 && formData.experiences[0].title) {
              return (
                <div key={section} className="rb-section">
                  <h3>{experienceHeading}</h3>
                  {formData.experiences.map((exp, idx) => exp.title && (
                    <div key={idx} className="rb-entry">
                      <p className="entry-header"><strong>{exp.title}</strong> | {exp.company} <span className="date-right">{exp.dates}</span></p>
                      {formatTextToList(exp.description)}
                    </div>
                  ))}
                </div>
              );
            }
            if (section === 'projects' && formData.projects.length > 0 && formData.projects[0].title) {
              return (
                <div key={section} className="rb-section">
                  <h3>Projects</h3>
                  {formData.projects.map((proj, idx) => proj.title && (
                    <div key={idx} className="rb-entry">
                      <p className="entry-header"><strong>{proj.title}</strong> <span className="date-right">{proj.dates}</span></p>
                      {formatTextToList(proj.description)}
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Light right rail */}
        <div className="rb-side">
          <div className="rb-side-section">
            <h4>Contact</h4>
            <ul>
              {formData.mail && <li>{formData.mail}</li>}
              {formData.mobile && <li>{formData.mobile}</li>}
              {formData.linkedin && <li><a href={formData.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>}
              {formData.github && <li><a href={formData.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>}
              {formData.other && <li><a href={formData.other} target="_blank" rel="noopener noreferrer">Portfolio</a></li>}
            </ul>
          </div>
          {sectionOrder.map((section) => {
            if (section === 'skills' && formData.skills) {
              return (
                <div key={section} className="rb-side-section">
                  <h4>Skills</h4>
                  <div className="rb-skill-tags">
                    {formData.skills.split(',').map((skill, sIdx) => skill.trim() && (
                      <span key={sIdx} className="rb-skill-tag">{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              );
            }
            if (section === 'education' && formData.education.length > 0 && formData.education[0].studyTitle) {
              return (
                <div key={section} className="rb-side-section">
                  <h4>Education</h4>
                  {formData.education.map((edu, idx) => edu.studyTitle && (
                    <div key={idx} className="rb-side-edu">
                      <p className="edu-title">{edu.studyTitle}</p>
                      <p className="edu-school">{edu.school}</p>
                      <p className="edu-date">{edu.date} {edu.score && `| ${edu.score}`}</p>
                    </div>
                  ))}
                </div>
              );
            }
            if (section === 'others' && formData.others.length > 0 && formData.others[0].title) {
              return (
                <div key={section} className="rb-side-section">
                  <h4>Additional</h4>
                  {formData.others.map((oth, idx) => oth.title && (
                    <div key={idx} className="rb-side-other">
                      <p className="oth-title">{oth.title}</p>
                      {formatTextToList(oth.description)}
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

const SINGLE_COLUMN_VARIANTS = {
  6: {
    className: 'tmpl-faang',
    showUrls: true,
    contactSep: '|',
    skillsAs: 'line',
    headings: { summary: 'Summary', skills: 'Technical Skills' },
  },
  7: {
    className: 'tmpl-atspro',
    showUrls: true,
    contactSep: '•',
    skillsAs: 'line',
    headings: { summary: 'Professional Summary', others: 'Additional Information' },
  },
  8: {
    className: 'tmpl-harvard',
    showUrls: true,
    contactSep: '•',
    skillsAs: 'line',
    headings: { summary: 'Summary', skills: 'Skills & Interests' },
  },
  9: {
    className: 'tmpl-compact',
    showUrls: false,
    contactSep: '|',
    skillsAs: 'pills',
    headings: { summary: 'Profile' },
  },
  10: {
    className: 'tmpl-accentbar',
    showUrls: false,
    contactSep: '·',
    skillsAs: 'pills',
    headings: { summary: 'Profile', skills: 'Core Skills' },
  },
  11: {
    className: 'tmpl-exec',
    showUrls: false,
    contactSep: '|',
    skillsAs: 'line',
    headings: { summary: 'Executive Summary', skills: 'Core Competencies', experiences: 'Leadership Experience' },
  },
  12: {
    className: 'tmpl-elegant',
    showUrls: false,
    contactSep: '—',
    skillsAs: 'line',
    headings: { summary: 'About' },
  },
  14: {
    className: 'tmpl-timeline',
    showUrls: false,
    contactSep: '|',
    skillsAs: 'pills',
    headings: { summary: 'Profile' },
  },
  15: {
    className: 'tmpl-serif',
    showUrls: true,
    contactSep: '•',
    skillsAs: 'line',
    headings: { summary: 'Summary' },
  },
  16: {
    className: 'tmpl-corpblue',
    showUrls: false,
    contactSep: '|',
    skillsAs: 'line',
    headings: { summary: 'Professional Summary', skills: 'Key Skills' },
  },
  17: {
    className: 'tmpl-mono',
    monogram: true,
    showUrls: false,
    contactSep: '·',
    skillsAs: 'pills',
    headings: { summary: 'About' },
  },
  18: {
    className: 'tmpl-teal',
    showUrls: false,
    contactSep: '|',
    skillsAs: 'pills',
    headings: { summary: 'About Me' },
  },
  19: {
    className: 'tmpl-swiss',
    showUrls: false,
    contactSep: '—',
    skillsAs: 'line',
    headings: { summary: 'Profile' },
  },
  20: {
    className: 'tmpl-boxed',
    showUrls: true,
    contactSep: '|',
    skillsAs: 'line',
    headings: { summary: 'Professional Summary' },
  },
};

export const renderResumeTemplate = (templateId, ctx) => {
  switch (templateId) {
    case 1: return renderTemplate1(ctx);
    case 2: return renderTemplate2(ctx);
    case 3: return renderTemplate3(ctx);
    case 4: return renderTemplate4(ctx);
    case 5: return renderTemplate5(ctx);
    case 13: return renderSidebarRight(ctx);
    default: {
      const opts = SINGLE_COLUMN_VARIANTS[templateId];
      return opts ? renderSingleColumn(ctx, opts) : renderTemplate1(ctx);
    }
  }
};
