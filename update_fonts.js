const fs = require('fs');

let css = fs.readFileSync('src/Styles/TemplateWorkspace.css', 'utf8');

// Remove hardcoded font-family from tmpl-*
css = css.replace(/font-family: [^;]+;\n/g, '');

// Inject CSS variables into .resume-content
const newRules = `
.resume-content {
  width: 100%;
  height: 100%;
  color: #334155;
  font-size: 21px;
  line-height: var(--line-height, 1.4);
  font-family: var(--font-text, 'Inter', sans-serif);
}

.resume-content h1, .resume-content h2, .tmpl-creative .creative-header h1, .tmpl-classic .resume-header h1, .tmpl-minimal .minimal-header h1, .tmpl-tech .tech-header-band h1, .tmpl-academic .academic-header h1 {
  margin: 0;
  color: #0f172a;
  font-family: var(--font-heading, 'Inter', sans-serif);
}

.resume-content h3, .resume-content h4, .resume-content .entry-header, .resume-content .sec-label, .resume-content .contact-info, .resume-content .sidebar-section h4 {
  font-family: var(--font-subheading, 'Inter', sans-serif);
}
`;

// Replace existing .resume-content and its h1, h2, h3, h4 with the new rules
css = css.replace(/\.resume-content \{[\s\S]*?\}\s*\.resume-content h1, \.resume-content h2, \.resume-content h3, \.resume-content h4 \{[\s\S]*?\}/, newRules.trim());

fs.writeFileSync('src/Styles/TemplateWorkspace.css', css);
console.log('CSS Updated');
