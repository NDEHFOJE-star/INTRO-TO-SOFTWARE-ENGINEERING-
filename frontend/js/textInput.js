/**
 * textInput.js
 * Handles: paste/type, edit/clear, live char count.
 */

const TextInputModule = (() => {
  const textarea = document.getElementById('textInput');
  const charCount = document.getElementById('charCount');
  const clearBtn = document.getElementById('clearTextBtn');
  const processBtn = document.getElementById('processTextBtn');

  function updateCharCount() {
    charCount.textContent = textarea.value.length;
  }

  function clear() {
    textarea.value = '';
    updateCharCount();
    textarea.focus();
  }

  function getText() {
    return textarea.value;
  }

  function init(onProcess) {
    textarea.addEventListener('input', updateCharCount);
    clearBtn.addEventListener('click', clear);
    processBtn.addEventListener('click', () => {
      const text = getText().trim();
      if (!text) {
        App.showToast('Please enter some text first.', 'error');
        return;
      }
      onProcess(text, 'text-input');
    });
    updateCharCount();
  }

  return { init, getText, clear };
})();