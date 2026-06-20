// utils/textChunker.js

/**
 * Splits text into chunks of ~wordsPerChunk words, breaking on sentence
 * boundaries so we never cut a sentence in half mid-chunk.
 */
export function chunkTextByWords(text, wordsPerChunk = 2000) {
  if (!text) return [];

  const sentences = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.?!])\s+/);

  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;

  for (const sentence of sentences) {
    const sentenceWordCount = sentence.split(/\s+/).filter(Boolean).length;

    if (
      currentWordCount + sentenceWordCount > wordsPerChunk &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.join(" "));
      currentChunk = [];
      currentWordCount = 0;
    }

    currentChunk.push(sentence);
    currentWordCount += sentenceWordCount;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks;
}