import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import Summary from './Summary';
import ContactFields from './ContactFields';
import Experiences from './Experiences';
import Education from './Education';
import Projects from './Projects';
import Skills from './Skills';
import Others from './Others';
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
    const { name, value } = e.target;
    if (index !== null) {
      const updatedSection = [...formData[section]];
      updatedSection[index] = { ...updatedSection[index], [name]: value };
      setFormData({ ...formData, [section]: updatedSection });
    } else {
      setFormData({ ...formData, [name]: value });
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
  
  const handleDownloadPDF = () => {
    // Native browser printing is far superior for resumes because:
    // 1. It creates PDFs with real, selectable text (crucial for ATS tracking systems)
    // 2. It avoids library crashes and silent failures on different browsers
    // 3. It generates perfectly crisp vector outputs instead of blurry raster images
    window.print();
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

  // Render Template 1 (Classic Corporate)
  const renderTemplate1 = () => (
    <div className="resume-content tmpl-classic" ref={resumeRef}>
      <div className="resume-header">
        <h1>{formData.fullName || 'Your Name'}</h1>
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

  // Render Template 2 (Slate Sidebar Creative)
  const renderTemplate2 = () => (
    <div className="resume-content tmpl-creative" ref={resumeRef}>
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
            <p className="creative-title">Senior Professional</p>
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

  // Render Template 3 (Minimalist Stark)
  const renderTemplate3 = () => (
    <div className="resume-content tmpl-minimal" ref={resumeRef}>
      <div className="minimal-header">
        <h1>{formData.fullName || 'Your Name'}</h1>
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
              <div className="sec-label">Profile</div>
              <div className="sec-body">{formatTextToList(formData.summary)}</div>
            </div>
          );
        }
        if (section === 'skills' && formData.skills) {
          return (
            <div key={section} className="minimal-section">
              <div className="sec-label">Skills</div>
              <div className="sec-body font-medium">{formData.skills}</div>
            </div>
          );
        }
        if (section === 'experiences' && formData.experiences.length > 0 && formData.experiences[0].title) {
          return (
            <div key={section} className="minimal-section">
              <div className="sec-label">Experience</div>
              <div className="sec-body">
                {formData.experiences.map((exp, idx) => exp.title && (
                  <div key={idx} className="minimal-entry">
                    <p className="entry-header">
                      <strong>{exp.title}</strong>
                      <span className="entry-sub">{exp.company} &mdash; {exp.dates}</span>
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
            <div key={section} className="minimal-section">
              <div className="sec-label">Projects</div>
              <div className="sec-body">
                {formData.projects.map((proj, idx) => proj.title && (
                  <div key={idx} className="minimal-entry">
                    <p className="entry-header">
                      <strong>{proj.title}</strong>
                      <span className="entry-sub">{proj.dates}</span>
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
            <div key={section} className="minimal-section">
              <div className="sec-label">Education</div>
              <div className="sec-body">
                {formData.education.map((edu, idx) => edu.studyTitle && (
                  <div key={idx} className="minimal-entry">
                    <p className="entry-header">
                      <strong>{edu.studyTitle}</strong>
                      <span className="entry-sub">{edu.school} &mdash; {edu.date}</span>
                    </p>
                    {edu.score && <p className="edu-score-line">GPA/Result: {edu.score}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'others' && formData.others.length > 0 && formData.others[0].title) {
          return (
            <div key={section} className="minimal-section">
              <div className="sec-label">Others</div>
              <div className="sec-body">
                {formData.others.map((oth, idx) => oth.title && (
                  <div key={idx} className="minimal-entry">
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

  // Render Template 4 (Bold Tech Header-band)
  const renderTemplate4 = () => (
    <div className="resume-content tmpl-tech" ref={resumeRef}>
      <div className="tech-header-band">
        <h1>{formData.fullName || 'Your Name'}</h1>
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

  // Render Template 5 (Elegant Academic)
  const renderTemplate5 = () => (
    <div className="resume-content tmpl-academic" ref={resumeRef}>
      <div className="academic-header">
        <div className="academic-header-left">
          <h1>{formData.fullName || 'Your Name'}</h1>
          <p className="academic-subtitle">Curriculum Vitae</p>
        </div>
        <div className="academic-header-right">
          {formData.mail && <p>email: {formData.mail}</p>}
          {formData.mobile && <p>phone: {formData.mobile}</p>}
          {formData.linkedin && <p>linkedin.com/in/{formData.fullName ? formData.fullName.toLowerCase().replace(/\s+/g, '') : 'linkedin'}</p>}
          {formData.github && <p>github: {formData.github.replace(/https?:\/\/(www\.)?github\.com\//, '')}</p>}
        </div>
      </div>
      
      {sectionOrder.map((section) => {
        if (section === 'summary' && formData.summary) {
          return (
            <div key={section} className="academic-section">
              <div className="academic-sec-title"><h3>Research Profile</h3></div>
              <div className="academic-sec-content">{formatTextToList(formData.summary)}</div>
            </div>
          );
        }
        if (section === 'skills' && formData.skills) {
          return (
            <div key={section} className="academic-section">
              <div className="academic-sec-title"><h3>Technical Skills</h3></div>
              <div className="academic-sec-content font-medium">{formData.skills}</div>
            </div>
          );
        }
        if (section === 'experiences' && formData.experiences.length > 0 && formData.experiences[0].title) {
          return (
            <div key={section} className="academic-section">
              <div className="academic-sec-title"><h3>Professional Appointments</h3></div>
              <div className="academic-sec-content">
                {formData.experiences.map((exp, idx) => exp.title && (
                  <div key={idx} className="academic-entry">
                    <p className="entry-header">
                      <strong>{exp.title}</strong> &mdash; <span>{exp.company}</span>
                      <span className="academic-date">{exp.dates}</span>
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
              <div className="academic-sec-title"><h3>Selected Projects</h3></div>
              <div className="academic-sec-content">
                {formData.projects.map((proj, idx) => proj.title && (
                  <div key={idx} className="academic-entry">
                    <p className="entry-header">
                      <strong>{proj.title}</strong>
                      <span className="academic-date">{proj.dates}</span>
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
              <div className="academic-sec-title"><h3>Education</h3></div>
              <div className="academic-sec-content">
                {formData.education.map((edu, idx) => edu.studyTitle && (
                  <div key={idx} className="academic-entry">
                    <p className="entry-header">
                      <strong>{edu.studyTitle}</strong>
                      <span className="academic-date">{edu.date}</span>
                    </p>
                    <p className="academic-sub">{edu.school} {edu.score && `| Score: ${edu.score}`}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'others' && formData.others.length > 0 && formData.others[0].title) {
          return (
            <div key={section} className="academic-section">
              <div className="academic-sec-title"><h3>Grants & Awards</h3></div>
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
          <Link to="/templates" className="btn-back-templates">
            <i className="fas fa-arrow-left"></i> Back to Templates
          </Link>
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
          <div className="resume">
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
            <div className="resume preview-resume">{renderResumeContent()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
