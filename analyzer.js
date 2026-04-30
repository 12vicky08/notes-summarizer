/**
 * analyzer.js — Smart document analysis layer.
 * Detects key topics, complexity level, and computes reading stats.
 */
const Analyzer = (() => {

  const TOPIC_KEYWORDS = {
    'Technology': new Set(['software','hardware','computer','algorithm','data','code','programming','api','server','database','cloud','ai','machine','learning','network','internet','digital','cyber','tech']),
    'Science': new Set(['research','experiment','hypothesis','theory','biology','chemistry','physics','molecule','cell','atom','genome','evolution','quantum','scientific']),
    'Business': new Set(['revenue','profit','market','strategy','growth','investment','company','startup','finance','budget','sales','customer','product','management']),
    'Education': new Set(['student','teacher','learning','course','curriculum','exam','study','lecture','university','school','education','knowledge','skill','training']),
    'Health': new Set(['health','medical','patient','treatment','disease','symptom','diagnosis','therapy','clinical','hospital','medicine','wellness','nutrition']),
    'General': new Set([]),
  };

  /**
   * Detect the primary topic/category of the text.
   */
  function detectTopics(text) {
    const words = text.toLowerCase().replace(/[^a-z\s'-]/g, ' ').split(/\s+/);
    const scores = {};
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      if (topic === 'General') continue;
      scores[topic] = words.filter(w => keywords.has(w)).length;
    }
    const sorted = Object.entries(scores).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted.slice(0, 3).map(([t]) => t) : ['General'];
  }

  /**
   * Assess text complexity (reading level).
   */
  function assessComplexity(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const longWords = words.filter(w => w.length > 6).length;
    const longWordRatio = longWords / Math.max(words.length, 1);

    if (avgWordsPerSentence > 25 || longWordRatio > 0.35) {
      return { level: 'Advanced', color: '#ef4444', icon: '🔴' };
    }
    if (avgWordsPerSentence > 18 || longWordRatio > 0.25) {
      return { level: 'Intermediate', color: '#f97316', icon: '🟠' };
    }
    if (avgWordsPerSentence > 12) {
      return { level: 'Moderate', color: '#eab308', icon: '🟡' };
    }
    return { level: 'Easy', color: '#22c55e', icon: '🟢' };
  }

  /**
   * Extract key points (top N distinct topic sentences).
   */
  function extractKeyPoints(sentences, scores, n = 5) {
    if (!scores || scores.length === 0) return sentences.slice(0, n);
    const indexed = sentences.map((s, i) => ({ text: s.text || s, score: s.score || scores[i] || 0 }));
    return indexed.sort((a, b) => b.score - a.score).slice(0, n).map(s => s.text);
  }

  /**
   * Detect key terms/phrases that appear frequently.
   */
  function extractKeyTerms(text, topN = 8) {
    const STOP_WORDS = new Set([
      'a','an','the','and','or','but','in','on','at','to','for','of','with',
      'by','from','is','it','as','are','was','were','be','been','being',
      'have','has','had','do','does','did','will','would','shall','should',
      'may','might','can','could','this','that','these','those','i','me',
      'my','we','our','you','your','he','him','his','she','her','its',
      'they','them','their','what','which','who','when','where','why','how',
      'all','each','every','both','few','more','most','other','some','such',
      'no','nor','not','only','own','same','so','than','too','very','just',
      'about','also','still','much','many','well','back','even','new','now',
    ]);
    const words = text.toLowerCase().replace(/[^a-z\s'-]/g, ' ').split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));
    const freq = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([term, count]) => ({ term, count }));
  }

  /**
   * Compute reading stats.
   */
  function computeStats(originalText, summaryText) {
    const countWords = t => t.split(/\s+/).filter(w => w.length > 0).length;
    const origWords = countWords(originalText);
    const summWords = countWords(summaryText);
    const readingTime = w => Math.max(1, Math.ceil(w / 200));
    const reduction = origWords > 0 ? Math.round((1 - summWords / origWords) * 100) : 0;
    return {
      originalWords: origWords,
      summaryWords: summWords,
      originalReadTime: readingTime(origWords),
      summaryReadTime: readingTime(summWords),
      reductionPercent: reduction,
    };
  }

  /**
   * Run full analysis on document text.
   */
  function analyze(originalText, summaryResult) {
    const allSentences = Summarizer.tokenizeSentences(originalText);
    const topics = detectTopics(originalText);
    const complexity = assessComplexity(originalText);
    const keyPoints = extractKeyPoints(summaryResult.sentences, summaryResult.scores);
    const keyTerms = extractKeyTerms(originalText);
    const stats = computeStats(originalText, summaryResult.summary);
    return { topics, complexity, keyPoints, keyTerms, stats };
  }

  return { analyze, detectTopics, assessComplexity, computeStats, extractKeyPoints, extractKeyTerms };
})();
