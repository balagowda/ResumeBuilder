import React from 'react';
import { Link } from 'react-router-dom';
import { CONTENT_PAGES } from '../seo/contentPages.mjs';
import useDocumentMeta from '../seo/useDocumentMeta';
import '../Styles/ContentPage.css';

// Renders one of the static text pages (/about, /faq, /alternatives) from the
// shared content data. scripts/seo-postbuild.js serialises the exact same data
// into static HTML at build time, so what a crawler reads and what a visitor
// sees stay identical.
const ContentPage = ({ pagePath }) => {
  const page = CONTENT_PAGES.find((p) => p.path === pagePath);

  useDocumentMeta({
    title: page?.title,
    description: page?.description,
    path: page?.path,
  });

  if (!page) return null;

  return (
    <div className="content-page">
      <article className="content-page-inner">
        <h1>{page.h1}</h1>
        {page.intro && <p className="content-lead">{page.intro}</p>}

        {(page.sections || []).map((section) => (
          <section key={section.h2} className="content-section">
            <h2>{section.h2}</h2>
            {(section.body || []).map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            {section.bullets && (
              <ul className="content-list">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {section.table && (
              <div className="content-table-wrap">
                <table className="content-table">
                  <thead>
                    <tr>
                      {section.table.headers.map((header, i) => (
                        <th key={header || `col-${i}`} scope="col">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row) => (
                      <tr key={row[0]}>
                        <th scope="row">{row[0]}</th>
                        {row.slice(1).map((cell, i) => (
                          <td key={`${row[0]}-${i}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}

        {page.faqs && (
          <section className="content-section">
            <dl className="content-faq">
              {page.faqs.map((item) => (
                <div className="content-faq-item" key={item.q}>
                  <dt>{item.q}</dt>
                  <dd>{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {page.cta && (
          <p className="content-cta">
            <Link to={page.cta.to} className="content-cta-btn">
              {page.cta.label} <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Link>
          </p>
        )}
      </article>
    </div>
  );
};

export default ContentPage;
