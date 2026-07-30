import { useEffect } from 'react';
import { SITE_URL } from './contentPages.mjs';

// Keeps <title>, the meta description and the canonical link in sync with the
// route while the SPA is running.
//
// Crawlers get these from the pre-rendered HTML (scripts/seo-postbuild.js), but
// client-side navigation never reloads the document — without this, a visitor
// who clicks through to /templates still sees the home page title in their tab,
// their history, and anything they share from the browser UI.
const useDocumentMeta = ({ title, description, path }) => {
  useEffect(() => {
    if (!title) return undefined;
    const previousTitle = document.title;
    document.title = title;

    const apply = (selector, attr, value) => {
      const el = document.querySelector(selector);
      if (!el || value === undefined) return () => {};
      const previous = el.getAttribute(attr);
      el.setAttribute(attr, value);
      return () => {
        if (previous !== null) el.setAttribute(attr, previous);
      };
    };

    const restoreDescription = apply('meta[name="description"]', 'content', description);
    const restoreCanonical = apply(
      'link[rel="canonical"]',
      'href',
      path === undefined ? undefined : `${SITE_URL}${path === '/' ? '/' : `${path}/`}`
    );

    return () => {
      document.title = previousTitle;
      restoreDescription();
      restoreCanonical();
    };
  }, [title, description, path]);
};

export default useDocumentMeta;
