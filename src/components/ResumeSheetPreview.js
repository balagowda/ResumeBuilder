import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { DEFAULT_SECTION_ORDER, renderResumeTemplate, formatTextToList } from './ResumeTemplates';
import '../Styles/ResumeSheetPreview.css';

// The templates are designed against a 560x794 sheet with 32px padding — the
// same geometry the editor and the gallery cards use. Rendering them at any
// other size makes the type land at the wrong scale and pushes text into the
// margins, so the preview matches that page exactly and scales the whole sheet
// to whatever width the column happens to be.
const PAGE_W = 560;
const PAGE_H = 794;
const PAGE_PAD = 32;
const CONTENT_H = PAGE_H - PAGE_PAD * 2;

// Below this the type stops being legible; better to clip than to shrink into
// unreadability, and it means a runaway resume cannot loop forever.
const MIN_FIT = 0.62;

/**
 * A read-only A4 preview of one resume.
 *
 * Shared by the template pages and the example pages so both render identically
 * — and so a fix to either lands in both.
 */
const ResumeSheetPreview = ({ templateId, formData, experienceHeading = 'Experience', label }) => {
  const clipRef = useRef(null);
  const fitRef = useRef(null);
  const [scale, setScale] = useState(null);

  // Scale to the column: the page pages are 420px wide on desktop and full
  // width once the layout stacks, so read the real width rather than guessing
  // it in a media query.
  useLayoutEffect(() => {
    const clip = clipRef.current;
    if (!clip) return undefined;

    const measure = () => {
      const width = clip.getBoundingClientRect().width;
      if (width > 0) setScale(width / PAGE_W);
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(clip);
    return () => observer.disconnect();
  }, []);

  // Shrink content that runs past one page, the way "fit to one page" does in
  // the editor. Narrowing the layout re-wraps the text, so the height has to be
  // re-measured rather than solved in one division — a few passes converge.
  const fitToPage = useCallback(() => {
    const fit = fitRef.current;
    const content = fit && fit.firstElementChild;
    if (!content) return;

    let current = 1;
    fit.style.setProperty('--content-scale', '1');

    for (let pass = 0; pass < 5; pass += 1) {
      const height = content.scrollHeight;
      const available = CONTENT_H / current;
      if (height <= available) break;

      current = Math.max(MIN_FIT, current * (available / height) * 0.99);
      fit.style.setProperty('--content-scale', String(current));
      if (current === MIN_FIT) break;
    }
  }, []);

  useLayoutEffect(fitToPage, [fitToPage, templateId, formData]);

  const ctx = {
    formData,
    sectionOrder: DEFAULT_SECTION_ORDER,
    experienceHeading,
    formatTextToList,
  };

  return (
    <div className="sheet-frame">
      <div
        className="sheet-clip"
        ref={clipRef}
        style={{ height: scale ? `${PAGE_H * scale}px` : undefined }}
        role="img"
        aria-label={label}
      >
        <div
          className="sheet-page"
          style={{
            transform: scale ? `scale(${scale})` : undefined,
            // The templates read their typography from these, which the editor
            // sets inline. Without them a preview falls back to the app font.
            '--font-heading': formData.fontHeading,
            '--font-subheading': formData.fontSubheading,
            '--font-text': formData.fontText,
            '--line-height': formData.lineHeight,
          }}
        >
          <div className="sheet-fit" ref={fitRef}>
            {renderResumeTemplate(templateId, ctx)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeSheetPreview;
