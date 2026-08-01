/**
 * Plain-text extraction from uploaded resume files (PDF, DOCX, TXT).
 *
 * Split from resumeImport.js because the pdf.js worker URL needs import.meta,
 * which Jest cannot parse — the parser stays unit-testable, and this half is
 * only ever loaded in the browser. pdf.js and mammoth are dynamic imports, so
 * neither is downloaded until someone actually imports a file. The file is
 * read locally and never uploaded anywhere.
 */

const extractPdfText = async (file) => {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();

  const loadingTask = pdfjs.getDocument({ data: await file.arrayBuffer() });
  const doc = await loadingTask.promise;
  const pages = [];
  for (let p = 1; p <= doc.numPages; p += 1) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();

    // Rebuild lines from positioned glyph runs: group items sharing a
    // baseline (y), read groups top-to-bottom, items left-to-right.
    const rows = [];
    content.items.forEach((item) => {
      if (!item.str || !item.str.trim()) return;
      const y = item.transform[5];
      const x = item.transform[4];
      const row = rows.find((r) => Math.abs(r.y - y) <= 2.5);
      if (row) row.items.push({ x, str: item.str });
      else rows.push({ y, items: [{ x, str: item.str }] });
    });
    rows.sort((a, b) => b.y - a.y);
    const text = rows
      .map((row) =>
        row.items
          .sort((a, b) => a.x - b.x)
          .map((i) => i.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
      )
      .join('\n');
    pages.push(text);
  }
  await loadingTask.destroy();
  return pages.join('\n');
};

const extractDocxText = async (file) => {
  const mammoth = await import('mammoth');
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return value;
};

export const extractTextFromFile = async (file) => {
  const name = String(file.name || '').toLowerCase();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return extractPdfText(file);
  if (name.endsWith('.docx') || (file.type || '').includes('wordprocessingml')) return extractDocxText(file);
  if (name.endsWith('.txt') || (file.type || '').startsWith('text/')) return file.text();
  throw new Error('Unsupported file type — upload a PDF, DOCX, or TXT file.');
};

export default extractTextFromFile;
