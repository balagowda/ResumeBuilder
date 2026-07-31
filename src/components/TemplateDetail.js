import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { TEMPLATE_PAGES, findTemplatePage } from './templateMeta.mjs';
import { SAMPLE_DATA, DEFAULT_SECTION_ORDER, renderResumeTemplate, formatTextToList } from './ResumeTemplates';
import useDocumentMeta from '../seo/useDocumentMeta';
import { templatePageMeta, templateCopy } from '../seo/pageMeta.mjs';
import '../Styles/TemplateDetail.css';

const sampleCtx = {
  formData: SAMPLE_DATA,
  sectionOrder: DEFAULT_SECTION_ORDER,
  experienceHeading: 'Experience',
  formatTextToList,
};

// A page per template. Each one is a real, indexable URL for a query like
// "faang engineer resume template" — the gallery alone gave search engines a
// single page for all 25 designs.
const TemplateDetail = () => {
  const { slug } = useParams();
  const template = findTemplatePage(slug);
  const meta = template ? templatePageMeta(template) : null;

  useDocumentMeta({
    title: meta?.title,
    description: meta?.description,
    path: template?.path,
  });

  if (!template) {
    return (
      <div className="template-detail">
        <div className="template-detail-inner">
          <h1>Template not found</h1>
          <p>
            That template does not exist. <Link to="/templates">Browse all 25 free
            resume templates</Link> instead.
          </p>
        </div>
      </div>
    );
  }

  // Same category first, then wrap around the catalogue — keeps every template
  // page linked to a handful of others so crawlers can walk the whole set.
  const related = TEMPLATE_PAGES.filter(
    (t) => t.id !== template.id && t.category === template.category
  )
    .concat(TEMPLATE_PAGES.filter((t) => t.id !== template.id && t.category !== template.category))
    .slice(0, 4);

  return (
    <div className="template-detail">
      <div className="template-detail-inner">
        <nav className="template-crumbs" aria-label="Breadcrumb">
          <Link to="/templates">Resume templates</Link>
          <span aria-hidden="true">/</span>
          <span>{template.name}</span>
        </nav>

        <div className="template-detail-grid">
          <div className="template-detail-copy">
            <h1>{template.name} Resume Template</h1>
            <p className="template-detail-lead">{template.description}</p>

            <dl className="template-facts">
              <div>
                <dt>Layout</dt>
                <dd>{template.layout}</dd>
              </div>
              <div>
                <dt>Style</dt>
                <dd>{template.category}</dd>
              </div>
              <div>
                <dt>ATS parsing</dt>
                <dd>{template.atsFirst ? 'Built for ATS first' : 'ATS-safe structure'}</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>Free — no account</dd>
              </div>
            </dl>

            <div className="template-tags">
              {template.tags.map((tag) => (
                <span key={tag} className="template-tag">{tag}</span>
              ))}
            </div>

            <Link to={`/template${template.id}`} className="template-detail-cta">
              Use this template <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Link>

            <p className="template-detail-note">
              Opens in the editor with sample content you can overwrite. Export a
              text-based PDF that applicant tracking systems can read, or a
              pixel-exact image PDF — both free, no watermark, no sign-up.
            </p>
          </div>

          <div className="template-detail-preview" aria-label={`${template.name} preview`}>
            <div className="template-detail-sheet">
              {renderResumeTemplate(template.id, sampleCtx)}
            </div>
          </div>
        </div>

        <section className="template-detail-section">
          <h2>Is the {template.name} template right for you?</h2>
          <p>{templateCopy(template).layout}</p>
          <p>{templateCopy(template).ats}</p>
        </section>

        <section className="template-detail-section">
          <h2>Other free templates</h2>
          <ul className="template-related">
            {related.map((t) => (
              <li key={t.id}>
                <Link to={t.path}>{t.name}</Link>
                <span> — {t.category}, {t.layout.toLowerCase()}</span>
              </li>
            ))}
          </ul>
          <p>
            <Link to="/templates">See all {TEMPLATE_PAGES.length} free resume templates</Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default TemplateDetail;
