import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { renderResumeTemplate, TEMPLATES, SAMPLE_DATA, formatTextToList, DEFAULT_SECTION_ORDER } from './ResumeTemplates';
import Summary from './Summary';
import ContactFields from './ContactFields';
import Experiences from './Experiences';
import Education from './Education';
import Projects from './Projects';
import Skills from './Skills';
import Others from './Others';
import JobMatch from './JobMatch';
import StylingControls from './StylingControls';
import ResumeVersions from './ResumeVersions';
import StorageNotice from './StorageNotice';
import ContentReview from './ContentReview';
import useResumeStore from '../hooks/useResumeStore';
import { takePendingExample } from '../utils/pendingExample';
import generateAtsPdf from '../utils/textPdf';
import '../Styles/TemplateWorkspace.css';

// Preview sheet geometry. The sheet is 560x794 CSS px (A4 at the preview's
// scale) with 32px padding, and grows in whole-page increments.
const PAGE_H = 794;
const SHEET_W = 560;
const SHEET_PAD = 64; // 32px top + 32px bottom
const MIN_SCALE = 0.7;
const SCROLLBAR_GUTTER = 16;

/**
 * How far the sheet has to shrink to fit `available` px of width.
 *
 * The sheet is never allowed to reflow to the viewport: every measurement that
 * matters — content height, page count, where the page breaks land, what
 * html2canvas captures — is only meaningful at the real 560px width. A narrow
 * screen therefore gets a scaled-down copy of the actual page rather than a
 * differently-shaped one, and never scales up past 1:1.
 */
const fitScaleFor = (available) =>
  available >= SHEET_W ? 1 : Math.max(0.3, available / SHEET_W);

// Single source of truth for a pristine resume, so "Clear Data" lands on
// exactly the same state as a first visit — including typography, which used
// to be dropped rather than reset.
const createEmptyFormData = () => ({
  fullName: '',
  professionalTitle: '',
  mail: '',
  mobile: '',
  linkedin: '',
  github: '',
  other: '',
  summary: '',
  experiences: [{ title: '', company: '', dates: '', description: '' }],
  education: [{ studyTitle: '', school: '', date: '', score: '' }],
  projects: [{ title: '', description: '', dates: '' }],
  others: [],
  skills: '',
  jobDescription: '',
  addHeaderLine: false,
  showProfessionalTitle: false,
  fontHeading: 'Arial, Helvetica, sans-serif',
  fontSubheading: 'Arial, Helvetica, sans-serif',
  fontText: 'Arial, Helvetica, sans-serif',
  lineHeight: 1.4,
  contentScale: 1,
});

const DEFAULT_EXPERIENCE_HEADING = 'Experience and Internships';

export default function TemplateWorkspace({ templateId }) {
  const store = useResumeStore(createEmptyFormData);
  const {
    formData,
    setFormData,
    updateActive,
    savedAt,
    needsBackup,
    markBackedUp,
    storageError,
    clearEverything,
  } = store;

  // Per-resume view state, previously component-only — so a reload silently
  // reset the section order the user had arranged.
  const sectionOrder = store.active?.sectionOrder || DEFAULT_SECTION_ORDER;
  const setSectionOrder = useCallback(
    (order, opts = { label: 'reorder sections' }) => updateActive({ sectionOrder: order }, opts),
    [updateActive]
  );
  const experienceHeading = store.active?.experienceHeading || DEFAULT_EXPERIENCE_HEADING;
  const setExperienceHeading = useCallback(
    (heading) => updateActive({ experienceHeading: heading }, { label: 'section heading' }),
    [updateActive]
  );

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    summary: true,
    experiences: true,
    education: true,
    projects: true,
    skills: true,
    others: true,
    jobMatch: true,
    contentReview: true,
  });

  const resumeRef = useRef();
  const importInputRef = useRef();
  const panelRef = useRef();
  const navigate = useNavigate();

  const [sidebarWidth, setSidebarWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [dragOverSection, setDragOverSection] = useState(null);
  // Shrink-to-fit factor for screens too narrow to show the sheet at 1:1.
  const [fitScale, setFitScale] = useState(1);
  const [previewFitScale, setPreviewFitScale] = useState(1);

  // Layout height of .resume-content in CSS px, before --content-scale is
  // applied. Drives the page count and the overflow warning.
  const [contentHeight, setContentHeight] = useState(0);
  const [isFitting, setIsFitting] = useState(false);
  // Set when even the smallest readable text size still spills onto page two.
  const [fitFailed, setFitFailed] = useState(false);

  const contentScale = formData.contentScale || 1;
  // What the sheet is displayed at: the user's zoom, then shrunk again if the
  // screen is too narrow for 1:1. Export does not go through this — see
  // handleDownloadPDF — so nothing here moves while a PDF is being made.
  const displayScale = (zoom / 100) * fitScale;
  const scaledHeight = contentHeight * contentScale;
  const pageCount = Math.max(1, Math.ceil((scaledHeight + SHEET_PAD) / PAGE_H));
  const sheetHeight = pageCount * PAGE_H;

  const measureContent = useCallback(() => {
    const root = resumeRef.current;
    if (!root) return;
    const el = root.querySelector('.resume-content');
    if (!el) return;
    const next = el.offsetHeight;
    setContentHeight((prev) => (prev === next ? prev : next));
  }, []);

  // Elements currently carrying an injected page-break margin, so each pass
  // can undo the previous one before recalculating.
  const pushedElsRef = useRef([]);

  const clearPageBreaks = useCallback(() => {
    // Restore whatever the template itself had set inline — some templates use
    // inline margins, so blanking the property outright would corrupt them.
    pushedElsRef.current.forEach(({ el, originalMarginTop }) => {
      el.style.marginTop = originalMarginTop;
    });
    pushedElsRef.current = [];
  }, []);

  /**
   * Keep any single block — a job, a project, a bullet — from straddling a page
   * boundary, by nudging it down onto the next page. Without this the PDF
   * export, which slices the sheet at fixed page intervals, would cut straight
   * through a line of text.
   */
  const applyPageBreaks = useCallback(() => {
    const root = resumeRef.current;
    if (!root) return;
    const content = root.querySelector('.resume-content');
    if (!content) return;

    clearPageBreaks();

    const scale = formData.contentScale || 1;
    const pad = SHEET_PAD / 2; // top margin given to content pushed onto a new page
    const usableHeight = PAGE_H - pad;

    // Treat a block as atomic once it is small enough to fit on a page;
    // descend into anything larger so we move entries rather than whole columns.
    const collectAtoms = () => {
      const rootTop = root.getBoundingClientRect().top;
      const atoms = [];
      const walk = (el) => {
        Array.from(el.children).forEach((child) => {
          const rect = child.getBoundingClientRect();
          if (rect.height <= 0) return;
          if (rect.height > PAGE_H * 0.35 && child.children.length > 0) {
            walk(child);
          } else {
            atoms.push({ el: child, top: rect.top - rootTop, bottom: rect.bottom - rootTop });
          }
        });
      };
      walk(content);
      return atoms;
    };

    // One push per pass, then re-measure, since moving a block shifts
    // everything after it. The cap stops any pathological layout from looping.
    for (let pass = 0; pass < 40; pass += 1) {
      const atoms = collectAtoms();
      const target = atoms.find((atom) => {
        // A block taller than a page can never be made to fit; leave it be.
        if (atom.bottom - atom.top > usableHeight) return false;
        const pageIdx = Math.floor(atom.top / PAGE_H);
        // Trigger on the line the PDF actually slices at, not on the page
        // margin — pushing a block that merely runs into the bottom margin
        // would cost a whole extra page for no visible benefit. The 1px
        // tolerance ignores sub-pixel descender overhang.
        return atom.bottom > (pageIdx + 1) * PAGE_H + 1;
      });
      if (!target) break;

      const pageIdx = Math.floor(target.top / PAGE_H);
      const deltaVisual = (pageIdx + 1) * PAGE_H + pad - target.top;
      if (deltaVisual <= 0) break;

      const currentMargin = parseFloat(getComputedStyle(target.el).marginTop) || 0;
      pushedElsRef.current.push({
        el: target.el,
        originalMarginTop: target.el.style.marginTop,
      });
      // Margins are applied pre-transform, so undo the content scale.
      target.el.style.marginTop = `${currentMargin + deltaVisual / scale}px`;
    }
  }, [clearPageBreaks, formData.contentScale]);

  // Order matters: repaginate first, then measure, so the height that drives
  // the page count already accounts for the injected breaks.
  useLayoutEffect(applyPageBreaks);
  useLayoutEffect(measureContent);

  // A failed fit describes the resume as it was, so any edit makes it stale.
  // Keyed on formData identity rather than the measured height: the height
  // jitters by a pixel after probing, which would clear the flag immediately.
  useEffect(() => {
    setFitFailed(false);
  }, [formData]);

  useEffect(() => {
    const root = resumeRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return undefined;
    const el = root.querySelector('.resume-content');
    if (!el) return undefined;
    const ro = new ResizeObserver(measureContent);
    ro.observe(el);
    return () => ro.disconnect();
  }, [templateId, measureContent]);

  // How much width the preview panel can actually give the sheet.
  const measureFit = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    const styles = window.getComputedStyle(el);
    // Deliberately the border-box width rather than clientWidth: clientWidth
    // excludes the panel's vertical scrollbar, and scaling the sheet changes
    // how tall it is, which can make that scrollbar appear or disappear. At one
    // specific window width the two would chase each other every frame, so the
    // gutter is reserved as a constant instead of measured.
    const available =
      el.getBoundingClientRect().width -
      (parseFloat(styles.paddingLeft) || 0) -
      (parseFloat(styles.paddingRight) || 0) -
      SCROLLBAR_GUTTER;
    // The panel has no width yet (first paint, or the editor rendered while
    // hidden). Keep whatever scale we had rather than collapsing to the floor.
    if (!(available > 0)) return;
    const next = fitScaleFor(available);
    setFitScale((prev) => (prev === next ? prev : next));
  }, []);

  // Same arrangement as measureContent above: run it after every render, and
  // separately on resize, which changes the panel without re-rendering.
  // ResizeObserver alone would be neater but is not universally reliable.
  useLayoutEffect(measureFit);

  useEffect(() => {
    window.addEventListener('resize', measureFit);
    return () => window.removeEventListener('resize', measureFit);
  }, [measureFit]);

  // The modal sizes itself off the viewport rather than the panel, so it needs
  // its own factor. Only tracked while it is open.
  useEffect(() => {
    if (!isPreviewOpen) return undefined;
    // .preview-modal has 20px of side padding; .preview-content caps at 620px.
    const update = () =>
      setPreviewFitScale(fitScaleFor(Math.min(620, window.innerWidth - 40)));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isPreviewOpen]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      const minWidth = 350;
      const maxWidth = window.innerWidth - 600;
      if (newWidth < minWidth) newWidth = minWidth;
      if (newWidth > maxWidth) newWidth = maxWidth;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Persistence itself now lives in useResumeStore.

  // An example page can hand over a finished resume on its way here. It arrives
  // as a new resume rather than overwriting the open one, so nothing the user
  // already typed is lost, and it lands as a single undo step.
  useEffect(() => {
    const pending = takePendingExample();
    if (!pending) return;
    store.createResumeFrom(pending.name, pending.data, { templateId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warn before the tab closes, but only when closing would actually cost the
  // user something: there is real content, it has not been backed up, and the
  // data is session-scoped so the browser is about to erase it.
  //
  // The browser shows its own generic wording here — custom text has been
  // ignored by every major browser for years — so the StorageNotice banner
  // carries the explanation this dialog cannot.
  useEffect(() => {
    if (!needsBackup) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [needsBackup]);

  // Undo/redo shortcuts.
  //
  // Deliberately left alone while a text field has focus: the browser's own
  // undo there is per-character and is what anyone mid-sentence expects. Taking
  // it over would trade a good fine-grained undo for a coarse one. The toolbar
  // buttons stay available for structural changes regardless of focus.
  useEffect(() => {
    const isEditing = (el) =>
      el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

    const handleKeyDown = (event) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod || event.key.toLowerCase() !== 'z') return;
      if (isEditing(event.target)) return;

      event.preventDefault();
      if (event.shiftKey) store.redo();
      else store.undo();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);

  // Drag-and-Drop section reordering
  const handleDragStart = (e, section) => {
    if (!e.target.closest('.drag-handle')) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('section', section);
    const sectionElement = e.target.closest('.draggable-section');
    if (sectionElement) {
      sectionElement.classList.add('dragging');
      const preview = sectionElement.cloneNode(true);
      preview.classList.add('drag-preview');
      document.body.appendChild(preview);
      preview.style.position = 'absolute';
      preview.style.top = '-9999px';
      preview.style.width = `${sectionElement.offsetWidth}px`;
      preview.style.opacity = '0.7';
      preview.style.transform = 'scale(1.02)';
      preview.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      preview.style.zIndex = '1000';
      preview.style.pointerEvents = 'none';
      e.dataTransfer.setDragImage(preview, 10, 10);
      setTimeout(() => {
        document.body.removeChild(preview);
      }, 0);
    }
  };

  const handleDragOver = (e, section) => {
    e.preventDefault();
    if (section !== dragOverSection) {
      setDragOverSection(section);
    }
  };

  const handleDrop = (e, targetSection) => {
    e.preventDefault();
    const draggedSection = e.dataTransfer.getData('section');
    setDragOverSection(null);
    if (draggedSection === targetSection) return;
    const newOrder = [...sectionOrder];
    const draggedIndex = newOrder.indexOf(draggedSection);
    const targetIndex = newOrder.indexOf(targetSection);
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedSection);
    setSectionOrder(newOrder, { label: 'reorder sections' });
    document.querySelectorAll('.draggable-section').forEach((el) => {
      el.classList.remove('dragging');
    });
  };

  const handleDragEnd = (e) => {
    const sectionElement = e.target.closest('.draggable-section');
    if (sectionElement) {
      sectionElement.classList.remove('dragging');
    }
    setDragOverSection(null);
  };

  // Move a section one place without dragging. The drag handle above is HTML5
  // drag-and-drop, which never fires on a touch screen, so on a phone these
  // buttons are the only way to reorder at all. Entries already work this way
  // through moveEntry.
  const moveSection = (section, direction) => {
    const from = sectionOrder.indexOf(section);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= sectionOrder.length) return;
    const next = [...sectionOrder];
    [next[from], next[to]] = [next[to], next[from]];
    setSectionOrder(next);
  };

  // The handle every section renders in its heading: grab-to-drag on a pointer,
  // and the two buttons for everyone else. The heading itself toggles the
  // section, hence stopPropagation.
  const sectionHandle = (section) => {
    const index = sectionOrder.indexOf(section);
    return (
      <span className="section-handle">
        <span
          className="drag-handle"
          draggable="true"
          onDragStart={(e) => handleDragStart(e, section)}
          onDragEnd={handleDragEnd}
          title="Drag to reorder"
        >
          <i className="fas fa-grip-vertical"></i>
        </span>
        <button
          type="button"
          className="section-move"
          onClick={(e) => { e.stopPropagation(); moveSection(section, -1); }}
          disabled={index <= 0}
          title="Move section up"
          aria-label={`Move ${section} section up`}
        >
          <i className="fas fa-chevron-up" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          className="section-move"
          onClick={(e) => { e.stopPropagation(); moveSection(section, 1); }}
          disabled={index === -1 || index >= sectionOrder.length - 1}
          title="Move section down"
          aria-label={`Move ${section} section down`}
        >
          <i className="fas fa-chevron-down" aria-hidden="true"></i>
        </button>
      </span>
    );
  };

  const handleChange = (e, section, index = null) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    if (index !== null) {
      const updatedSection = [...formData[section]];
      updatedSection[index] = { ...updatedSection[index], [name]: finalValue };
      setFormData({ ...formData, [section]: updatedSection });
    } else {
      setFormData({ ...formData, [name]: finalValue });
    }
  };

  const addEntry = (section) => {
    setFormData({
      ...formData,
      [section]: [...formData[section],
        section === 'education' ? { studyTitle: '', school: '', date: '', score: '' } :
        section === 'experiences' ? { title: '', company: '', dates: '', description: '' } :
        section === 'projects' ? { title: '', description: '', dates: '' } :
        { title: '', description: '' }],
    }, { label: `add ${section}` });
  };

  const deleteEntry = (section, index) => {
    const updatedSection = formData[section].filter((_, i) => i !== index);
    setFormData({ ...formData, [section]: updatedSection }, { label: `delete ${section}` });
  };

  // Reorder a single entry — adding a job out of order used to mean retyping
  // both of them, since only whole sections could be moved.
  const moveEntry = (section, index, direction) => {
    const target = index + direction;
    const list = formData[section] || [];
    if (target < 0 || target >= list.length) return;
    const updated = [...list];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setFormData({ ...formData, [section]: updated }, { label: `reorder ${section}` });
  };
  
  const handleDownloadPDF = async () => {
    const originalElement = resumeRef.current;
    if (!originalElement) return;

    try {
      // The sheet on screen is scaled — by the user's zoom, and on a narrow
      // screen by the shrink-to-fit factor — and html2canvas takes its bounds
      // from getBoundingClientRect, so left alone it would capture the sheet at
      // whatever size it is currently displayed at and stretch that onto A4.
      //
      // Undoing the scale on the real element works, but the preview visibly
      // jumps while the capture runs. html2canvas renders its own copy of the
      // document instead of the pixels on screen, so the same thing can be done
      // there, where nobody sees it: onclone lifts the sheet out of the scaled
      // wrapper, drops it at the origin on its own, and the explicit bounds
      // below crop exactly that. Nothing on screen moves.
      const canvas = await html2canvas(originalElement, {
        scale: 3, // 3x scale guarantees retina-quality crisp text when stretched
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: SHEET_W,
        height: sheetHeight,
        onclone: (clonedDoc, clonedSheet) => {
          const body = clonedDoc.body;
          body.appendChild(clonedSheet);
          // Everything else would still paint at the origin underneath it.
          Array.from(body.children).forEach((child) => {
            if (child !== clonedSheet) child.remove();
          });
          body.style.margin = '0';
          body.style.padding = '0';
          clonedSheet.style.position = 'absolute';
          clonedSheet.style.left = '0';
          clonedSheet.style.top = '0';
          clonedSheet.style.margin = '0';
        },
        ignoreElements: (element) => {
          // Check if classList exists and contains is a function (SVG elements can break this)
          if (element.classList && typeof element.classList.contains === 'function') {
            return element.classList.contains('preview-btn') ||
                   element.classList.contains('page-guides');
          }
          return false;
        }
      });

      // Create an A4 PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      // Safely get exact dimensions of an A4 page across different jsPDF versions
      const pdfWidth = pdf.internal.pageSize.getWidth ? pdf.internal.pageSize.getWidth() : pdf.internal.pageSize.width;
      const pdfHeight = pdf.internal.pageSize.getHeight ? pdf.internal.pageSize.getHeight() : pdf.internal.pageSize.height;

      // The sheet is pageCount x 794 CSS px tall, so slice the tall capture
      // into one A4 image per page instead of squashing it all onto page 1.
      const pxPerPage = canvas.height / pageCount;

      for (let page = 0; page < pageCount; page += 1) {
        if (page > 0) pdf.addPage();

        const sliceTop = Math.round(page * pxPerPage);
        const sliceHeight = Math.min(Math.round(pxPerPage), canvas.height - sliceTop);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.round(pxPerPage);
        const ctx = pageCanvas.getContext('2d');
        // Pad the final slice with white rather than leaving it transparent
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0, sliceTop, canvas.width, sliceHeight,
          0, 0, canvas.width, sliceHeight
        );

        pdf.addImage(pageCanvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      // --- INJECT CLICKABLE LINKS ---
      // Since html2canvas outputs a flat image, we must manually map HTML <a> tags to PDF link boxes
      //
      // These rects come from the live sheet, so they carry whatever scale it
      // is displayed at. That is harmless: every one of them below is divided
      // by origRect, so a uniform scale cancels out and the ratios are the same
      // at any zoom.
      const origRect = originalElement.getBoundingClientRect();
      const cssPageHeight = origRect.height / pageCount;
      const links = originalElement.querySelectorAll('a');

      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;

        const rect = link.getBoundingClientRect();

        // Calculate relative position within the resume container
        const relX = rect.left - origRect.left;
        const relY = rect.top - origRect.top;

        // Work out which page the link landed on, and its offset within it
        const linkPage = Math.min(pageCount - 1, Math.floor(relY / cssPageHeight));
        const relYOnPage = relY - linkPage * cssPageHeight;

        // Mathematically scale the coordinates to match the stretched A4 page
        const pdfLinkX = (relX / origRect.width) * pdfWidth;
        const pdfLinkY = (relYOnPage / cssPageHeight) * pdfHeight;
        const pdfLinkW = (rect.width / origRect.width) * pdfWidth;
        const pdfLinkH = (rect.height / cssPageHeight) * pdfHeight;

        // Overlay an invisible clickable region on the right page
        pdf.setPage(linkPage + 1);
        pdf.link(pdfLinkX, pdfLinkY, pdfLinkW, pdfLinkH, { url: href });
      });

      const filename = `${formData.fullName ? formData.fullName.replace(/\s+/g, '_') : 'Resume'}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to download PDF. Error: ${error.message}`);
    }
  };

  // One-click text-based export: a real text-layer PDF built with jsPDF, so
  // the text is selectable and ATS parsers can read it — no print dialog.
  const handleDownloadTextPDF = () => {
    try {
      generateAtsPdf({ formData, sectionOrder, experienceHeading });
    } catch (error) {
      console.error('Error generating ATS PDF:', error);
      alert(`Failed to download ATS PDF. Error: ${error.message}`);
    }
  };

  // Kept as a fallback: the browser's print-to-PDF pipeline renders the
  // template exactly as styled, also with selectable text.
  const handlePrintPDF = () => {
    window.print();
  };

  const handleSwitchTemplate = (e) => {
    navigate(`/template${e.target.value}`);
  };

  // Remember which template the outgoing resume was on before switching, then
  // follow the incoming one back to its own template. Doing both here rather
  // than in an effect avoids the two writes racing each other.
  const handleSwitchResume = (id) => {
    if (id === store.activeId) return;
    updateActive({ templateId });
    store.switchResume(id);
    const target = store.resumes.find((r) => r.id === id);
    if (target && target.templateId && target.templateId !== templateId) {
      navigate(`/template${target.templateId}`);
    }
  };

  const handleCreateResume = () => {
    updateActive({ templateId });
    store.createResume(`Resume ${store.resumes.length + 1}`);
  };

  const handleLoadSample = () => {
    const hasContent = formData.fullName || formData.summary ||
      (formData.experiences && formData.experiences[0] && formData.experiences[0].title);
    if (hasContent && !window.confirm('Load sample data? This will replace your current resume content.')) {
      return;
    }
    setFormData({ ...formData, ...SAMPLE_DATA }, { label: 'load sample' });
  };

  // Backs up the whole store — every resume, with its name, section order,
  // heading, and template — not just the open form. Old backups held a single
  // formData object; handleImportJSON still accepts those.
  const handleExportJSON = () => {
    const payload = {
      app: 'hatchresume',
      schema: 1,
      exportedAt: new Date().toISOString(),
      activeId: store.activeId,
      // templateId is normally recorded on switch, so stamp the open resume
      // with the template it is on right now.
      resumes: store.resumes.map((r) => (r.id === store.activeId ? { ...r, templateId } : r)),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hatchresume_backup.json';
    link.click();
    URL.revokeObjectURL(url);
    // Clears the "not backed up" warning and the close prompt.
    markBackedUp();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (typeof imported !== 'object' || imported === null || Array.isArray(imported)) {
          throw new Error('Not a resume backup file');
        }
        if (Array.isArray(imported.resumes)) {
          // Full-store backup: restore every resume it holds.
          const records = imported.resumes.filter(
            (r) => r && typeof r === 'object' && r.data && typeof r.data === 'object' && !Array.isArray(r.data)
          );
          if (records.length === 0) throw new Error('Backup holds no resumes');
          const restored = store.importResumes(records, imported.activeId);
          if (restored && restored.templateId && restored.templateId !== templateId) {
            navigate(`/template${restored.templateId}`);
          }
        } else {
          // Legacy backup: one bare formData object, merged into the open resume.
          setFormData((prev) => ({ ...prev, ...imported }), { label: 'restore backup' });
        }
      } catch (err) {
        alert('Could not import this file. Please choose a resume backup (.json) exported from this site.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearData = () => {
    if (window.confirm('Clear every resume you have here? This cannot be undone — download a backup first if you want to keep them.')) {
      clearEverything();
      setFitFailed(false);
    }
  };

  // --- Fit to one page -----------------------------------------------------
  // Changing --content-scale also changes the layout width the content wraps
  // at, so the resulting height can only be found by measuring. Probe the DOM
  // directly (bypassing React state) and commit the winner once.
  const fitToOnePage = () => {
    const root = resumeRef.current;
    if (!root || isFitting) return;
    const el = root.querySelector('.resume-content');
    if (!el) return;

    setIsFitting(true);

    // Probe against unpaginated content — the page-break margins are only
    // meaningful once the final scale is known, and would otherwise inflate
    // every measurement. The layout effect re-applies them after we commit.
    clearPageBreaks();

    // Writing the custom property and then reading offsetHeight forces a
    // synchronous style + layout pass, so the measurement is already current.
    // (Waiting on requestAnimationFrame here would stall in a hidden tab.)
    const heightAt = (s) => {
      root.style.setProperty('--content-scale', String(s));
      return el.offsetHeight * s + SHEET_PAD;
    };

    try {
      if (heightAt(1) <= PAGE_H) {
        setFitFailed(false);
        setFormData((prev) => ({ ...prev, contentScale: 1 }));
        return;
      }
      if (heightAt(MIN_SCALE) > PAGE_H) {
        // Even at the smallest readable size it will not fit. Shrinking anyway
        // would leave the user on tiny text *and* still on two pages, with no
        // hint as to why — so change nothing and say so instead.
        setFitFailed(true);
        return;
      }
      setFitFailed(false);

      let lo = MIN_SCALE; // known to fit
      let hi = 1; // known not to fit
      for (let i = 0; i < 7; i += 1) {
        const mid = (lo + hi) / 2;
        if (heightAt(mid) <= PAGE_H) lo = mid;
        else hi = mid;
      }

      // Round down to a tidy 1% step, then confirm the rounded value still fits.
      let best = Math.floor(lo * 100) / 100;
      while (best > MIN_SCALE && heightAt(best) > PAGE_H) {
        best = Math.round((best - 0.01) * 100) / 100;
      }
      setFormData((prev) => ({ ...prev, contentScale: best }));
    } finally {
      // Put the property back to what React currently believes rather than
      // removing it. React only rewrites an inline style when the prop itself
      // changes, so on the "cannot fit" path — where we deliberately commit no
      // new scale — removing it would silently drop the user's size setting.
      root.style.setProperty('--content-scale', String(formData.contentScale || 1));
      setIsFitting(false);
    }
  };

  const resetScale = () => setFormData((prev) => ({ ...prev, contentScale: 1 }));

  // Append a keyword from the job-match panel to the Skills field, skipping
  // anything already listed there.
  const handleAddSkill = (term) => {
    setFormData((prev) => {
      const current = (prev.skills || '').replace(/,\s*$/, '').trim();
      const listed = current
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (listed.includes(term.toLowerCase())) return prev;
      return { ...prev, skills: current ? `${current}, ${term}` : term };
    });
  };

  const togglePreview = () => {
    setIsPreviewOpen(!isPreviewOpen);
  };

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const calculateCompleteness = () => {
    let score = 0;
    if (formData.fullName) score += 15;
    if (formData.mail) score += 10;
    if (formData.mobile) score += 10;
    if (formData.summary) score += 15;
    if (formData.skills) score += 10;
    if (formData.experiences && formData.experiences.length > 0 && formData.experiences[0].title) score += 20;
    if (formData.education && formData.education.length > 0 && formData.education[0].studyTitle) score += 20;
    return score;
  };

  // What's still missing, so the strength meter is actionable
  const getStrengthTips = () => {
    const tips = [];
    if (!formData.fullName) tips.push({ label: 'Add your name', pts: 15 });
    if (!formData.mail) tips.push({ label: 'Add your email', pts: 10 });
    if (!formData.mobile) tips.push({ label: 'Add a phone number', pts: 10 });
    if (!formData.summary) tips.push({ label: 'Write a summary', pts: 15 });
    if (!formData.skills) tips.push({ label: 'List your skills', pts: 10 });
    if (!(formData.experiences && formData.experiences[0] && formData.experiences[0].title)) tips.push({ label: 'Add work experience', pts: 20 });
    if (!(formData.education && formData.education[0] && formData.education[0].studyTitle)) tips.push({ label: 'Add your education', pts: 20 });
    return tips.slice(0, 3);
  };


  const renderResumeContent = () =>
    renderResumeTemplate(templateId, { formData, sectionOrder, experienceHeading, formatTextToList });

  const renderInputPanel = () => {
    const completeness = calculateCompleteness();
    return (
      <div className="input-panel" style={{ width: sidebarWidth }}>
        <div className="input-panel-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <Link to="/templates" className="btn-back-templates" style={{ marginBottom: 0 }}>
              <i className="fas fa-arrow-left"></i> Back to Templates
            </Link>
            <div className="header-actions">
              <button
                className="history-btn"
                onClick={store.undo}
                disabled={!store.canUndo}
                title={store.canUndo ? `Undo ${store.undoLabel}` : 'Nothing to undo'}
                aria-label="Undo"
              >
                <i className="fas fa-rotate-left"></i>
              </button>
              <button
                className="history-btn"
                onClick={store.redo}
                disabled={!store.canRedo}
                title={store.canRedo ? `Redo ${store.redoLabel}` : 'Nothing to redo'}
                aria-label="Redo"
              >
                <i className="fas fa-rotate-right"></i>
              </button>
              <button className="btn-clear-data" onClick={handleClearData}>
                <i className="fas fa-trash-alt"></i> Clear Data
              </button>
            </div>
          </div>
          <h2>Your Details</h2>

          <StorageNotice
            mode={store.mode}
            onChangeMode={store.changeMode}
            needsBackup={needsBackup}
            onBackup={handleExportJSON}
            storageError={storageError}
          />

          <ResumeVersions
            resumes={store.resumes}
            activeId={store.activeId}
            active={store.active}
            onSwitch={handleSwitchResume}
            onCreate={handleCreateResume}
            onDuplicate={store.duplicateResume}
            onRename={store.renameResume}
            onDelete={store.deleteResume}
          />

          <div className="template-switcher-row">
            <label htmlFor="template-switcher"><i className="fas fa-layer-group"></i> Template</label>
            <select
              id="template-switcher"
              className="template-switcher-select"
              value={templateId}
              onChange={handleSwitchTemplate}
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="data-tools-row">
            <button className="data-tool-btn" onClick={handleLoadSample} title="Fill the form with example content">
              <i className="fas fa-magic"></i> Sample
            </button>
            <button className="data-tool-btn" onClick={handleExportJSON} title="Download your data as a backup file">
              <i className="fas fa-file-export"></i> Backup
            </button>
            <button className="data-tool-btn" onClick={() => importInputRef.current && importInputRef.current.click()} title="Restore data from a backup file">
              <i className="fas fa-file-import"></i> Restore
            </button>
            <input
              type="file"
              accept="application/json,.json"
              ref={importInputRef}
              onChange={handleImportJSON}
              style={{ display: 'none' }}
            />
          </div>
          <div className="strength-meter-container">
            <div className="strength-meter-header">
              <span>Resume Strength</span>
              <span>{completeness}%</span>
            </div>
            <div className="strength-meter-bar">
              <div className="strength-meter-fill" style={{ width: `${completeness}%` }}></div>
            </div>
            {completeness < 100 && (
              <ul className="strength-tips">
                {getStrengthTips().map((tip) => (
                  <li key={tip.label}><i className="fas fa-plus-circle"></i> {tip.label} <span className="tip-pts">+{tip.pts}%</span></li>
                ))}
              </ul>
            )}
            {savedAt && (
              <p className="autosave-note">
                <i className="fas fa-check-circle"></i> Autosaved {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>

        <ContentReview
          formData={formData}
          collapsed={collapsedSections.contentReview}
          toggleSection={() => toggleSection('contentReview')}
        />

        <JobMatch
          jobDescription={formData.jobDescription}
          formData={formData}
          collapsed={collapsedSections.jobMatch}
          toggleSection={() => toggleSection('jobMatch')}
          handleChange={handleChange}
          onAddSkill={handleAddSkill}
        />

        <ContactFields formData={formData} handleChange={handleChange} />
        
        {templateId === 1 && (
          <div className="input-group" style={{ paddingTop: '0', paddingBottom: '16px', backgroundColor: 'transparent' }}>
            <label>
              <input
                type="checkbox"
                name="addHeaderLine"
                checked={formData.addHeaderLine || false}
                onChange={handleChange}
              />
              Add Line under Contact Info
            </label>
          </div>
        )}
        
        {sectionOrder.map((section) => (
          <div
            key={section}
            className={`draggable-section ${dragOverSection === section ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, section)}
            onDrop={(e) => handleDrop(e, section)}
            onDragLeave={() => setDragOverSection(null)}
          >
            {section === 'summary' && (
              <Summary
                summary={formData.summary}
                collapsed={collapsedSections.summary}
                toggleSection={() => toggleSection('summary')}
                handleChange={handleChange}
                dragHandle={sectionHandle(section)}
              />
            )}

            {section === 'skills' && (
              <Skills
                skills={formData.skills}
                collapsed={collapsedSections.skills}
                toggleSection={() => toggleSection('skills')}
                handleChange={handleChange}
                dragHandle={sectionHandle(section)}
              />
            )}

            {section === 'experiences' && (
              <Experiences
                experiences={formData.experiences}
                collapsed={collapsedSections.experiences}
                toggleSection={() => toggleSection('experiences')}
                handleChange={handleChange}
                addEntry={addEntry}
                deleteEntry={deleteEntry}
                moveEntry={moveEntry}
                experienceHeading={experienceHeading}
                handleHeadingChange={setExperienceHeading}
                dragHandle={sectionHandle(section)}
              />
            )}

            {section === 'projects' && (
              <Projects
                projects={formData.projects}
                collapsed={collapsedSections.projects}
                toggleSection={() => toggleSection('projects')}
                handleChange={handleChange}
                addEntry={addEntry}
                deleteEntry={deleteEntry}
                moveEntry={moveEntry}
                dragHandle={sectionHandle(section)}
              />
            )}

            {section === 'education' && (
              <Education
                education={formData.education}
                collapsed={collapsedSections.education}
                toggleSection={() => toggleSection('education')}
                handleChange={handleChange}
                addEntry={addEntry}
                deleteEntry={deleteEntry}
                moveEntry={moveEntry}
                dragHandle={sectionHandle(section)}
              />
            )}

            {section === 'others' && (
              <Others
                others={formData.others}
                collapsed={collapsedSections.others}
                toggleSection={() => toggleSection('others')}
                handleChange={handleChange}
                addEntry={addEntry}
                deleteEntry={deleteEntry}
                moveEntry={moveEntry}
                dragHandle={sectionHandle(section)}
              />
            )}
          </div>
        ))}
        
        <StylingControls formData={formData} handleChange={handleChange} />
      </div>
    );
  };

  return (
    <div className="container">
      <div className="main-content">
        {renderInputPanel()}
        <div className="resizer-bar" onMouseDown={handleMouseDown}>
          <div className="resizer-knob">
            <i className="fas fa-arrows-alt-h"></i>
          </div>
        </div>
        <div className="resume-panel" ref={panelRef}>
          <div className="zoom-toolbar">
            <button className="zoom-btn" onClick={() => setZoom((z) => Math.max(50, z - 10))} title="Zoom out">
              <i className="fas fa-search-minus"></i>
            </button>
            <button className="zoom-label" onClick={() => setZoom(100)} title="Reset zoom">
              {zoom}%
            </button>
            <button className="zoom-btn" onClick={() => setZoom((z) => Math.min(150, z + 10))} title="Zoom in">
              <i className="fas fa-search-plus"></i>
            </button>
          </div>
          {pageCount > 1 ? (
            <div className="overflow-banner overflow-banner-warn">
              <i className="fas fa-triangle-exclamation"></i>
              <span className="overflow-banner-text">
                <strong>Your resume runs onto {pageCount === 2 ? 'a 2nd page' : `${pageCount} pages`}.</strong>
                <span className="overflow-banner-sub">
                  {fitFailed ? (
                    <>
                      This won't fit on one page even at the smallest readable text size, so we
                      left your size alone. Try Compact line spacing, trimming a bullet or two, or
                      keep two pages and use "Download ATS PDF" — it breaks pages between entries.
                    </>
                  ) : (
                    <>
                      Recruiters usually expect one page. Shrink it to fit, or use "Download ATS
                      PDF", which breaks pages cleanly between entries.
                    </>
                  )}
                </span>
              </span>
              {!fitFailed && (
                <button className="btn-autofit" onClick={fitToOnePage} disabled={isFitting}>
                  {isFitting ? 'Fitting…' : 'Fit to one page'}
                </button>
              )}
              {contentScale !== 1 && (
                <button className="btn-autofit-reset" onClick={resetScale}>
                  Reset to 100%
                </button>
              )}
            </div>
          ) : contentScale < 1 ? (
            <div className="overflow-banner overflow-banner-ok">
              <i className="fas fa-circle-check"></i>
              <span className="overflow-banner-text">
                <strong>Fits on one page</strong> at {Math.round(contentScale * 100)}% text size.
              </span>
              <button className="btn-autofit-reset" onClick={resetScale}>
                Reset to 100%
              </button>
            </div>
          ) : null}
          <div
            className="resume-zoom-wrapper"
            style={{
              transform: `scale(${displayScale})`,
              // Scaled from the top-left, with the box sized to match, so the
              // wrapper occupies exactly the space the sheet paints in. A
              // transform does not affect layout, so without this the panel
              // reserves the full 560px and shows a horizontal scrollbar over
              // empty space — and a centre origin would push the sheet off the
              // left edge, where it cannot be scrolled back into view.
              transformOrigin: 'top left',
              width: `${Math.round(SHEET_W * displayScale)}px`,
              height: `${Math.round((sheetHeight + 20) * displayScale)}px`,
            }}
          >
            <div
              className="resume print-target"
              ref={resumeRef}
              data-accent={formData.accentColor ? 'on' : undefined}
              style={{
                height: `${sheetHeight}px`,
                '--font-heading': formData.fontHeading || 'Arial, Helvetica, sans-serif',
                '--font-subheading': formData.fontSubheading || 'Arial, Helvetica, sans-serif',
                '--font-text': formData.fontText || 'Arial, Helvetica, sans-serif',
                '--line-height': formData.lineHeight || 1.4,
                '--content-scale': contentScale,
                '--accent': formData.accentColor || undefined,
              }}
            >
              <div className="resume-fit">
                {renderResumeContent()}
              </div>
              {pageCount > 1 && (
                <div className="page-guides" aria-hidden="true">
                  {Array.from({ length: pageCount - 1 }, (_, i) => (
                    <div
                      key={i}
                      className="page-guide"
                      style={{ top: `${(i + 1) * PAGE_H}px` }}
                      data-label={`Page ${i + 2}`}
                    />
                  ))}
                </div>
              )}
              <button className="preview-btn" onClick={togglePreview}>
                Preview
              </button>
            </div>
          </div>
          <div className="download-actions">
            <button className="download-btn download-btn-ats" onClick={handleDownloadTextPDF} title="Downloads a clean single-column PDF with selectable text — the format ATS software reads most reliably.">
              <i className="fas fa-robot"></i> Download ATS PDF
            </button>
            <button className="download-btn" onClick={handleDownloadPDF} title="Exact snapshot of the preview as an image-based PDF">
              <i className="fas fa-camera"></i> Download Print PDF
            </button>
          </div>
          <p className="ats-hint">
            <i className="fas fa-circle-info"></i> ATS PDF downloads instantly with selectable text so recruiting software can parse it. Prefer the styled layout with selectable text?{' '}
            <button type="button" className="ats-hint-link" onClick={handlePrintPDF}>
              Print / Save as PDF
            </button>{' '}
            uses your browser's print dialog.
          </p>
        </div>
      </div>

      {/* Below 1100px the panels stack, so the live sheet sits underneath the
          entire form — on a phone that is a few thousand pixels of scrolling to
          see what an edit did, and the page-count warning is down there too.
          This pulls the same sheet up over whatever you are editing. */}
      {!isPreviewOpen && (
        <button
          type="button"
          className="mobile-preview-fab"
          onClick={togglePreview}
        >
          <i className="fas fa-file-lines" aria-hidden="true"></i>
          <span>Preview</span>
          {pageCount > 1 && (
            <span className="mobile-preview-fab-pages">{pageCount} pages</span>
          )}
        </button>
      )}

      {isPreviewOpen && (
        <div className="preview-modal" onClick={togglePreview}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={togglePreview} title="Close Preview">
              <i className="fas fa-times"></i>
            </button>
            <div
              className="preview-scaler"
              style={{ height: `${Math.round(sheetHeight * previewFitScale)}px` }}
            >
              <div
                className="resume preview-resume"
                data-accent={formData.accentColor ? 'on' : undefined}
                style={{
                  transform: `scale(${previewFitScale})`,
                  height: `${sheetHeight}px`,
                  '--font-heading': formData.fontHeading || 'Arial, Helvetica, sans-serif',
                  '--font-subheading': formData.fontSubheading || 'Arial, Helvetica, sans-serif',
                  '--font-text': formData.fontText || 'Arial, Helvetica, sans-serif',
                  '--line-height': formData.lineHeight || 1.4,
                  '--content-scale': contentScale,
                  '--accent': formData.accentColor || undefined,
                }}
              >
                <div className="resume-fit">
                  {renderResumeContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
