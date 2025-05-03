import '../Styles/Template1.css';
import { useState, useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import Summary from './Summary';
import ContactFields from './ContactFields';
import Experiences from './Experiences';
import Education from './Education';
import Projects from './Projects';
import Skills from './Skills';
import Others from './Others';

export default function Template1() {
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

  // Save formData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('resumeFormData', JSON.stringify(formData));
  }, [formData]);

  // Handle browser close/back/tab close with confirmation
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const confirmationMessage = 'Are you sure you want to leave? This will erase your saved data. Click "OK" to clear data, or "Cancel" to stay.';
      event.returnValue = confirmationMessage;
      if (window.confirm(confirmationMessage)) {
        localStorage.removeItem('resumeFormData');
      }
      return confirmationMessage;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Drag-and-Drop Handlers
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
    const element = resumeRef.current;
    if (element) {
      const clonedElement = element.cloneNode(true);
  
      // Core A4 size setup (595x842 pt)
      clonedElement.style.width = '595pt';
      clonedElement.style.minHeight = '842pt';
      clonedElement.style.maxHeight = '842pt';
      clonedElement.style.overflow = 'hidden';
      clonedElement.style.padding = '30pt';
      clonedElement.style.background = 'white';
      clonedElement.style.fontFamily = "'Inter', sans-serif";
      clonedElement.style.color = '#333';
      clonedElement.style.boxSizing = 'border-box';
      clonedElement.style.display = 'block';
  
      // Prevent page breaks
      clonedElement.querySelectorAll('.resume-container, .resume-section').forEach(node => {
        node.style.pageBreakInside = 'avoid';
        node.style.breakInside = 'avoid';
        node.style.boxSizing = 'border-box';
      });
  
      // Flex layout
      clonedElement.querySelectorAll('.resume-container').forEach(node => {
        node.style.display = 'flex';
        node.style.flexDirection = 'row';
        node.style.width = '100%';
        node.style.height = 'auto'; // Allow height to adjust
      });
  
      clonedElement.querySelectorAll('.left-column').forEach(node => {
        node.style.flexBasis = '30%';
        node.style.paddingRight = '16pt';
        node.style.boxSizing = 'border-box';
        node.style.height = 'auto'; // Allow dynamic height
        node.style.overflow = 'hidden';
      });
  
      clonedElement.querySelectorAll('.right-column').forEach(node => {
        node.style.flexBasis = '70%';
        node.style.paddingLeft = '16pt';
        node.style.boxSizing = 'border-box';
        node.style.height = 'auto'; // Allow dynamic height
        node.style.overflow = 'hidden';
      });
  
      // Headings
      clonedElement.querySelectorAll('.resume-header h1').forEach(node => {
        node.style.fontSize = '22pt';
        node.style.marginBottom = '10pt';
      });
  
      // Contact info
      clonedElement.querySelectorAll('.contact-info').forEach(node => {
        node.style.fontSize = '9pt';
        node.style.marginTop = '6pt';
        node.style.marginBottom = '10pt';
      });
      clonedElement.querySelectorAll('.contact-info span').forEach(node => {
        node.style.marginRight = '6pt';
      });
  
      // Section headers
      clonedElement.querySelectorAll('.resume-section h3').forEach(node => {
        node.style.fontSize = '14pt';
        node.style.marginBottom = '8pt';
        node.style.paddingBottom = '4pt';
        node.style.borderBottom = '1pt solid #e6f0fa';
      });
  
      // Paragraphs
      clonedElement.querySelectorAll('.resume-section p, .resume-section div p').forEach(node => {
        node.style.fontSize = '11pt';
        node.style.lineHeight = '1.5';
        node.style.marginBottom = '6pt';
      });
  
      clonedElement.querySelectorAll('.resume-section p strong').forEach(node => {
        node.style.fontSize = '11pt';
      });
  
      // Lists
      clonedElement.querySelectorAll('.resume-section ul').forEach(node => {
        node.style.paddingLeft = '16pt';
        node.style.marginBottom = '6pt';
      });
      clonedElement.querySelectorAll('.resume-section ul li').forEach(node => {
        node.style.fontSize = '11pt';
        node.style.lineHeight = '1.5';
        node.style.marginBottom = '4pt';
      });
  
      // Dates
      clonedElement.querySelectorAll('.date-right').forEach(node => {
        node.style.float = ''; // Remove float
        node.style.display = 'block';
        node.style.textAlign = 'right';
        node.style.width = 'auto';
        node.style.fontSize = '9pt';
        node.style.color = '#666';
        node.style.marginTop = '-15pt'; // Adjust positioning
      });
  
      // Entry spacing
      clonedElement.querySelectorAll('.education-entry, .experience-entry, .project-entry').forEach(node => {
        node.style.marginBottom = '10pt';
      });
  
      // Generate PDF without setTimeout
      html2pdf()
        .from(clonedElement)
        .set({
          margin: 0,
          filename: `${formData.fullName || 'resume'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 3,
            useCORS: true,
            windowWidth: 595, // Match A4 width
          },
          jsPDF: {
            unit: 'pt',
            format: 'a4',
            orientation: 'portrait',
            putOnlyUsedFonts: true,
          },
        })
        .save()
        .then(() => {
          console.log('PDF downloaded successfully');
        })
        .catch((error) => {
          console.error('Error downloading PDF:', error);
        });
    }
  };

  const togglePreview = () => {
    setIsPreviewOpen(!isPreviewOpen);
  };

  const formatTextToList = (text) => {
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

  const handleHeadingChange = (newHeading) => {
    setExperienceHeading(newHeading);
  };

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderResumeContent = () => (
    <div className="resume-content" ref={resumeRef}>
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
              <p>{formData.skills}</p>
            </div>
          );
        }
        if (section === 'experiences' && formData.experiences.length > 0) {
          return (
            <div key={section} className="resume-section">
              <h3>{experienceHeading}</h3>
              {formData.experiences.map((exp, index) => (
                exp.title && (
                  <div key={index} className="experience-entry">
                    <p><strong>{exp.title}</strong> | {exp.company} <span className="date-right">{exp.dates}</span></p>
                    {formatTextToList(exp.description)}
                  </div>
                )
              ))}
            </div>
          );
        }
        if (section === 'projects' && formData.projects.length > 0) {
          return (
            <div key={section} className="resume-section">
              <h3>Projects</h3>
              {formData.projects.map((proj, index) => (
                proj.title && (
                  <div key={index} className="project-entry">
                    <p><strong>{proj.title}</strong> <span className="date-right">{proj.dates}</span></p>
                    {formatTextToList(proj.description)}
                  </div>
                )
              ))}
            </div>
          );
        }
        if (section === 'education' && formData.education.length > 0) {
          return (
            <div key={section} className="resume-section">
              <h3>Education</h3>
              {formData.education.map((edu, index) => (
                edu.studyTitle && (
                  <div key={index} className="education-entry">
                    <p><strong>{edu.studyTitle}</strong> <span className="date-right">{edu.date}</span></p>
                    <p>{edu.school} | {edu.score}</p>
                  </div>
                )
              ))}
            </div>
          );
        }
        if (section === 'others' && formData.others.length > 0) {
          return (
            <div key={section} className="resume-section">
              <h3>Others</h3>
              {formData.others.map((other, index) => (
                other.title && (
                  <div key={index}>
                    <p><strong>{other.title}</strong></p>
                    {formatTextToList(other.description)}
                  </div>
                )
              ))}
            </div>
          );
        }
        return null;
      })}
    </div>
  );

  const renderInputPanel = () => (
    <div className="input-panel">
      <h2>Your Details</h2>
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
                >
                  <i className="fa-solid fa-arrows-to-dot"></i>
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
              handleHeadingChange={handleHeadingChange}
              dragHandle={
                <span
                  className="drag-handle"
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, section)}
                  onDragEnd={handleDragEnd}
                >
                  <i className="fa-solid fa-arrows-to-dot"></i>
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
                >
                  <i className="fa-solid fa-arrows-to-dot"></i>
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
                >
                  <i className="fa-solid fa-arrows-to-dot"></i>
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
                >
                  <i className="fa-solid fa-arrows-to-dot"></i>
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
                >
                  <i className="fa-solid fa-arrows-to-dot"></i>
                </span>
              }
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="container">
      <div className="main-content">
        {renderInputPanel()}
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
        <div className="preview-modal">
          <div className="preview-content">
            <button className="close-btn" onClick={togglePreview}>
              ×
            </button>
            <div className="resume preview-resume">{renderResumeContent()}</div>
          </div>
        </div>
      )}
    </div>
  );
}