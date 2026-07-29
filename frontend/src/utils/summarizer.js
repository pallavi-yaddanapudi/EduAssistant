/**
 * Offline Extractive Text Summarization.
 * Computes sentence scores using term frequencies (excluding common stop words).
 */

const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd",
  'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers',
  'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
  'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if',
  'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
  'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
  'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should',
  "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't",
  'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't",
  'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't",
  'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"
]);

/**
 * Summarizes text by extracting the most important sentences.
 * @param {string} text - The input text to summarize
 * @param {number} sentenceCount - The number of sentences to extract (default is 2)
 * @returns {string} The summary
 */
export const generateSummary = (text, sentenceCount = 2) => {
  if (!text || text.trim() === '') return '';

  // 1. Split text into sentences using simple regex
  // Matches periods, question marks, and exclamation marks followed by spaces
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  if (sentences.length <= sentenceCount) {
    return sentences.join(' ');
  }

  // 2. Tokenize words and count term frequency (excluding stop words)
  const wordFrequency = {};
  let totalWordCount = 0;

  sentences.forEach((sentence) => {
    // Clean and split sentence into words
    const words = sentence
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 1);

    words.forEach((word) => {
      if (!STOP_WORDS.has(word)) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        totalWordCount++;
      }
    });
  });

  if (totalWordCount === 0) {
    // Fallback: just return the first few sentences if no keywords found
    return sentences.slice(0, sentenceCount).join(' ');
  }

  // 3. Score sentences based on word frequencies
  const sentenceScores = sentences.map((sentence, index) => {
    const words = sentence
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 1);

    let score = 0;
    const uniqueWordsInSentence = new Set(words);

    uniqueWordsInSentence.forEach((word) => {
      if (wordFrequency[word]) {
        score += wordFrequency[word];
      }
    });

    // Normalize score by sentence length to avoid favoring extremely long sentences
    const lengthFactor = words.length > 0 ? words.length : 1;
    // We add a tiny length penalty but favor sentences with high word weight
    const normalizedScore = score / Math.sqrt(lengthFactor);

    return {
      index,
      sentence,
      score: normalizedScore
    };
  });

  // 4. Select top scoring sentences
  const sortedScores = [...sentenceScores].sort((a, b) => b.score - a.score);
  const topSentences = sortedScores.slice(0, sentenceCount);

  // 5. Sort top sentences by their original chronological index to preserve reading flow
  topSentences.sort((a, b) => a.index - b.index);

  return topSentences.map(item => item.sentence).join(' ');
};
