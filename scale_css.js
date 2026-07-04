const fs = require('fs');
let css = fs.readFileSync('src/Styles/TemplateWorkspace.css', 'utf8');

const SCALE = 1.41785; 

let output = [];
let insideTargetBlock = false;

for (let line of css.split('\n')) {
  if (line.match(/^\.(resume|resume-content|tmpl-classic|tmpl-creative|tmpl-minimal|tmpl-tech|tmpl-academic|date-right)/)) {
    if (!line.includes('.resume-panel') && !line.includes('.resume-scale-wrapper')) {
      insideTargetBlock = true;
    }
  }

  if (insideTargetBlock) {
    // Check if line contains rem to avoid double scaling
    if (line.includes('rem')) {
      line = line.replace(/([0-9.]+)rem/g, (match, p1) => {
        let px = parseFloat(p1) * 16 * SCALE;
        return Math.round(px) + 'px';
      });
    } else if (line.includes('px')) {
      line = line.replace(/([0-9.]+)px/g, (match, p1) => {
        let num = parseFloat(p1);
        if (num === 560) return '794px';
        if (num === 794) return '1123px';
        let scaled = num * SCALE;
        return Math.round(scaled) + 'px';
      });
    }
  }

  output.push(line);

  if (line.includes('}')) {
    insideTargetBlock = false;
  }
}

fs.writeFileSync('src/Styles/TemplateWorkspace.css', output.join('\n'));
console.log('Scaling applied successfully without double scaling.');
