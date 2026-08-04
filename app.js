/**
 * app.js — Main application logic for NoteDigest.
 * Handles UI orchestration, events, history, and theme.
 */
(() => {
  'use strict';

  // ── DOM References ──────────────────────────
  const $ = id => document.getElementById(id);
  const documentInput      = $('document-input');
  const summarizeBtn    = $('summarize-btn');
  const uploadBtn       = $('upload-btn');
  const clearBtn        = $('clear-btn');
  const fileInput       = $('file-input');
  const dropZone        = $('drop-zone');
  const summaryLength   = $('summary-length');
  const lengthLabel     = $('length-label');
  const inputSection    = $('input-section');
  const loadingSection  = $('loading-section');
  const resultsSection  = $('results-section');
  const loadingStep     = $('loading-step');
  const summaryContent  = $('summary-content');
  const copySummaryBtn  = $('copy-summary');
  const downloadSummaryBtn = $('download-summary');
  const newDocumentBtn     = $('new-document-btn');
  const themeToggle     = $('theme-toggle');
  const historyToggle   = $('history-toggle');
  const historyPanel    = $('history-panel');
  const historyOverlay  = $('history-overlay');
  const historyClose    = $('history-close');
  const historyList     = $('history-list');
  const clearHistory    = $('clear-history');
  const toast           = $('toast');
  const toastMessage    = $('toast-message');
  const navbar          = $('navbar');
  const charCount       = $('char-count');
  const wordCount       = $('word-count');

  // ── Sample Documents ───────────────────────
  const SAMPLES = {
    lecture: `Title: Introduction to Data Structures - Lecture 5: Trees and Binary Search Trees

A tree is a hierarchical data structure consisting of nodes connected by edges. Unlike linear data structures such as arrays and linked lists, trees represent data in a hierarchical manner with a root node at the top and child nodes branching downward.

The most fundamental tree concepts include the root (the topmost node), parent and child relationships, leaves (nodes with no children), and the height of the tree (the longest path from root to a leaf). Trees are used extensively in computer science for representing hierarchical relationships.

A Binary Tree is a specialized tree where each node has at most two children, referred to as the left child and right child. Binary trees form the basis for more specialized structures like Binary Search Trees (BSTs), AVL trees, and heaps.

A Binary Search Tree maintains a specific ordering property: for every node, all values in its left subtree are less than the node's value, and all values in its right subtree are greater. This property enables efficient searching, insertion, and deletion operations.

The time complexity of BST operations depends on the height of the tree. In the best case (balanced tree), operations take O(log n) time. However, in the worst case (completely skewed tree), operations degrade to O(n), essentially becoming a linked list.

To prevent this worst-case scenario, self-balancing BSTs were developed. AVL trees maintain balance by ensuring the height difference between left and right subtrees of any node is at most 1. Red-Black trees use color-based rules to maintain approximate balance with less rigid balancing requirements.

Tree traversal algorithms are essential for processing tree data. In-order traversal visits left subtree, root, then right subtree — producing sorted output for BSTs. Pre-order traversal visits root first, then left and right subtrees — useful for creating copies. Post-order traversal visits left and right subtrees before the root — useful for deletion. Level-order traversal uses a queue to visit nodes level by level.

Key takeaways: Trees provide O(log n) average-case operations when balanced. BSTs are fundamental to databases, file systems, and expression parsing. Understanding tree balancing is crucial for interview preparation and real-world system design.`,

    article: `The Rise of Artificial Intelligence in Healthcare: Transforming Diagnosis and Treatment

Artificial intelligence is rapidly reshaping the healthcare landscape, offering unprecedented opportunities to improve patient outcomes, reduce costs, and accelerate medical research. From diagnostic imaging to drug discovery, AI applications are moving from experimental labs to clinical practice at an accelerating pace.

One of the most promising areas is medical imaging analysis. Deep learning algorithms can now detect certain cancers, eye diseases, and cardiovascular conditions with accuracy matching or exceeding that of experienced radiologists. For example, Google Health developed an AI system that can detect breast cancer in mammograms with greater accuracy than human readers, reducing both false positives and false negatives.

Drug discovery represents another transformative application. Traditional drug development typically takes 10-15 years and costs billions of dollars, with a high failure rate. AI can dramatically accelerate this process by predicting molecular interactions, identifying promising drug candidates, and optimizing clinical trial designs. Companies like DeepMind have demonstrated AI's ability to predict protein structures with remarkable accuracy, opening new avenues for understanding diseases and developing treatments.

Natural language processing is being applied to electronic health records to extract insights from unstructured clinical notes. These systems can identify patterns that might be missed by human reviewers, flag potential drug interactions, and support clinical decision-making. Predictive analytics models can anticipate patient deterioration, readmission risks, and disease progression.

However, the integration of AI in healthcare faces significant challenges. Data privacy and security concerns are paramount, as medical data is highly sensitive. Algorithmic bias is another critical issue — AI systems trained on non-representative datasets may perform poorly for certain patient populations, potentially exacerbating health disparities.

Regulatory frameworks are still evolving to keep pace with AI innovation. The FDA has approved numerous AI-based medical devices, but questions remain about how to evaluate AI systems that continuously learn and update their algorithms. Transparency and explainability of AI decisions are essential for building trust among healthcare professionals and patients.

Despite these challenges, the trajectory is clear: AI will become an integral part of healthcare delivery. The key is ensuring that its deployment is equitable, transparent, and centered on improving patient care.`,

    technical: `Understanding RESTful API Design: Best Practices and Common Patterns

REST (Representational State Transfer) is an architectural style for designing networked applications. RESTful APIs have become the standard for web service communication, providing a stateless, scalable approach to building distributed systems.

The fundamental principles of REST include client-server separation, statelessness, cacheability, uniform interface, and layered system architecture. Each of these constraints contributes to creating scalable, maintainable, and performant APIs.

Resource naming is critical in REST API design. Resources should be represented as nouns, not verbs. Use plural nouns for collections (e.g., /users, /products) and hierarchical URLs for relationships (e.g., /users/123/orders). Avoid deeply nested URLs beyond two levels of nesting to maintain clarity.

HTTP methods should be used semantically: GET for retrieval (safe, idempotent), POST for creation, PUT for full updates (idempotent), PATCH for partial updates, and DELETE for removal (idempotent). Understanding idempotency is crucial — repeating an idempotent operation produces the same result.

Proper HTTP status codes communicate the result of operations clearly. Use 200 for success, 201 for created, 204 for no content, 400 for bad requests, 401 for unauthorized, 403 for forbidden, 404 for not found, and 500 for server errors. Avoid returning 200 with error messages in the body.

Pagination is essential for endpoints returning collections. Common approaches include offset-based pagination (using limit and offset parameters), cursor-based pagination (more efficient for large datasets), and keyset pagination. Always include pagination metadata in responses.

API versioning strategies include URL path versioning (/v1/users), query parameter versioning, custom header versioning, and content negotiation. URL path versioning is the most common and straightforward approach.

Authentication and authorization should use industry-standard protocols. OAuth 2.0 with JWT tokens is the most widely adopted approach. Always use HTTPS, implement rate limiting, and validate all input to prevent security vulnerabilities.

Error responses should be consistent and informative. Include an error code, human-readable message, and optionally a detailed description or link to documentation. Use a consistent error response format across all endpoints.`
  };

  // ── State ───────────────────────────────────
  let currentSummary = null;

  // ── Initialization ──────────────────────────
  function init() {
    registerServiceWorker();
    loadTheme();
    bindEvents();
    bindAdvancedUI();
    updateSummarizeBtn();
    renderHistory();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(
          (registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          }
        ).catch(
          (err) => {
            console.log('ServiceWorker registration failed: ', err);
          }
        );
      });
    }
  }

  // ── Theme ───────────────────────────────────
  function loadTheme() {
    const saved = localStorage.getItem('notedigest-theme') || 'dark';
    document.body.setAttribute('data-theme', saved);
  }
  function toggleTheme() {
    const current = document.body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('notedigest-theme', next);
  }

  // ── Event Binding ───────────────────────────
  function bindEvents() {
    // Input
    documentInput.addEventListener('input', (e) => {
      updateSummarizeBtn();
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    });
    summarizeBtn.addEventListener('click', handleSummarize);
    uploadBtn.addEventListener('click', () => fileInput.click());
    clearBtn.addEventListener('click', () => {
      documentInput.value = '';
      fileInput.value = '';
      updateSummarizeBtn();
      documentInput.focus();
    });
    fileInput.addEventListener('change', handleFileUpload);

    // Summary length slider
    summaryLength.addEventListener('input', () => {
      lengthLabel.textContent = `${summaryLength.value} Sentences`;
    });

    // Keyboard shortcut: Ctrl+Enter to summarize
    documentInput.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!summarizeBtn.disabled) handleSummarize();
      }
    });

    // Drag & Drop
    const wrapper = document.querySelector('.textarea-wrapper');
    ['dragenter', 'dragover'].forEach(evt => {
      wrapper.addEventListener(evt, (e) => {
        e.preventDefault();
        dropZone.classList.add('active');
      });
    });
    ['dragleave', 'drop'].forEach(evt => {
      wrapper.addEventListener(evt, (e) => {
        e.preventDefault();
        dropZone.classList.remove('active');
      });
    });
    wrapper.addEventListener('drop', handleDrop);

    // Samples
    document.querySelectorAll('.sample-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.sample;
        if (SAMPLES[key]) {
          documentInput.value = SAMPLES[key];
          updateSummarizeBtn();
          documentInput.focus();
          showToast('Sample document loaded!');
        }
      });
    });

    // Copy
    copySummaryBtn.addEventListener('click', handleCopy);
    if (downloadSummaryBtn) downloadSummaryBtn.addEventListener('click', handleDownload);

    // New document
    newDocumentBtn.addEventListener('click', resetToInput);

    // Theme
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // History
    historyToggle.addEventListener('click', openHistory);
    historyClose.addEventListener('click', closeHistory);
    historyOverlay.addEventListener('click', closeHistory);
    clearHistory.addEventListener('click', handleClearHistory);

    // Navbar scroll
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // ── Advanced UI Interactions ────────────────
  function bindAdvancedUI() {
    // 3D Tilt Effect
    document.querySelectorAll('.tilt-card').forEach(wrapper => {
      const card = wrapper.querySelector('.glass-panel');
      if (!card) return;
      
      wrapper.addEventListener('mousemove', e => {
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.transition = 'none';
      });
      
      wrapper.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
      });
    });

    // Magnetic Buttons
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = `translate(0px, 0px)`;
      });
    });
  }

  // ── Summarize ───────────────────────────────
  function updateSummarizeBtn() {
    const rawText = documentInput.value;
    const textLength = rawText.trim().length;
    const hasText = textLength > 50;
    summarizeBtn.disabled = !hasText;
    clearBtn.disabled = textLength === 0;

    // Update word and character counts
    if (charCount && wordCount) {
      charCount.textContent = rawText.length;
      const words = rawText.trim().split(/\s+/).filter(w => w.length > 0);
      wordCount.textContent = words.length;
    }
  }

  async function handleSummarize() {
    const raw = documentInput.value.trim();
    if (raw.length < 50) return;

    // Show loading
    showSection('loading');
    const steps = [
      'Parsing document content',
      'Extracting key sentences',
      'Computing TF-IDF vectors',
      'Building similarity matrix',
      'Running TextRank algorithm',
      'Detecting key terms',
      'Assessing complexity',
      'Generating summary'
    ];

    // Animate loading steps
    const stepPromise = animateSteps(steps, 200);

    try {
      // Run NLP pipeline
      const parsed = DocParser.parse(raw);
      const bodyText = parsed.body || raw;
      const numSentences = parseInt(summaryLength.value, 10);
      const summaryResult = Summarizer.summarize(bodyText, numSentences);
      const analysis = Analyzer.analyze(bodyText, summaryResult);

      // Wait for animation to finish (min visual time)
      await stepPromise;

      // Store result
      currentSummary = { parsed, summaryResult, analysis, timestamp: Date.now() };

      // Render results
      renderResults(currentSummary);

      // Save to history
      saveToHistory(currentSummary);

      // Show results
      showSection('results');
    } catch (err) {
      console.error('Error in summarization pipeline:', err);
      showToast('Error synthesizing document.');
      showSection('input');
    }
  }

  async function animateSteps(steps, delay) {
    for (const step of steps) {
      loadingStep.textContent = step;
      await sleep(delay);
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ── Render Results ──────────────────────────
  function renderResults({ summaryResult, analysis }) {
    // Summary text
    summaryContent.innerHTML = summaryResult.summary
      .split('. ')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => `<p>${s.endsWith('.') ? s : s + '.'}</p>`)
      .join('');

    // Stats
    $('stat-original-words').textContent = analysis.stats.originalWords;
    $('stat-summary-words').textContent = analysis.stats.summaryWords;
    $('stat-reduction').textContent = `${analysis.stats.reductionPercent}%`;
    const timeSaved = Math.max(0, analysis.stats.originalReadTime - analysis.stats.summaryReadTime);
    $('stat-read-time').textContent = `${timeSaved}min`;

    // Topics
    const topicBadge = $('domain-badge');
    topicBadge.textContent = analysis.topics.join(', ');
    topicBadge.style.color = 'hsl(210, 70%, 60%)';

    // Complexity
    const compBadge = $('priority-badge');
    compBadge.textContent = `${analysis.complexity.level} ${analysis.complexity.icon}`;
    compBadge.style.color = analysis.complexity.color;

    // Key Terms
    const termsList = $('action-items');
    if (!analysis.keyTerms || analysis.keyTerms.length === 0) {
      termsList.innerHTML = '<li class="no-items">No key terms detected</li>';
    } else {
      termsList.innerHTML = analysis.keyTerms
        .map((item, i) => `<li style="animation-delay: ${i * 0.05}s"><strong>${item.term}</strong> <span style="opacity:0.5">(${item.count}×)</span></li>`)
        .join('');
    }

    // Key Points
    const keyList = $('key-points');
    if (!analysis.keyPoints || analysis.keyPoints.length === 0) {
      keyList.innerHTML = '<li class="no-items">No key points extracted</li>';
    } else {
      keyList.innerHTML = analysis.keyPoints
        .map((point, i) => `<li style="animation-delay: ${i * 0.05}s">${point}</li>`)
        .join('');
    }
  }

  // ── Section Switching ───────────────────────
  function showSection(name) {
    inputSection.classList.toggle('hidden', name !== 'input');
    loadingSection.classList.toggle('hidden', name !== 'loading');
    resultsSection.classList.toggle('hidden', name !== 'results');
    if (name === 'results' || name === 'loading') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function resetToInput() {
    documentInput.value = '';
    currentSummary = null;
    updateSummarizeBtn();
    showSection('input');
    documentInput.focus();
  }

  // ── File Handling ───────────────────────────
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) processFile(file);
    e.target.value = '';
  }

  function handleDrop(e) {
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  async function processFile(file) {
    const valid = ['.txt', '.md', '.html', '.htm', '.rtf', '.pdf', '.pptx', '.ppt', '.csv', '.json'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!valid.includes(ext)) {
      showToast('Unsupported file type. Use .pdf, .pptx, .txt, .md, .html, .csv, or .json.');
      return;
    }

    try {
      showToast(`Reading ${file.name}...`);
      const result = await FileReaders.readFile(file);

      if (!result.text || result.text.trim().length === 0) {
        showToast('Could not extract text from this file. It may be image-based.');
        return;
      }

      documentInput.value = result.text;
      updateSummarizeBtn();
      const wordCount = result.text.split(/\s+/).filter(w => w.length > 0).length;
      showToast(`Loaded: ${file.name} (${wordCount} words)`);
    } catch (err) {
      console.error('File read error:', err);
      showToast(err.message || 'Failed to read file.');
    }
  }

  // ── Copy ────────────────────────────────────
  async function handleCopy() {
    if (!currentSummary) return;
    try {
      await navigator.clipboard.writeText(currentSummary.summaryResult.summary);
      showCopyFeedback();
    } catch {
      const ta = document.createElement('textarea');
      ta.value = currentSummary.summaryResult.summary;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showCopyFeedback();
    }
  }

  let copyFeedbackTimeout = null;
  const copyOriginalHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

  function showCopyFeedback() {
    showToast('Summary copied! ✓');
    if (copyFeedbackTimeout) clearTimeout(copyFeedbackTimeout);
    copySummaryBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    copyFeedbackTimeout = setTimeout(() => {
      copySummaryBtn.innerHTML = copyOriginalHTML;
      copyFeedbackTimeout = null;
    }, 2000);
  }


  // ── Download ────────────────────────────────
  function handleDownload() {
    if (!currentSummary) return;

    const analysis = currentSummary.analysis;
    const dateStr = new Date(currentSummary.timestamp).toLocaleString();

    let mdContent = `# NoteDigest Summary\n\n*Generated on: ${dateStr}*\n\n`;

    // Metadata
    mdContent += `## Metadata\n`;
    mdContent += `- **Domain:** ${analysis.topics.join(', ')}\n`;
    mdContent += `- **Complexity:** ${analysis.complexity.level}\n`;
    mdContent += `- **Compression:** ${analysis.stats.reductionPercent}%\n\n`;

    // Summary
    mdContent += `## Summary\n\n`;
    mdContent += currentSummary.summaryResult.summary + `\n\n`;

    // Key Points
    if (analysis.keyPoints && analysis.keyPoints.length > 0) {
      mdContent += `## Extraction Points\n`;
      analysis.keyPoints.forEach(pt => {
        mdContent += `- ${pt}\n`;
      });
      mdContent += `\n`;
    }

    // Key Terms
    if (analysis.keyTerms && analysis.keyTerms.length > 0) {
      mdContent += `## Key Entities\n`;
      analysis.keyTerms.forEach(term => {
        mdContent += `- **${term.term}** (${term.count}x)\n`;
      });
    }

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NoteDigest_Summary.md';
    a.click();
    URL.revokeObjectURL(url);
  }
  // ── History ─────────────────────────────────
  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem('notedigest-history') || '[]');
    } catch { return []; }
  }

  function saveToHistory(result) {
    const history = getHistory();
    const entry = {
      id: Date.now(),
      timestamp: result.timestamp,
      preview: result.summaryResult.summary.slice(0, 120),
      summary: result.summaryResult.summary,
      topics: result.analysis.topics,
      complexity: result.analysis.complexity.level,
      stats: result.analysis.stats,
    };
    history.unshift(entry);
    if (history.length > 20) history.length = 20;
    localStorage.setItem('notedigest-history', JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    const history = getHistory();
    if (history.length === 0) {
      historyList.innerHTML = '<p class="history-empty">No summaries yet. Summarize a document to get started!</p>';
      return;
    }
    historyList.innerHTML = history.map(entry => {
      const date = new Date(entry.timestamp).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const topics = Array.isArray(entry.topics) ? entry.topics.join(', ') : 'General';
      return `
        <div class="history-item" data-id="${entry.id}">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div class="history-item-date">${date}</div>
            <button class="delete-history-item" data-id="${entry.id}" style="background:transparent;border:none;color:var(--text-muted);cursor:pointer;" title="Delete this entry" aria-label="Delete this entry">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="history-item-preview">${entry.preview}...</div>
          <div class="history-item-meta">
            <span>${topics}</span>
            <span>${entry.complexity || ''}</span>
            <span>${entry.stats.reductionPercent}% reduced</span>
          </div>
        </div>`;
    }).join('');

    // Delete single item
    historyList.querySelectorAll('.delete-history-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idToRemove = parseInt(btn.dataset.id);
        const currentHistory = getHistory();
        const updatedHistory = currentHistory.filter(h => h.id !== idToRemove);
        localStorage.setItem('notedigest-history', JSON.stringify(updatedHistory));
        renderHistory();
        showToast('History entry deleted');
      });
    });

    // Click to view
    historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        const entry = history.find(h => h.id === id);
        if (entry) {
          showToast('Loaded from history');
          summaryContent.innerHTML = entry.summary
            .split('. ')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map(s => `<p>${s.endsWith('.') ? s : s + '.'}</p>`)
            .join('');
          currentSummary = {
            summaryResult: { summary: entry.summary },
            analysis: {
              stats: entry.stats,
              topics: entry.topics || ['General'],
              complexity: { level: entry.complexity || 'Moderate', color: '#eab308', icon: '🟡' },
              keyTerms: [],
              keyPoints: []
            }
          };
          closeHistory();
          showSection('results');
          renderResults(currentSummary);
        }
      });
    });
  }

  function openHistory() {
    historyPanel.classList.add('open');
    historyOverlay.classList.add('open');
    renderHistory();
  }
  function closeHistory() {
    historyPanel.classList.remove('open');
    historyOverlay.classList.remove('open');
  }
  function handleClearHistory() {
    localStorage.removeItem('notedigest-history');
    renderHistory();
    showToast('History cleared');
  }

  // ── Toast ───────────────────────────────────
  function showToast(message, duration = 2500) {
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, duration);
  }

  // ── Boot ────────────────────────────────────
  init();
})();
