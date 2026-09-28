/**
 * app.js
 * Main orchestrator: tabs, toast, processed output,
 * and passing text to the reading engine.
 */

const App = (() => {
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message, type = 'info') {
    toastEl.textContent = message;
    toastEl.className = `toast ${type}`;
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add('hidden'), 3000);
  }

  function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        contents.forEach((c) => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });
  }

  const outputSection = document.getElementById('outputSection');
  const processedOutput = document.getElementById('processedOutput');
  const copyBtn = document.getElementById('copyBtn');
  const sendBtn = document.getElementById('sendToReaderBtn');

  let lastProcessed = '';

  function handleProcessedText(raw, source) {
    const cleaned = TextCleaner.clean(raw);

    if (!cleaned) {
      showToast('Text was empty after cleaning.', 'error');
      return;
    }

    lastProcessed = cleaned;
    processedOutput.value = cleaned;
    outputSection.classList.remove('hidden');
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
    showToast(`✅ Processed ${wordCount} words from ${source}.`, 'success');
  }

  function sendToReadingEngine() {
    if (!lastProcessed) return;

    const payload = {
      text: lastProcessed,
      sentences: TextCleaner.toSentences(lastProcessed),
      wordCount: lastProcessed.split(/\s+/).filter(Boolean).length,
      timestamp: new Date().toISOString(),
    };

    window.dispatchEvent(new CustomEvent('reader:loadText', { detail: payload }));

    console.log('[ReadingEngine] Received payload:', payload);
    showToast('🔊 Sent to Reading Engine!', 'success');
  }

  function init() {
    initTabs();

    TextInputModule.init(handleProcessedText);
    FileUploadModule.init(handleProcessedText);
    OcrModule.init(handleProcessedText);

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(lastProcessed);
        showToast('📋 Copied to clipboard!', 'success');
      } catch {
        showToast('Copy failed.', 'error');
      }
    });

    sendBtn.addEventListener('click', sendToReadingEngine);

    if (window.pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  return { showToast };
})();