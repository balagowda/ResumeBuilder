import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EXAMPLE_RESUMES, findExample, exampleSections } from '../seo/exampleResumes.mjs';
import { examplePageMeta, EXAMPLES_HUB_META } from '../seo/pageMeta.mjs';
import { DEFAULT_SECTION_ORDER, renderResumeTemplate, formatTextToList } from './ResumeTemplates';
import { stageExample } from '../utils/pendingExample';
import useDocumentMeta from '../seo/useDocumentMeta';
import '../Styles/ResumeExamples.css';

/** Hub page: /examples */
export const ExamplesHub = () => {
  useDocumentMeta({ ...EXAMPLES_HUB_META, path: '/examples' });

  return (
    <div className="examples-page">
      <div className="examples-inner">
        <h1>Resume Examples by Job Title</h1>
        <p className="examples-lead">
          Complete resumes, not fragments — written the way recruiters in each
          field actually read them. Open one in the editor, replace the content
          with your own, and download a PDF. Free, no sign-up, and nothing you
          type leaves your browser.
        </p>

        <ul className="examples-grid">
          {EXAMPLE_RESUMES.map((example) => (
            <li key={example.slug} className="example-card">
              <h2>
                <Link to={`/examples/${example.slug}`}>{example.role} Resume Example</Link>
              </h2>
              <p>{example.summaryLine}</p>
              <span className="example-card-meta">
                Uses the {example.templateNote.split(' — ')[0]} template
              </span>
            </li>
          ))}
        </ul>

        <p className="examples-footnote">
          Want to start from a design instead?{' '}
          <Link to="/templates">Browse all 25 free resume templates</Link>, or{' '}
          <Link to="/ats-resume-checker">check an existing resume against a job posting</Link>.
        </p>
      </div>
    </div>
  );
};

/** Detail page: /examples/<slug> */
export const ExampleDetail = () => {
  const { slug } = useParams();
  const example = findExample(slug);
  const meta = example ? examplePageMeta(example) : null;
  const navigate = useNavigate();

  useDocumentMeta({
    title: meta?.title,
    description: meta?.description,
    path: example ? `/examples/${example.slug}` : undefined,
  });

  if (!example) {
    return (
      <div className="examples-page">
        <div className="examples-inner">
          <h1>Example not found</h1>
          <p>
            <Link to="/examples">See the resume examples</Link> that do exist.
          </p>
        </div>
      </div>
    );
  }

  const handleUseExample = () => {
    stageExample(`${example.role} example`, example.data);
    navigate(`/template${example.templateId}`);
  };

  const previewCtx = {
    formData: example.data,
    sectionOrder: DEFAULT_SECTION_ORDER,
    experienceHeading: 'Experience',
    formatTextToList,
  };

  return (
    <div className="examples-page">
      <div className="examples-inner">
        <nav className="examples-crumbs" aria-label="Breadcrumb">
          <Link to="/examples">Resume examples</Link>
          <span aria-hidden="true">/</span>
          <span>{example.role}</span>
        </nav>

        <h1>{example.role} Resume Example ({example.year})</h1>
        <p className="examples-lead">{example.intro}</p>

        <div className="example-actions">
          <button type="button" className="example-cta" onClick={handleUseExample}>
            Use this example <i className="fas fa-arrow-right" aria-hidden="true"></i>
          </button>
          <span className="example-actions-note">
            Loads it into the editor on the {example.templateNote}.
          </span>
        </div>

        <div className="example-layout">
          <div className="example-preview" aria-label={`${example.role} resume preview`}>
            <div className="example-sheet">
              {renderResumeTemplate(example.templateId, previewCtx)}
            </div>
          </div>

          <div className="example-copy">
            <section>
              <h2>Why this {example.role.toLowerCase()} resume works</h2>
              <ul className="example-list">
                {example.whatWorks.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2>The full text</h2>
              {exampleSections(example).map((section) => (
                <div className="example-text-block" key={section.heading}>
                  <h3>{section.heading}</h3>
                  <ul>
                    {section.lines.filter(Boolean).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          </div>
        </div>

        <p className="examples-footnote">
          <Link to="/examples">All resume examples</Link> ·{' '}
          <Link to="/templates">All 25 free templates</Link> ·{' '}
          <Link to="/ats-resume-checker">Free ATS checker</Link>
        </p>
      </div>
    </div>
  );
};
