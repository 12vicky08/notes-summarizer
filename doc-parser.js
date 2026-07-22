/**
 * doc-parser.js
 * ─────────────────────────────────────────────
 * Document text cleaning & preprocessing module.
 * Strips HTML, normalizes whitespace, and handles
 * various document formats for clean text extraction.
 */

const DocParser = (() => {

  /**
   * Strip HTML tags and decode entities from text.
   */
  function stripHTML(text) {
    let clean = text.replace(/<style[\s\S]*?<\/style>/gi, '');
    clean = clean.replace(/<script[\s\S]*?<\/script>/gi, '');
    clean = clean.replace(/<svg[\s\S]*?<\/svg>/gi, '');
    clean = clean.replace(/<br\s*\/?>/gi, '\n');
    clean = clean.replace(/<\/(p|div|tr|li|h[1-6])>/gi, '\n');
    clean = clean.replace(/<[^>]+>/g, '');

    const entities = {
      '&amp;': '&', '&lt;': '<', '&gt;': '>',
      '&quot;': '"', '&#39;': "'", '&apos;': "'",
      '&nbsp;': ' ', '&mdash;': '—', '&ndash;': '–',
      '&hellip;': '…', '&copy;': '©', '&reg;': '®',
    };
    for (const [entity, char] of Object.entries(entities)) {
      clean = clean.replace(new RegExp(entity, 'gi'), char);
    }
    clean = clean.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)));

    return clean;
  }


  /**
   * Extract document metadata if present (title, author, date).
   */
  function extractMetadata(text) {
    const metadata = {};
    const titleMatch = text.match(/^(?:title|subject|topic):\s*(.+)$/im);
    if (titleMatch) metadata.title = titleMatch[1].trim();

    const authorMatch = text.match(/^(?:author|by|written by|from):\s*(.+)$/im);
    if (authorMatch) metadata.author = authorMatch[1].trim();

    const dateMatch = text.match(/^(?:date|created|updated):\s*(.+)$/im);
    if (dateMatch) metadata.date = dateMatch[1].trim();

    return metadata;
  }


  /**
   * Remove metadata headers from body text.
   */
  function removeMetadataLines(text) {
    const metaPatterns = [
      /^(?:title|subject|topic):\s*(.+)$/im,
      /^(?:author|by|written by|from):\s*(.+)$/im,
      /^(?:date|created|updated):\s*(.+)$/im,
    ];
    const lines = text.split('\n');
    const bodyLines = [];
    let pastHeaders = false;

    for (const line of lines) {
      if (!pastHeaders) {
        const isMeta = metaPatterns.some(p => p.test(line));
        if (isMeta) continue;
        if (line.trim() === '') continue;
        pastHeaders = true;
      }
      bodyLines.push(line);
    }

    return bodyLines.join('\n');
  }


  /**
   * Normalize whitespace: collapse multiple blank lines, trim, etc.
   */
  function normalizeWhitespace(text) {
    let clean = text.replace(/\n{3,}/g, '\n\n');
    clean = clean.split('\n').map(l => l.trim()).join('\n');
    clean = clean.trim();
    return clean;
  }


  /**
   * Remove markdown artifacts (headers, bold, italics, lists, links).
   */
  function stripMarkdown(text) {
    let clean = text.replace(/^#{1,6}\s+(.*)$/gm, '$1'); // Headers
    clean = clean.replace(/(\*\*|__)(.*?)\1/g, '$2'); // Bold
    clean = clean.replace(/(\*|_)(.*?)\1/g, '$2'); // Italics
    clean = clean.replace(/~~(.*?)~~/g, '$1'); // Strikethrough
    clean = clean.replace(/`([^`]+)`/g, '$1'); // Inline code
    clean = clean.replace(/```[\s\S]*?```/g, ''); // Code blocks
    clean = clean.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Links
    clean = clean.replace(/^[\*\-\+]\s+(.*)$/gm, '$1'); // Unordered lists
    clean = clean.replace(/^\d+\.\s+(.*)$/gm, '$1'); // Ordered lists
    clean = clean.replace(/^>\s+(.*)$/gm, '$1'); // Blockquotes
    return clean;
  }

  /**
   * Remove common artifacts (standalone URLs, mailto links).
   */
  function cleanArtifacts(text) {
    let clean = text.replace(/^https?:\/\/\S+$/gm, '');
    clean = clean.replace(/mailto:\S+/g, '');
    return clean;
  }


  /**
   * Main parsing function.
   * Takes raw document text and returns:
   *   { metadata, body, originalLength, cleanedLength }
   */
  function parse(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return { metadata: {}, body: '', originalLength: 0, cleanedLength: 0 };
    }

    const originalLength = rawText.length;

    // Step 1: Strip HTML
    let text = stripHTML(rawText);

    // Step 2: Extract metadata before removing it
    const metadata = extractMetadata(text);

    // Step 3: Remove metadata lines from body
    text = removeMetadataLines(text);

    // Step 4: Clean markdown
    text = stripMarkdown(text);

    // Step 5: Clean artifacts
    text = cleanArtifacts(text);

    // Step 6: Normalize whitespace
    text = normalizeWhitespace(text);

    return {
      metadata,
      body: text,
      originalLength,
      cleanedLength: text.length,
    };
  }


  // ── Public API ──────────────────────────────
  return { parse, stripHTML, extractMetadata };

})();
