/**
 * summarizer.js — Core extractive summarization engine.
 * Implements TF-IDF, cosine similarity, and TextRank.
 */
const Summarizer = (() => {
  const STOP_WORDS = new Set([
    'a','an','the','and','or','but','in','on','at','to','for','of','with',
    'by','from','is','it','as','are','was','were','be','been','being',
    'have','has','had','do','does','did','will','would','shall','should',
    'may','might','can','could','this','that','these','those','i','me',
    'my','myself','we','our','ours','you','your','yours','he','him','his',
    'she','her','hers','its','they','them','their','what','which','who',
    'whom','when','where','why','how','all','each','every','both','few',
    'more','most','other','some','such','no','nor','not','only','own',
    'same','so','than','too','very','just','because','about','above',
    'after','again','against','am','any','between','into','through',
    'during','before','below','down','up','out','off','over','under',
    'then','once','here','there','if','while','also','still','much',
    'many','well','back','even','new','now','way','get','got','go',
    'going','make','made','know','like','let','said','say','re','ve',
    'll','don','t','didn','doesn','isn','wasn','weren','won','can','t',
    'cannot','couldn','t','shouldn','t','wouldn','t','hasn','t','haven','t',
    'hadn','t','aren','t','am','not','must','mustn','t','need','needn','t',
    'ought','oughtn','t','mightn','t','shall','shan','t','will','won','t',
    'yes','no','maybe','perhaps','always','never','often','sometimes',
    'usually','rarely','seldom','hardly','scarcely','almost','nearly',
    'quite','rather','somewhat','especially','particularly','specifically',
    'generally','mostly','largely','mainly','chiefly','principally',
    'however','moreover','furthermore','nevertheless','nonetheless',
    'therefore','thus','hence','consequently','accordingly','otherwise',
    'instead','meanwhile','anyway','anyhow','besides','also','too',
    'more','most','less','least','many','much','few','fewer',
    'some','any','all','both','either','neither','each','every',
    'other','another','such','what','which','who','whom','whose',
    'when','where','why','how','whether','if','unless','until',
    'since','because','although','though','even','while','as','so'
  ]);

  function tokenizeSentences(text) {
    if (!text || text.trim().length === 0) return [];
    const abbrevs = ['mr','mrs','ms','dr','prof','sr','jr','st','inc','ltd',
      'corp','vs','etc','dept','est','approx','i.e','e.g','a.m','p.m','no'];
    let processed = text;
    for (const abbr of abbrevs) {
      const re = new RegExp(`\\b${abbr}\\.`, 'gi');
      processed = processed.replace(re, m => m.replace('.', '{{DOT}}'));
    }
    processed = processed.replace(/(\d)\.(\d)/g, '$1{{DOT}}$2');
    processed = processed.replace(/\.{2,}/g, m => m.replace(/\./g, '{{DOT}}'));
    const raw = processed.split(/(?<=[.!?])\s+(?=[A-Z"'])|(?<=[.!?])\s*$|\n+/);
    return raw
      .map(s => s.replace(/\{\{DOT\}\}/g, '.').trim())
      .filter(s => s.split(/\s+/).filter(w => w.length > 0).length >= 3);
  }

  function tokenizeWords(sentence) {
    return sentence.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ')
      .split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));
  }

  function computeTFIDF(sentences) {
    const n = sentences.length;
    if (n === 0) return { vectors: [], vocabulary: new Set() };
    const tokenized = sentences.map(s => tokenizeWords(s));
    const df = new Map();
    const vocabulary = new Set();
    tokenized.forEach(words => {
      const unique = new Set(words);
      unique.forEach(word => {
        vocabulary.add(word);
        df.set(word, (df.get(word) || 0) + 1);
      });
    });
    const vectors = tokenized.map(words => {
      const tf = new Map();
      words.forEach(w => tf.set(w, (tf.get(w) || 0) + 1));
      const tfidf = new Map();
      const maxTF = Math.max(...tf.values(), 1);
      tf.forEach((count, word) => {
        const normalizedTF = 0.5 + 0.5 * (count / maxTF);
        const idf = Math.log((n + 1) / (1 + (df.get(word) || 0))) + 1;
        tfidf.set(word, normalizedTF * idf);
      });
      return tfidf;
    });
    return { vectors, vocabulary };
  }

  function cosineSimilarity(vecA, vecB) {
    let dot = 0, normA = 0, normB = 0;
    vecA.forEach((valA, word) => {
      normA += valA * valA;
      dot += valA * (vecB.get(word) || 0);
    });
    vecB.forEach(valB => { normB += valB * valB; });
    normA = Math.sqrt(normA); normB = Math.sqrt(normB);
    if (normA === 0 || normB === 0) return 0;
    return dot / (normA * normB);
  }

  function buildSimilarityMatrix(vectors) {
    const n = vectors.length;
    const matrix = Array.from({ length: n }, () => new Float64Array(n));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const sim = cosineSimilarity(vectors[i], vectors[j]);
        matrix[i][j] = sim; matrix[j][i] = sim;
      }
    }
    return matrix;
  }

  function textRank(matrix, damping = 0.85, maxIter = 100, threshold = 0.0001) {
    const n = matrix.length;
    if (n === 0) return [];
    let scores = new Float64Array(n).fill(1 / n);
    const rowSums = new Float64Array(n);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) rowSums[i] += matrix[i][j];
    for (let iter = 0; iter < maxIter; iter++) {
      const ns = new Float64Array(n);
      let maxDiff = 0;
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++)
          if (i !== j && rowSums[j] > 0) sum += (matrix[j][i] / rowSums[j]) * scores[j];
        ns[i] = (1 - damping) / n + damping * sum;
        maxDiff = Math.max(maxDiff, Math.abs(ns[i] - scores[i]));
      }
      scores = ns;
      if (maxDiff < threshold) break;
    }
    return Array.from(scores);
  }

  function positionBias(index, total) {
    if (total <= 1) return 1;
    const pos = index / (total - 1);
    if (pos <= 0.2) return 1.3;
    if (pos >= 0.85) return 1.15;
    return 1.0;
  }

  function summarize(text, numSentences = 3) {
    const sentences = tokenizeSentences(text);
    if (sentences.length === 0) return { summary: text || '', sentences: [], scores: [] };
    if (sentences.length <= numSentences) {
      return {
        summary: sentences.join(' '),
        sentences: sentences.map((s, i) => ({ text: s, index: i, score: 1 })),
        scores: sentences.map(() => 1),
      };
    }
    const { vectors } = computeTFIDF(sentences);
    const matrix = buildSimilarityMatrix(vectors);
    const rawScores = textRank(matrix);
    const scores = rawScores.map((s, i) => s * positionBias(i, sentences.length));
    const ranked = sentences.map((text, index) => ({ text, index, score: scores[index] }))
      .sort((a, b) => b.score - a.score);
    const selected = ranked.slice(0, numSentences).sort((a, b) => a.index - b.index);
    return { summary: selected.map(s => s.text).join(' '), sentences: selected, scores };
  }

  return { summarize, tokenizeSentences, tokenizeWords, computeTFIDF,
    cosineSimilarity, buildSimilarityMatrix, textRank };
})();
