/**
 * textCleaner.js
 * Cleans extracted text before passing to the reading engine.
 */

const TextCleaner = (() => {
  function clean(raw) {
    if (!raw || typeof raw !== 'string') return '';

    let text = raw;

    text = text.normalize('NFKC');

    text = text
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/\u2026/g, '...');

    text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
    text = text.replace(/-\s*\n\s*/g, '');
    text = text.replace(/[ \t]+/g, ' ');
    text = text.replace(/\n{3,}/g, '\n\n');

    text = text
      .split('\n')
      .map((line) => line.trim())
      .join('\n');

    text = text
      .replace(/\bl\b/g, 'I')
      .replace(/[“”]/g, '"')
      .replace(/\s+([.,!?;:])/g, '$1');

    return text.trim();
  }

  function toSentences(text) {
    if (!text) return [];
    return text
      .replace(/([.!?])\s+/g, '$1|')
      .split('|')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  return { clean, toSentences };
})();