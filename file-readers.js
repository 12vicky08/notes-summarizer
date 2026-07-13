/**
 * file-readers.js
 * ─────────────────────────────────────────────
 * Client-side file reading module for NoteDigest.
 * Handles reading text, markdown, HTML, and other plain text formats.
 */

const FileReaders = (() => {

  /**
   * Main entry point to read a file.
   * Dispatches to specific readers based on file extension.
   * @param {File} file
   * @returns {Promise<{text: string, filename: string, type: string}>}
   */
  async function readFile(file) {
    if (!file) throw new Error("No file provided.");

    const filename = file.name;
    const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();

    const plainTextExtensions = ['.txt', '.md', '.html', '.htm', '.rtf', '.csv', '.json'];

    if (plainTextExtensions.includes(ext)) {
      return await readAsText(file);
    } else if (ext === '.pdf') {
      return await readAsPDF(file);
    } else if (['.pptx', '.ppt'].includes(ext)) {
      return await readAsPPTX(file);
    } else {
      throw new Error(`Unsupported file type: ${ext}. Supported formats include text, HTML, PDF, and PPTX.`);
    }
  }

  /**
   * Reads a File as plain text using FileReader.
   * @param {File} file
   */
  function readAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          text: e.target.result,
          filename: file.name,
          type: 'text'
        });
      };
      reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
      reader.readAsText(file);
    });
  }

  /**
   * Reads a PDF file using PDF.js
   * @param {File} file
   */
  async function readAsPDF(file) {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error("PDF.js library is not loaded.");
    }

    // Set worker source if not already set
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;

    let fullText = '';
    const numPages = pdfDocument.numPages;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map(item => item.str);
      fullText += pageStrings.join(' ') + '\n\n';
    }

    return {
      text: fullText,
      filename: file.name,
      type: 'pdf'
    };
  }

  /**
   * Reads a PPTX file using JSZip
   * @param {File} file
   */
  async function readAsPPTX(file) {
    if (typeof JSZip === 'undefined') {
      throw new Error("JSZip library is not loaded.");
    }

    const zip = new JSZip();
    const arrayBuffer = await file.arrayBuffer();

    try {
      const contents = await zip.loadAsync(arrayBuffer);
      let fullText = '';

      const slideFiles = Object.keys(contents.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));

      // Sort to keep slides in order
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)[1]);
        const numB = parseInt(b.match(/slide(\d+)\.xml/)[1]);
        return numA - numB;
      });

      for (const slideFile of slideFiles) {
        const xml = await contents.files[slideFile].async('text');

        // Very basic XML tag stripping for text extraction
        // PPTX stores text in <a:t> elements mostly
        const textMatches = xml.match(/<a:t>.*?<\/a:t>/g) || [];
        const slideText = textMatches.map(tag => tag.replace(/<\/?a:t>/g, '')).join(' ');

        if (slideText) {
          fullText += slideText + '\n\n';
        }
      }

      return {
        text: fullText,
        filename: file.name,
        type: 'pptx'
      };

    } catch (err) {
      throw new Error("Error parsing PPTX file: " + err.message);
    }
  }

  return {
    readFile
  };

})();
