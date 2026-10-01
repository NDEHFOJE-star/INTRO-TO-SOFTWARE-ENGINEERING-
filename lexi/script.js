// Navigation between screens - this belongs to Person 1
function showScreen(screenId) {
  var screens = document.querySelectorAll('.screen');
  for (var i = 0; i < screens.length; i++) {
    screens[i].classList.remove('active');
  }
  document.getElementById(screenId).classList.add('active');
  var navButtons = document.querySelectorAll('.nav button');
  for (var i = 0; i < navButtons.length; i++) {
    navButtons[i].classList.remove('active');
  }
  if (screenId === 'home') navButtons[0].classList.add('active');
  if (screenId === 'reading') navButtons[1].classList.add('active');
  if (screenId === 'settings') navButtons[2].classList.add('active');
  if (screenId !== 'reading') resetAudio(); // added: stop speech when leaving Reading
}

// ===============================
// PERSON 3 - TEXT TO SPEECH (no backend, uses the browser's built-in voice)
// Now with: pause/resume from the exact word + automatic translation + word highlighting
// ===============================
const synth = window.speechSynthesis;
const speechSupported = Boolean(synth && window.SpeechSynthesisUtterance);
const playPauseBtn = document.getElementById("playPauseBtn");
const stopBtn = document.getElementById("stopBtn");
const speedControl = document.getElementById("speedControl");
const voiceControl = document.getElementById("voiceControl");
const readingText = document.getElementById("readingText");

const SOURCE_LANG = "en"; // the language your passages are written in

// Fill the voice dropdown: English (Aria, Guy) and French (Denise, Henri).
// If those natural voices aren't on this device, it uses the first two available.
function loadVoices() {
  if (!speechSupported) return;
  const allVoices = synth.getVoices();
  if (allVoices.length === 0) return;

  const languages = {
    en: { label: "English", preferred: ["Aria", "Guy"] },
    fr: { label: "Français", preferred: ["Denise", "Henri"] }
  };

  let chosenVoices = [];
  Object.keys(languages).forEach(function (code) {
    const ofLanguage = allVoices.filter(function (v) {
      return v.lang.startsWith(code);
    });
    let picked = [];
    languages[code].preferred.forEach(function (name) {
      const match = ofLanguage.find(function (v) {
        return v.name.includes(name);
      });
      if (match) picked.push(match);
    });
    ofLanguage.forEach(function (v) {
      if (picked.length < 2 && !picked.includes(v)) picked.push(v);
    });
    chosenVoices = chosenVoices.concat(picked);
  });

  const previousChoice = voiceControl.value;
  if (chosenVoices.length === 0) chosenVoices = allVoices.slice(0, 2);

  voiceControl.innerHTML = "";
  chosenVoices.forEach(function (v) {
    const shortName = v.name
      .replace(/^(Microsoft|Google)\s*/, "")
      .replace(/\s*-.*$/, "")
      .replace(/\s*\(.*\)/, "")
      .replace(/\s*Online\s*/, "");
    const language = languages[v.lang.slice(0, 2)]?.label || v.lang;
    voiceControl.add(new Option(shortName + " (" + language + ")", v.name));
  });

  if (chosenVoices.some(voice => voice.name === previousChoice)) {
    voiceControl.value = previousChoice;
  }
}
loadVoices();
if (speechSupported) synth.addEventListener("voiceschanged", loadVoices);

function getSelectedVoice() {
  if (!speechSupported) return null;
  return synth.getVoices().find(function (v) {
    return v.name === voiceControl.value;
  }) || null;
}

function getSelectedLanguage() {
  const voice = getSelectedVoice();
  return voice ? voice.lang.slice(0, 2).toLowerCase() : SOURCE_LANG;
}

// ---------- TRANSLATION ----------
// 1) Tries the translator built into newer Edge/Chrome (free, works offline once downloaded)
// 2) Falls back to the free MyMemory online translator (needs internet)
// 3) If both fail, the original text is read instead
let originalHTML = readingText.innerHTML; // the current passage's layout; replaced whenever a new passage loads
let originalText = null;
let displayedLang = SOURCE_LANG;
let viewToken = 0;
const translationCache = {};

const statusEl = document.createElement("div");
statusEl.setAttribute("aria-live", "polite");
statusEl.style.fontSize = "0.9em";
statusEl.style.minHeight = "1.2em";
readingText.parentNode.insertBefore(statusEl, readingText);
function setStatus(message) {
  statusEl.textContent = message;
}

if (!speechSupported) {
  playPauseBtn.disabled = true;
  stopBtn.disabled = true;
  voiceControl.disabled = true;
  setStatus("Read-aloud isn't supported in this browser. You can still add and read passages, or use a browser with speech support.");
}

function decodeEntities(s) {
  const t = document.createElement("textarea");
  t.innerHTML = s;
  return t.value;
}

/* Accessibility Controls */

const fontSelect = document.getElementById("fontSelect");
const increaseFont = document.getElementById("increaseFont");
const decreaseFont = document.getElementById("decreaseFont");
const fontSizeDisplay = document.getElementById("fontSizeDisplay");

const letterSpacing = document.getElementById("letterSpacing");
const wordSpacing = document.getElementById("wordSpacing");
const lineSpacing = document.getElementById("lineSpacing");

const letterSpacingValue = document.getElementById("letterSpacingValue");
const wordSpacingValue = document.getElementById("wordSpacingValue");
const lineSpacingValue = document.getElementById("lineSpacingValue");

const backgroundColor = document.getElementById("backgroundColor");
const contrastMode = document.getElementById("contrastMode");

fontSelect.addEventListener("change", function () {
  readingText.style.fontFamily = this.value;
});

let currentFontSize = 18;

increaseFont.addEventListener("click", function () {
  if (currentFontSize < 32) {
    currentFontSize += 2;
    readingText.style.fontSize = currentFontSize + "px";
    fontSizeDisplay.textContent = currentFontSize + "px";
  }
});

decreaseFont.addEventListener("click", function () {
  if (currentFontSize > 12) {
    currentFontSize -= 2;
    readingText.style.fontSize = currentFontSize + "px";
    fontSizeDisplay.textContent = currentFontSize + "px";
  }
});

letterSpacing.addEventListener("input", function () {
  readingText.style.letterSpacing = this.value + "px";
  letterSpacingValue.textContent = this.value + "px";
});

wordSpacing.addEventListener("input", function () {
  readingText.style.wordSpacing = this.value + "px";
  wordSpacingValue.textContent = this.value + "px";
});

lineSpacing.addEventListener("input", function () {
  readingText.style.lineHeight = this.value;
  lineSpacingValue.textContent = this.value;
});

backgroundColor.addEventListener("change", function () {
  readingText.style.backgroundColor = this.value;
  readingText.style.color = "#1a1a1a";
});

contrastMode.addEventListener("change", function () {
  if (this.value === "high") {
    readingText.classList.add("high-contrast");
  } else {
    readingText.classList.remove("high-contrast");
    readingText.style.backgroundColor = backgroundColor.value;
    readingText.style.color = "#1a1a1a";
  }
});

function chunkText(text, maxLength) {
  const chunks = [];
  let current = "";
  splitIntoSentences(text).forEach(function (s) {
    if (current && (current + " " + s).length > maxLength) {
      chunks.push(current);
      current = s;
    } else {
      current = current ? current + " " + s : s;
    }
  });
  if (current) chunks.push(current);
  return chunks;
}

function splitLines(text) {
  return text.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
}

async function translateWithBrowser(text, target) {
  if (!("Translator" in self)) return null;
  const options = { sourceLanguage: SOURCE_LANG, targetLanguage: target };
  const availability = await Translator.availability(options);
  if (availability === "unavailable") return null;
  const translator = await Translator.create(options);
  const out = [];
  for (const line of splitLines(text)) {
    out.push(await translator.translate(line));
  }
  return out.join("\n\n");
}

async function translateOnline(text, target) {
  const out = [];
  for (const line of splitLines(text)) {
    const parts = [];
    for (const chunk of chunkText(line, 450)) {
      const url = "https://api.mymemory.translated.net/get?q=" +
        encodeURIComponent(chunk) + "&langpair=" + SOURCE_LANG + "|" + target;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Translation request failed");
      const data = await response.json();
      if (Number(data.responseStatus) !== 200 || !data.responseData) {
        throw new Error("Translation not available");
      }
      parts.push(decodeEntities(data.responseData.translatedText));
    }
    out.push(parts.join(" "));
  }
  return out.join("\n\n");
}

async function getTranslation(text, target) {
  const key = target + "|" + text;
  if (translationCache[key]) return translationCache[key];
  let result = null;
  try {
    result = await translateWithBrowser(text, target);
  } catch (e) {
    console.warn("Browser translator failed:", e);
  }
  if (!result) {
    try {
      result = await translateOnline(text, target);
    } catch (e) {
      console.warn("Online translator failed:", e);
    }
  }
  if (result) translationCache[key] = result;
  return result;
}

function showOriginal() {
  readingText.innerHTML = originalHTML;
  displayedLang = SOURCE_LANG;
  setStatus("");
}

async function showTextForCurrentVoice() {
  const token = ++viewToken;

  if (originalText === null && displayedLang === SOURCE_LANG) {
    originalText = readingText.innerText;
  }

  const target = getSelectedLanguage();
  if (target === SOURCE_LANG) {
    showOriginal();
    return readingText.innerText;
  }

  setStatus("Translating…");
  const translated = await getTranslation(originalText, target);
  if (token !== viewToken) return null;

  if (translated) {
    readingText.innerText = translated;
    displayedLang = target;
    setStatus("");
    return translated;
  }

  showOriginal();
  setStatus("Translation isn't available right now, so the original text will be read.");
  return originalText;
}

// ---------- LOADING A PASSAGE INTO THE READER ----------
// Called whenever the user adds new text (type/upload/OCR) or taps a saved
// passage on the Home screen. Replaces whatever is currently in the reader.
function loadPassageIntoReader(text, title) {
  resetAudio(); // stop anything currently playing
  const safeText = escapeHtml(text);
  readingText.innerHTML = safeText;
  originalHTML = safeText;
  originalText = text;
  displayedLang = SOURCE_LANG;
  document.getElementById("readingTitle").textContent = title || "Your Passage";
}

// ---------- WORD HIGHLIGHTING ----------
let wordSpans = [];
let wordOffsets = [];
let sentenceStarts = [];
let currentHighlighted = null;

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderWordSpans(text) {
  let html = "";
  const offsets = [];
  const regex = /\S+/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    html += escapeHtml(text.slice(lastIndex, match.index));
    const start = match.index;
    const end = start + match[0].length;
    html += '<span class="word" data-start="' + start + '">' + escapeHtml(match[0]) + "</span>";
    offsets.push({ start: start, end: end });
    lastIndex = end;
  }
  html += escapeHtml(text.slice(lastIndex));

  readingText.innerHTML = html;
  wordSpans = Array.from(readingText.querySelectorAll(".word"));
  wordOffsets = offsets;
  currentHighlighted = null;
}

function getSentenceStarts(text, sentenceList) {
  const starts = [];
  let cursor = 0;
  sentenceList.forEach(function (s) {
    const idx = text.indexOf(s, cursor);
    const start = idx === -1 ? cursor : idx;
    starts.push(start);
    cursor = start + s.length;
  });
  return starts;
}

function highlightWordAt(absolutePosition) {
  let target = null;
  for (let i = 0; i < wordOffsets.length; i++) {
    if (wordOffsets[i].start <= absolutePosition) {
      target = wordSpans[i];
    } else {
      break;
    }
  }
  if (currentHighlighted && currentHighlighted !== target) {
    currentHighlighted.classList.remove("highlight");
  }
  if (target) {
    target.classList.add("highlight");
    currentHighlighted = target;
  }
}

function clearHighlight() {
  if (currentHighlighted) {
    currentHighlighted.classList.remove("highlight");
    currentHighlighted = null;
  }
}

// ---------- READING ALOUD ----------
let sentences = [];
let currentIndex = 0;
let wordOffset = 0;
let isPlaying = false;
let isPaused = false;
let isTranslating = false;
let runId = 0;
let currentUtterance = null;

function splitIntoSentences(text) {
  const parts = text.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) || [text];
  return parts
    .map(function (p) { return p.trim(); })
    .filter(function (p) { return p.length > 0; });
}

function finishReading() {
  isPlaying = false;
  isPaused = false;
  isTranslating = false;
  currentIndex = 0;
  wordOffset = 0;
  currentUtterance = null;
  clearHighlight();
  playPauseBtn.textContent = "▶";
}

function resetAudio() {
  runId++;
  if (speechSupported) synth.cancel();
  finishReading();
}

function speakCurrentSentence(myRun) {
  if (myRun !== runId) return;
  if (currentIndex >= sentences.length) {
    finishReading();
    return;
  }

  const fullSentence = sentences[currentIndex];
  const startOffset = wordOffset;
  if (startOffset >= fullSentence.length) {
    currentIndex++;
    wordOffset = 0;
    speakCurrentSentence(myRun);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(fullSentence.slice(startOffset));
  currentUtterance = utterance;

  const speed = parseFloat(speedControl.value);
  utterance.rate = isNaN(speed) ? 1 : speed;

  const chosen = getSelectedVoice();
  if (chosen) utterance.voice = chosen;

  utterance.addEventListener("boundary", function (e) {
    if (myRun !== runId) return;
    if (e.name && e.name !== "word") return;
    wordOffset = startOffset + e.charIndex;
    highlightWordAt(sentenceStarts[currentIndex] + wordOffset);
  });

  utterance.addEventListener("end", function () {
    if (myRun !== runId) return;
    currentIndex++;
    wordOffset = 0;
    speakCurrentSentence(myRun);
  });
  utterance.addEventListener("error", function () {
    if (myRun !== runId) return;
    finishReading();
  });

  synth.speak(utterance);
}

function resumeFromCurrentSentence() {
  runId++;
  const myRun = runId;
  synth.cancel();
  setTimeout(function () {
    speakCurrentSentence(myRun);
  }, 60);
}

playPauseBtn.addEventListener("click", async function () {
  if (!speechSupported) return;
  if (isTranslating) return;

  if (!isPlaying) {
    isTranslating = true;
    const myRun = ++runId;
    playPauseBtn.textContent = "…";

    const text = await showTextForCurrentVoice();
    if (myRun !== runId) return;
    if (text === null) { finishReading(); return; }

    isTranslating = false;
    renderWordSpans(text);
    sentences = splitIntoSentences(text);
    sentenceStarts = getSentenceStarts(text, sentences);
    currentIndex = 0;
    wordOffset = 0;
    isPlaying = true;
    isPaused = false;
    playPauseBtn.textContent = "❚❚";
    resumeFromCurrentSentence();
  } else if (isPaused) {
    isPaused = false;
    playPauseBtn.textContent = "❚❚";
    resumeFromCurrentSentence();
  } else {
    isPaused = true;
    runId++;
    synth.cancel();
    playPauseBtn.textContent = "▶";
  }
});

stopBtn.addEventListener("click", resetAudio);

function applyNewSetting() {
  if (isPlaying && !isPaused) {
    resumeFromCurrentSentence();
  }
}
speedControl.addEventListener("change", applyNewSetting);

voiceControl.addEventListener("change", async function () {
  if (getSelectedLanguage() !== displayedLang) {
    resetAudio();
    await showTextForCurrentVoice();
  } else {
    applyNewSetting();
  }
});

// ===============================
// PERSON 1 - SAVED PASSAGES (Home screen library, stored in the browser)
// ===============================
const PASSAGES_KEY = "lexiPassages";
const MAX_SAVED_PASSAGES = 20;

function getSavedPassages() {
  try {
    return JSON.parse(localStorage.getItem(PASSAGES_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function makeTitle(text) {
  const words = text.trim().split(/\s+/);
  const short = words.slice(0, 6).join(" ");
  return words.length > 6 ? short + "…" : short;
}

function savePassage(text) {
  const passages = getSavedPassages();
  passages.unshift({ title: makeTitle(text), text: text });
  localStorage.setItem(PASSAGES_KEY, JSON.stringify(passages.slice(0, MAX_SAVED_PASSAGES)));
  renderPassageList();
}

function renderPassageList() {
  const passages = getSavedPassages();
  const list = document.getElementById("passageList");
  list.innerHTML = "";

  if (passages.length === 0) {
    list.innerHTML = "<p>No passages yet. Go to Reading and tap + to add one.</p>";
    return;
  }

  passages.forEach(function (p) {
    const card = document.createElement("div");
    card.className = "passage";
    card.textContent = p.title;
    card.addEventListener("click", function () {
      loadPassageIntoReader(p.text, p.title);
      showScreen("reading");
    });
    list.appendChild(card);
  });
}
renderPassageList(); // populate Home as soon as the page loads

// ===============================
// PERSON 2 - ADD A PASSAGE (type text, upload a file, or scan a photo)
// ===============================

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
    text = text.split('\n').map((line) => line.trim()).join('\n');
    text = text.replace(/\bl\b/g, 'I').replace(/[“”]/g, '"').replace(/\s+([.,!?;:])/g, '$1');
    return text.trim();
  }

  return { clean };
})();

const FileUploadModule = (() => {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const filePreview = document.getElementById('filePreview');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const removeBtn = document.getElementById('removeFileBtn');
  const processBtn = document.getElementById('processFileBtn');

  if (!dropZone || !fileInput) {
    console.warn('[FileUploadModule] elements not found — skipping init');
    return { init: () => {} };
  }

  let selectedFile = null;

  const ACCEPTED = {
    'text/plain': 'txt',
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/msword': 'doc',
  };
  const MAX_SIZE_MB = 20;

  function validate(file) {
    if (!file) return 'No file selected.';
    const isImage = file.type.startsWith('image/');
    const isAcceptedDoc = ACCEPTED[file.type];
    if (!isImage && !isAcceptedDoc) return `Unsupported file type: ${file.type || 'unknown'}`;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `File too large. Max ${MAX_SIZE_MB}MB.`;
    return null;
  }

  function showPreview(file) {
    selectedFile = file;
    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = formatSize(file.size);
    if (filePreview) filePreview.classList.remove('hidden');
    if (processBtn) processBtn.disabled = false;
  }

  function hidePreview() {
    selectedFile = null;
    if (filePreview) filePreview.classList.add('hidden');
    if (processBtn) processBtn.disabled = true;
    if (fileInput) fileInput.value = '';
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  async function extractText(file) {
    const type = file.type;
    if (type === 'text/plain') return await readTxt(file);
    if (type === 'application/pdf') return await readPdf(file);
    if (type.includes('word')) return await readDocx(file);
    if (type.startsWith('image/')) return await OcrModule.runOnFile(file);
    throw new Error('Unsupported file type for extraction.');
  }

  function readTxt(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read text file.'));
      reader.readAsText(file);
    });
  }

  async function readPdf(file) {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    return fullText;
  }

  async function readDocx(file) {
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);
    const xml = await zip.file('word/document.xml').async('string');
    return xml
      .replace(/<w:p[^>]*>/g, '\n')
      .replace(/<w:tab[^>]*\/>/g, '\t')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }

  function init(onProcess) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const err = validate(file);
      if (err) { App.showToast(err, 'error'); hidePreview(); return; }
      showPreview(file);
    });

    ['dragenter', 'dragover'].forEach((ev) => {
      dropZone.addEventListener(ev, (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach((ev) => {
      dropZone.addEventListener(ev, (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); });
    });
    dropZone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      const err = validate(file);
      if (err) { App.showToast(err, 'error'); hidePreview(); return; }
      showPreview(file);
    });

    if (removeBtn) removeBtn.addEventListener('click', hidePreview);

    if (processBtn) {
      processBtn.addEventListener('click', async () => {
        if (!selectedFile) return;
        processBtn.disabled = true;
        processBtn.textContent = '⏳ Extracting...';
        try {
          const raw = await extractText(selectedFile);
          if (!raw || !raw.trim()) throw new Error('No readable text found in file.');
          onProcess(raw, 'file-upload');
          hidePreview();
        } catch (err) {
          console.error(err);
          App.showToast(err.message || 'Extraction failed.', 'error');
        } finally {
          processBtn.disabled = false;
          processBtn.textContent = 'Extract & Add';
        }
      });
    }
  }

  return { init };
})();

const OcrModule = (() => {
  const imageInput = document.getElementById('imageInput');
  const cameraBtn = document.getElementById('cameraBtn');
  const captureBtn = document.getElementById('captureBtn');
  const video = document.getElementById('cameraStream');
  const imagePreview = document.getElementById('imagePreview');
  const imagePreviewWrap = document.getElementById('imagePreviewWrap');
  const runOcrBtn = document.getElementById('runOcrBtn');
  const progressWrap = document.getElementById('ocrProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');

  let currentImageFile = null;
  let mediaStream = null;

  function setProgress(pct, msg) {
    if (!progressWrap) return;
    progressWrap.classList.remove('hidden');
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressText) progressText.textContent = msg;
  }

  function hideProgress() {
    setTimeout(() => progressWrap && progressWrap.classList.add('hidden'), 1200);
  }

  function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      App.showToast('Please select a valid image.', 'error');
      return;
    }
    currentImageFile = file;
    const url = URL.createObjectURL(file);
    if (imagePreview) imagePreview.src = url;
    if (imagePreviewWrap) imagePreviewWrap.classList.remove('hidden');
    if (runOcrBtn) runOcrBtn.disabled = false;
  }

  async function startCamera() {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (video) {
        video.srcObject = mediaStream;
        video.classList.remove('hidden');
      }
      if (captureBtn) captureBtn.classList.remove('hidden');
    } catch (err) {
      console.error(err);
      App.showToast('Camera access denied or unavailable.', 'error');
    }
  }

  function capturePhoto() {
    if (!mediaStream || !video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], 'capture.png', { type: 'image/png' });
      handleImageFile(file);
      stopCamera();
    }, 'image/png');
  }

  function stopCamera() {
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
    if (video) video.classList.add('hidden');
    if (captureBtn) captureBtn.classList.add('hidden');
  }

  async function runOcr(file) {
    setProgress(0, 'Loading OCR engine...');
    const { data } = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const pct = Math.round((m.progress || 0) * 100);
          setProgress(pct, `Recognizing text... ${pct}%`);
        } else {
          setProgress(0, m.status);
        }
      },
    });
    setProgress(100, 'Done!');
    hideProgress();
    return data.text;
  }

  async function runOnFile(file) {
    return await runOcr(file);
  }

  function init(onProcess) {
    if (imageInput) imageInput.addEventListener('change', (e) => handleImageFile(e.target.files[0]));
    if (cameraBtn) cameraBtn.addEventListener('click', startCamera);
    if (captureBtn) captureBtn.addEventListener('click', capturePhoto);

    if (runOcrBtn) {
      runOcrBtn.addEventListener('click', async () => {
        if (!currentImageFile) return;
        runOcrBtn.disabled = true;
        try {
          const raw = await runOcr(currentImageFile);
          if (!raw || !raw.trim()) throw new Error('No text detected in image.');
          onProcess(raw, 'ocr');
        } catch (err) {
          console.error(err);
          App.showToast(err.message || 'OCR failed.', 'error');
        } finally {
          runOcrBtn.disabled = false;
        }
      });
    }
  }

  return { init, runOnFile };
})();

const TextInputModule = (() => {
  const textarea = document.getElementById('textInput');
  const charCount = document.getElementById('charCount');
  const clearBtn = document.getElementById('clearTextBtn');
  const processBtn = document.getElementById('processTextBtn');

  if (!textarea) {
    console.warn('[TextInputModule] textarea not found');
    return { init: () => {} };
  }

  function updateCharCount() {
    if (charCount) charCount.textContent = textarea.value.length;
  }

  function clear() {
    textarea.value = '';
    updateCharCount();
    textarea.focus();
  }

  function init(onProcess) {
    textarea.addEventListener('input', updateCharCount);
    if (clearBtn) clearBtn.addEventListener('click', clear);
    if (processBtn) {
      processBtn.addEventListener('click', () => {
        const text = textarea.value.trim();
        if (!text) {
          App.showToast('Please enter some text first.', 'error');
          return;
        }
        onProcess(text, 'text-input');
        clear();
      });
    }
    updateCharCount();
  }

  return { init };
})();

const App = (() => {
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message, type = 'info') {
    if (!toastEl) { console.log(`[toast] ${message}`); return; }
    toastEl.textContent = message;
    toastEl.className = `toast ${type}`;
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add('hidden'), 3000);
  }

  const addPassageBtn = document.getElementById('addPassageBtn');
  const addPassagePanel = document.getElementById('addPassagePanel');

  // Adding a passage: clean the text, load it straight into the reader,
  // save it to the Home screen's library, then close the + panel.
  function handleProcessedText(raw, source) {
    const cleaned = TextCleaner.clean(raw);
    if (!cleaned) {
      showToast('Text was empty after cleaning.', 'error');
      return;
    }
    loadPassageIntoReader(cleaned, makeTitle(cleaned));
    savePassage(cleaned);
    if (addPassagePanel) addPassagePanel.classList.add('hidden');
    showToast('Passage added!', 'success');
  }

  function init() {
    if (addPassageBtn && addPassagePanel) {
      addPassageBtn.addEventListener('click', () => {
        addPassagePanel.classList.toggle('hidden');
      });
    }

    TextInputModule.init(handleProcessedText);
    FileUploadModule.init(handleProcessedText);
    OcrModule.init(handleProcessedText);

    if (window.pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { showToast };
})();
