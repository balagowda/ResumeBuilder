import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { renderResumeTemplate, TEMPLATES, SAMPLE_DATA, formatTextToList } from './ResumeTemplates';
import Summary from './Summary';
import ContactFields from './ContactFields';
import Experiences from './Experiences';
import Education from './Education';
import Projects from './Projects';
import Skills from './Skills';
import Others from './Others';
import StylingControls from './StylingControls';
import '../Styles/TemplateWorkspace.css';

export default function TemplateWorkspace({ templateId }) {
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('resumeFormData');
    return savedData ? JSON.parse(savedData) : {
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
      addHeaderLine: false,
      showProfessionalTitle: false,
      fontHeading: 'Arial, Helvetica, sans-serif',
      fontSubheading: 'Arial, Helvetica, sans-serif',
      fontText: 'Arial, Helvetica, sans-serif',
      lineHeight: 1.4,
    };
  });
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [experienceHeading, setExperienceHeading] = useState('Experience and Internships');
  const [collapsedSections, setCollapsedSections] = useState({
    summary: true,
    experiences: true,
    education: true,
    projects: true,
    skills: true,
    others: true,
  });
  const [sectionOrder, setSectionOrder] = useState([
    'summary',
    'skills',
    'experiences',
    'projects',
    'education',
    'others',
  ]);

  const resumeRef = useRef();
  const importInputRef = useRef();
  const navigate = useNavigate();

  const [sidebarWidth, setSidebarWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [savedAt, setSavedAt] = useState(null);

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

  // Save formData to localStorage
  useEffect(() => {
    localStorage.setItem('resumeFormData', JSON.stringify(formData));
    setSavedAt(new Date());
  }, [formData]);

  // Warn on tab close only when the resume actually has content
  useEffect(() => {
    const hasContent = formData.fullName || formData.summary || formData.skills ||
      (formData.experiences && formData.experiences[0] && formData.experiences[0].title);
    if (!hasContent) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData]);

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

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetSection) => {
    e.preventDefault();
    const draggedSection = e.dataTransfer.getData('section');
    if (draggedSection === targetSection) return;
    const newOrder = [...sectionOrder];
    const draggedIndex = newOrder.indexOf(draggedSection);
    const targetIndex = newOrder.indexOf(targetSection);
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedSection);
    setSectionOrder(newOrder);
    document.querySelectorAll('.draggable-section').forEach((el) => {
      el.classList.remove('dragging');
    });
  };

  const handleDragEnd = (e) => {
    const sectionElement = e.target.closest('.draggable-section');
    if (sectionElement) {
      sectionElement.classList.remove('dragging');
    }
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
    });
  };

  const deleteEntry = (section, index) => {
    const updatedSection = formData[section].filter((_, i) => i !== index);
    setFormData({ ...formData, [section]: updatedSection });
  };
  
  const handleDownloadPDF = async () => {
    const originalElement = resumeRef.current;
    if (!originalElement) return;

    // Capture must happen at 100% zoom or coordinates come out scaled
    const prevZoom = zoom;
    if (prevZoom !== 100) {
      setZoom(100);
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    try {
      // Find the scrolling container to temporarily reset its scroll
      // This prevents html2canvas from capturing a blank or offset canvas
      const panel = originalElement.closest('.resume-panel');
      const oldScrollTop = panel ? panel.scrollTop : 0;
      const oldScrollLeft = panel ? panel.scrollLeft : 0;
      
      if (panel) {
        panel.scrollTop = 0;
        panel.scrollLeft = 0;
      }
      
      // Wait a tiny bit for the browser to register the scroll reset
      await new Promise(resolve => setTimeout(resolve, 50));

      // Capture the element precisely as it appears on screen
      const canvas = await html2canvas(originalElement, {
        scale: 3, // 3x scale guarantees retina-quality crisp text when stretched
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          // Check if classList exists and contains is a function (SVG elements can break this)
          if (element.classList && typeof element.classList.contains === 'function') {
            return element.classList.contains('preview-btn');
          }
          return false;
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // Create an A4 PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      // Safely get exact dimensions of an A4 page across different jsPDF versions
      const pdfWidth = pdf.internal.pageSize.getWidth ? pdf.internal.pageSize.getWidth() : pdf.internal.pageSize.width;
      const pdfHeight = pdf.internal.pageSize.getHeight ? pdf.internal.pageSize.getHeight() : pdf.internal.pageSize.height;

      // Force the 560x794 image to perfectly stretch and fill the A4 page
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      // --- INJECT CLICKABLE LINKS ---
      // Since html2canvas outputs a flat image, we must manually map HTML <a> tags to PDF link boxes
      const origRect = originalElement.getBoundingClientRect();
      const links = originalElement.querySelectorAll('a');
      
      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
          const rect = link.getBoundingClientRect();
          
          // Calculate relative position within the resume container
          const relX = rect.left - origRect.left;
          const relY = rect.top - origRect.top;
          
          // Mathematically scale the coordinates to match the stretched A4 PDF dimensions
          const pdfLinkX = (relX / origRect.width) * pdfWidth;
          const pdfLinkY = (relY / origRect.height) * pdfHeight;
          const pdfLinkW = (rect.width / origRect.width) * pdfWidth;
          const pdfLinkH = (rect.height / origRect.height) * pdfHeight;
          
          // Overlay an invisible clickable region on the PDF
          pdf.link(pdfLinkX, pdfLinkY, pdfLinkW, pdfLinkH, { url: href });
        }
      });

      const filename = `${formData.fullName ? formData.fullName.replace(/\s+/g, '_') : 'Resume'}.pdf`;
      pdf.save(filename);

      // Restore user's previous scroll position
      if (panel) {
        panel.scrollTop = oldScrollTop;
        panel.scrollLeft = oldScrollLeft;
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to download PDF. Error: ${error.message}`);
    } finally {
      if (prevZoom !== 100) setZoom(prevZoom);
    }
  };

  // Text-based export through the browser's print-to-PDF pipeline.
  // Unlike the image capture, the resulting PDF has selectable text that
  // ATS parsers can actually read.
  const handlePrintPDF = () => {
    window.print();
  };

  const handleSwitchTemplate = (e) => {
    navigate(`/template${e.target.value}`);
  };

  const handleLoadSample = () => {
    const hasContent = formData.fullName || formData.summary ||
      (formData.experiences && formData.experiences[0] && formData.experiences[0].title);
    if (hasContent && !window.confirm('Load sample data? This will replace your current resume content.')) {
      return;
    }
    setFormData({ ...formData, ...SAMPLE_DATA });
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.fullName ? formData.fullName.replace(/\s+/g, '_') : 'resume'}_backup.json`;
    link.click();
    URL.revokeObjectURL(url);
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
        setFormData((prev) => ({ ...prev, ...imported }));
      } catch (err) {
        alert('Could not import this file. Please choose a resume backup (.json) exported from this site.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all your resume data? This action cannot be undone.")) {
      localStorage.removeItem('resumeFormData');
      setFormData({
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
      });
    }
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
            <button className="btn-clear-data" onClick={handleClearData}>
              <i className="fas fa-trash-alt"></i> Clear Data
            </button>
          </div>
          <h2>Your Details</h2>
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

        <ContactFields formData={formData} handleChange={handleChange} />
        
        {templateId === 1 && (
          <div className="input-group" style={{ paddingTop: '0', paddingBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#1e293b', fontWeight: '500' }}>
              <input
                type="checkbox"
                name="addHeaderLine"
                checked={formData.addHeaderLine || false}
                onChange={handleChange}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
              />
              Add Line under Contact Info
            </label>
          </div>
        )}
        
        {sectionOrder.map((section) => (
          <div
            key={section}
            className="draggable-section"
            onDragOver={(e) => handleDragOver(e, section)}
            onDrop={(e) => handleDrop(e, section)}
          >
            {section === 'summary' && (
              <Summary
                summary={formData.summary}
                collapsed={collapsedSections.summary}
                toggleSection={() => toggleSection('summary')}
                handleChange={handleChange}
                dragHandle={
                  <span
                    className="drag-handle"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, section)}
                    onDragEnd={handleDragEnd}
                    title="Drag to reorder"
                  >
                    <i className="fas fa-grip-vertical"></i>
                  </span>
                }
              />
            )}

            {section === 'skills' && (
              <Skills
                skills={formData.skills}
                collapsed={collapsedSections.skills}
                toggleSection={() => toggleSection('skills')}
                handleChange={handleChange}
                dragHandle={
                  <span
                    className="drag-handle"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, section)}
                    onDragEnd={handleDragEnd}
                    title="Drag to reorder"
                  >
                    <i className="fas fa-grip-vertical"></i>
                  </span>
                }
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
                experienceHeading={experienceHeading}
                handleHeadingChange={setExperienceHeading}
                dragHandle={
                  <span
                    className="drag-handle"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, section)}
                    onDragEnd={handleDragEnd}
                    title="Drag to reorder"
                  >
                    <i className="fas fa-grip-vertical"></i>
                  </span>
                }
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
                dragHandle={
                  <span
                    className="drag-handle"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, section)}
                    onDragEnd={handleDragEnd}
                    title="Drag to reorder"
                  >
                    <i className="fas fa-grip-vertical"></i>
                  </span>
                }
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
                dragHandle={
                  <span
                    className="drag-handle"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, section)}
                    onDragEnd={handleDragEnd}
                    title="Drag to reorder"
                  >
                    <i className="fas fa-grip-vertical"></i>
                  </span>
                }
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
                dragHandle={
                  <span
                    className="drag-handle"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, section)}
                    onDragEnd={handleDragEnd}
                    title="Drag to reorder"
                  >
                    <i className="fas fa-grip-vertical"></i>
                  </span>
                }
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
        <div className="resume-panel">
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
          <div
            className="resume-zoom-wrapper"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              height: `${Math.round(814 * (zoom / 100))}px`,
            }}
          >
            <div
              className="resume print-target"
              ref={resumeRef}
              data-accent={formData.accentColor ? 'on' : undefined}
              style={{
                '--font-heading': formData.fontHeading || 'Arial, Helvetica, sans-serif',
                '--font-subheading': formData.fontSubheading || 'Arial, Helvetica, sans-serif',
                '--font-text': formData.fontText || 'Arial, Helvetica, sans-serif',
                '--line-height': formData.lineHeight || 1.4,
                '--accent': formData.accentColor || undefined,
              }}
            >
              {renderResumeContent()}
              <button className="preview-btn" onClick={togglePreview}>
                Preview
              </button>
            </div>
          </div>
          <div className="download-actions">
            <button className="download-btn download-btn-ats" onClick={handlePrintPDF} title="Opens your browser's print dialog — choose 'Save as PDF'. Text stays selectable, so ATS software can read it.">
              <i className="fas fa-robot"></i> Download ATS PDF
            </button>
            <button className="download-btn" onClick={handleDownloadPDF} title="Exact snapshot of the preview as an image-based PDF">
              <i className="fas fa-camera"></i> Download Print PDF
            </button>
          </div>
          <p className="ats-hint">
            <i className="fas fa-circle-info"></i> ATS PDF keeps text selectable so recruiting software can parse it — in the print dialog, choose "Save as PDF".
          </p>
        </div>
      </div>

      {isPreviewOpen && (
        <div className="preview-modal" onClick={togglePreview}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={togglePreview} title="Close Preview">
              <i className="fas fa-times"></i>
            </button>
            <div
              className="resume preview-resume"
              data-accent={formData.accentColor ? 'on' : undefined}
              style={{
                '--font-heading': formData.fontHeading || 'Arial, Helvetica, sans-serif',
                '--font-subheading': formData.fontSubheading || 'Arial, Helvetica, sans-serif',
                '--font-text': formData.fontText || 'Arial, Helvetica, sans-serif',
                '--line-height': formData.lineHeight || 1.4,
                '--accent': formData.accentColor || undefined,
              }}
            >
              {renderResumeContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
