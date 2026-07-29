/**
 * Local rules-based grammar and spelling checker.
 * Detects common mistakes and suggests corrections.
 */

const rules = [
  // 1. Duplicate words (e.g. "the the")
  {
    name: 'duplicated-word',
    type: 'grammar',
    regex: /\b(\w+)\s+\1\b/gi,
    message: (match, p1) => `Duplicated word: '${p1}'`,
    suggestion: (match, p1) => p1,
  },
  // 2. Capitalization at start of sentences
  {
    name: 'capitalization',
    type: 'grammar',
    regex: /(?:^|[.!?]\s+)([a-z])/g,
    message: (match, p1) => `Start sentences with a capital letter: '${p1}'`,
    suggestion: (match, p1) => p1.toUpperCase(),
  },
  // 3. Lowercase 'i' pronoun
  {
    name: 'lowercase-i',
    type: 'grammar',
    regex: /\bi\b/g,
    message: () => `The pronoun 'I' should always be capitalized.`,
    suggestion: () => 'I',
  },
  // 4. Double spacing
  {
    name: 'double-space',
    type: 'punctuation',
    regex: / {2,}/g,
    message: () => 'Remove extra spaces.',
    suggestion: () => ' ',
  },
  // 5. Space before punctuation
  {
    name: 'punctuation-spacing',
    type: 'punctuation',
    regex: /\s+([.,!?;:])/g,
    message: (match, p1) => `Remove space before punctuation '${p1}'.`,
    suggestion: (match, p1) => p1,
  },
  // 6. Wrong article: "a" followed by a vowel sound word
  {
    name: 'wrong-article-a',
    type: 'grammar',
    regex: /\ba\s+([aeiou]\w+)/gi,
    message: (match, p1) => `Use 'an' before words starting with vowel sounds like '${p1}'.`,
    suggestion: (match, p1) => `an ${p1}`,
  },
  // 7. Wrong article: "an" followed by a consonant sound word
  {
    name: 'wrong-article-an',
    type: 'grammar',
    regex: /\ban\s+([bcdfghjklmnpqrstvwxyz]\w+)/gi,
    message: (match, p1) => `Use 'a' before words starting with consonant sounds like '${p1}'.`,
    suggestion: (match, p1) => `a ${p1}`,
  },
  // 8. Homophones: "its" vs "it's"
  {
    name: 'homophone-its',
    type: 'grammar',
    regex: /\bits\s+(a|an|the|very|not|easy|important|good|bad|difficult|clear|obvious)\b/gi,
    message: () => `Did you mean the contraction "it's" (it is)?`,
    suggestion: (match, p1) => `it's ${p1}`,
  },
  {
    name: 'homophone-its-possessive',
    type: 'grammar',
    regex: /\bit's\s+(color|name|size|shape|purpose|owner|location|value|quality|history)\b/gi,
    message: () => `Did you mean the possessive adjective "its"?`,
    suggestion: (match, p1) => `its ${p1}`,
  },
  // 9. Homophones: "your" vs "you're"
  {
    name: 'homophone-your',
    type: 'grammar',
    regex: /\byour\s+(welcome|right|wrong|going|doing|beautiful|great|smart|invited|selected)\b/gi,
    message: () => `Did you mean the contraction "you're" (you are)?`,
    suggestion: (match, p1) => `you're ${p1}`,
  },
  {
    name: 'homophone-your-possessive',
    type: 'grammar',
    regex: /\byou're\s+(name|car|house|book|file|opinion|choice|parents|idea|email|work)\b/gi,
    message: () => `Did you mean the possessive adjective "your"?`,
    suggestion: (match, p1) => `your ${p1}`,
  },
  // 10. Homophones: "there" vs "their" vs "they're"
  {
    name: 'homophone-their-verb',
    type: 'grammar',
    regex: /\btheir\s+(is|are|was|were|going|coming|here|there|looking|doing|having)\b/gi,
    message: (match, p1) => `Did you mean "there ${p1}" or "they're ${p1}"?`,
    suggestion: (match, p1) => p1 === 'is' || p1 === 'was' || p1 === 'here' || p1 === 'there' ? `there ${p1}` : `they're ${p1}`,
  },
  {
    name: 'homophone-their-noun',
    type: 'grammar',
    regex: /\b(?:there|they're)\s+(books|parents|house|room|jobs|ideas|opinions|cars|belongings|desires)\b/gi,
    message: (match, p1) => `Did you mean the possessive plural "their ${p1}"?`,
    suggestion: (match, p1) => `their ${p1}`,
  }
];

/**
 * Checks a given text for grammar and style issues.
 * @param {string} text - The input text to check
 * @returns {Array} List of suggestions found
 */
export const checkGrammar = (text) => {
  if (!text || text.trim() === '') return [];

  const suggestions = [];

  rules.forEach((rule) => {
    let match;
    // Reset regex index for safety
    rule.regex.lastIndex = 0;
    
    // We clone the regex to execute match safely
    const rx = new RegExp(rule.regex.source, rule.regex.flags);
    
    while ((match = rx.exec(text)) !== null) {
      const matchedText = match[0];
      const matchIndex = match.index;
      
      // For start-of-sentence capitalization, match[1] holds the letter. 
      // We need to calculate the exact offset of that capture group.
      let errorIndex = matchIndex;
      let errorLength = matchedText.length;
      let displayMatch = matchedText;

      if (rule.name === 'capitalization') {
        // Find the index of the captured lowercase letter in the matched portion
        const captureOffset = matchedText.indexOf(match[1]);
        errorIndex = matchIndex + captureOffset;
        errorLength = 1;
        displayMatch = match[1];
      }

      suggestions.push({
        id: `${rule.name}-${errorIndex}`,
        type: rule.type,
        message: rule.message(matchedText, match[1], match[2]),
        match: displayMatch,
        suggestion: rule.suggestion(matchedText, match[1], match[2]),
        index: errorIndex,
        length: errorLength,
      });
    }
  });

  // Sort suggestions by index ascending so we display them in chronological reading order
  return suggestions.sort((a, b) => a.index - b.index);
};
