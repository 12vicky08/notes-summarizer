# NoteDigest 📝✨

NoteDigest is a premium, client-side, AI-powered document summarizer that distills the essence of your notes, research papers, technical documents, and presentations into concise, actionable insights. 

Built with privacy as the core philosophy, **everything runs 100% in your browser**—no data ever leaves your device.

## Features

- 🌌 **"Aurora Glass" UI**: A visually stunning, modern interface featuring smooth 3D tilt tracking, magnetic buttons, and animated glassmorphism elements.
- 📄 **Universal Document Support**: Effortlessly parses multiple formats:
  - Text & Markdown (`.txt`, `.md`)
  - Web Pages (`.html`, `.htm`)
  - PDFs (`.pdf` via PDF.js)
  - Presentations (`.pptx` via JSZip)
- 🧠 **Smart NLP Synthesis**: Built upon an extraction-based TextRank algorithm with TF-IDF vectorization. 
- 📊 **Insight Extraction**: Automatically detects document domains, assesses reading complexity, and extracts key entities and concepts.
- 🔒 **Absolute Privacy**: Zero backend servers. The NLP pipeline runs entirely inside your browser's local environment.

## Technology Stack

NoteDigest is a pure frontend application relying on standard Web APIs and robust client-side libraries.

- **HTML5 / Vanilla CSS3**: Utilizing CSS Custom Properties, Backdrop Filters, and advanced 3D transforms.
- **Vanilla JavaScript (ES6+)**: Core logic and DOM manipulation without heavy frameworks.
- **Algorithms**: 
  - Tokenization & Text Normalization
  - Term Frequency-Inverse Document Frequency (TF-IDF)
  - Cosine Similarity Matrices
  - TextRank (PageRank for text)
- **Dependencies (Loaded via CDN)**:
  - [PDF.js](https://mozilla.github.io/pdf.js/): For client-side PDF parsing.
  - [JSZip](https://stuk.github.io/jszip/): For unpacking and parsing PowerPoint (PPTX/OpenXML) files.

## Local Development

Since NoteDigest uses ES Modules and Web Workers (specifically for PDF.js), it must be run over a local HTTP server. Opening `index.html` directly from the file system (`file://`) will result in CORS errors.

1. Clone the repository:
   ```bash
   git clone https://github.com/12vicky08/notes-summarizer.git
   cd notes-summarizer
   ```

2. Start a local server. You can use `npx http-server`:
   ```bash
   npx http-server . -p 8080 -c-1
   ```
   *(Alternatively, use the VS Code "Live Server" extension or Python's `python -m http.server 8080`)*

3. Open your browser and navigate to `http://localhost:8080`.

## Architecture

The application logic is broken down into modular files:
- `app.js`: Main UI orchestrator, event binder, and physics engine (for magnetic buttons and 3D tilting).
- `summarizer.js`: The core NLP engine running the mathematical TextRank algorithms.
- `analyzer.js`: Evaluates domain topology, reading complexity, and word reduction statistics.
- `file-readers.js`: Handles binary and complex file processing (PDFs & PPTX).
- `doc-parser.js`: Generic text cleaner and formatter.
- `style.css`: The complete "Aurora Glass" design system.

## Author
R Vikranth
