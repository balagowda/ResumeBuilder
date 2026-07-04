import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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

  const [sidebarWidth, setSidebarWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);

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
  }, [formData]);

  // Alert on tab close
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const confirmationMessage = 'Are you sure you want to leave? This will erase your saved data. Click "OK" to clear data, or "Cancel" to stay.';
      event.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

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
    }
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all your resume data? This action cannot be undone.")) {
      localStorage.removeItem('resumeFormData');
      setFormData({
        fullName: '',
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

  const formatTextToList = (text) => {
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

  // ==========================================
  // TEMPLATE RENDERERS
  // ==========================================

  const renderTemplate1 = () => (
    <div className="resume-content tmpl-classic">
      <div className={`resume-header ${formData.addHeaderLine ? 'with-line' : ''}`}>
        <h1>{formData.fullName || 'Your Name'}</h1>
        {formData.showProfessionalTitle && <p className="prof-title" style={{ marginTop: '2px', marginBottom: '8px', fontSize: '1.0rem', color: '#64748b', fontWeight: '500' }}>Senior Professional</p>}
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

  const renderTemplate2 = () => (
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
            {formData.showProfessionalTitle && <p className="creative-title">Senior Professional</p>}
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

  const renderTemplate3 = () => (
    <div className="resume-content tmpl-minimal">
      <div className="minimal-header">
        <h1>{formData.fullName || 'Your Name'}</h1>
        {formData.showProfessionalTitle && <p className="prof-title" style={{ marginTop: '2px', marginBottom: '4px', fontSize: '1.0rem', color: '#475569', fontWeight: '500' }}>Senior Professional</p>}
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

  const renderTemplate4 = () => (
    <div className="resume-content tmpl-tech">
      <div className="tech-header-band">
        <h1>{formData.fullName || 'Your Name'}</h1>
        {formData.showProfessionalTitle && <p className="prof-title" style={{ marginTop: '2px', marginBottom: '8px', fontSize: '1.0rem', color: '#cbd5e1', fontWeight: '500' }}>Senior Professional</p>}
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

  const renderTemplate5 = () => (
    <div className="resume-content tmpl-academic">
      <div className="academic-header">
        <div className="academic-header-left">
          <h1>{formData.fullName || 'YOUR NAME'}</h1>
          {formData.showProfessionalTitle && <p className="academic-prof-title">Senior Professional</p>}
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

  // Renders the correct layout HTML based on templateId
  const renderResumeContent = () => {
    switch (templateId) {
      case 1:
        return renderTemplate1();
      case 2:
        return renderTemplate2();
      case 3:
        return renderTemplate3();
      case 4:
        return renderTemplate4();
      case 5:
        return renderTemplate5();
      default:
        return renderTemplate1();
    }
  };

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
          <div className="strength-meter-container">
            <div className="strength-meter-header">
              <span>Resume Strength</span>
              <span>{completeness}%</span>
            </div>
            <div className="strength-meter-bar">
              <div className="strength-meter-fill" style={{ width: `${completeness}%` }}></div>
            </div>
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
          <div 
            className="resume" 
            ref={resumeRef}
            style={{
              '--font-heading': formData.fontHeading || 'Arial, Helvetica, sans-serif',
              '--font-subheading': formData.fontSubheading || 'Arial, Helvetica, sans-serif',
              '--font-text': formData.fontText || 'Arial, Helvetica, sans-serif',
              '--line-height': formData.lineHeight || 1.4,
            }}
          >
            {renderResumeContent()}
            <button className="preview-btn" onClick={togglePreview}>
              Preview
            </button>
          </div>
          <button className="download-btn" onClick={handleDownloadPDF}>
            Download as PDF
          </button>
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
              style={{
                '--font-heading': formData.fontHeading || 'Arial, Helvetica, sans-serif',
                '--font-subheading': formData.fontSubheading || 'Arial, Helvetica, sans-serif',
                '--font-text': formData.fontText || 'Arial, Helvetica, sans-serif',
                '--line-height': formData.lineHeight || 1.4,
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
