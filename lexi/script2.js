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
// Now with: pause/resume from the exact word + automatic translation
// ===============================
const synth = window.speechSynthesis;
const playPauseBtn = document.getElementById("playPauseBtn");
const stopBtn = document.getElementById("stopBtn");
const speedControl = document.getElementById("speedControl");
const voiceControl = document.getElementById("voiceControl");
const readingText = document.getElementById("readingText");

const SOURCE_LANG = "en"; // the language your stories are written in

// Fill the voice dropdown: English (Aria, Guy) and French (Denise, Henri).
// If those natural voices aren't on this device, it uses the first two available.
function loadVoices() {
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

  // Remember the current choice so reloading the voice list doesn't reset it
  const previousChoice = voiceControl.value;

  voiceControl.innerHTML = "";
  chosenVoices.forEach(function (v) {
    // Short, friendly name: "Microsoft Aria Online (Natural) - English (United States)" becomes "Aria"
    const shortName = v.name
      .replace(/^(Microsoft|Google)\s*/, "")
      .replace(/\s*-.*$/, "")
      .replace(/\s*\(.*\)/, "")
      .replace(/\s*Online\s*/, "");
    const language = languages[v.lang.slice(0, 2)].label;
    voiceControl.add(new Option(shortName + " (" + language + ")", v.name));
  });

  if (previousChoice) voiceControl.value = previousChoice;
}
loadVoices();
synth.addEventListener("voiceschanged", loadVoices);

function getSelectedVoice() {
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
const originalHTML = readingText.innerHTML; // keeps your story's original layout
let originalText = null;                    // plain text of the original story
let displayedLang = SOURCE_LANG;            // language currently shown on screen
let viewToken = 0;                          // ignores out-of-date translation results
const translationCache = {};                // translate each story only once per language

// Small message line above the story ("Translating...")
const statusEl = document.createElement("div");
statusEl.setAttribute("aria-live", "polite");
statusEl.style.fontSize = "0.9em";
statusEl.style.minHeight = "1.2em";
readingText.parentNode.insertBefore(statusEl, readingText);
function setStatus(message) {
  statusEl.textContent = message;
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


/* FONT */

fontSelect.addEventListener("change", function () {
  readingText.style.fontFamily = this.value;
});


/* FONT SIZE */

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


/* LETTER SPACING */

letterSpacing.addEventListener("input", function () {
  readingText.style.letterSpacing = this.value + "px";
  letterSpacingValue.textContent = this.value + "px";
});


/* WORD SPACING */

wordSpacing.addEventListener("input", function () {
  readingText.style.wordSpacing = this.value + "px";
  wordSpacingValue.textContent = this.value + "px";
});


/* LINE SPACING */

lineSpacing.addEventListener("input", function () {
  readingText.style.lineHeight = this.value;
  lineSpacingValue.textContent = this.value;
});


/* BACKGROUND */

backgroundColor.addEventListener("change", function () {
  readingText.style.backgroundColor = this.value;
  readingText.style.color = "#1a1a1a";
});


/* HIGH CONTRAST */

contrastMode.addEventListener("change", function () {

  if (this.value === "high") {

    readingText.classList.add("high-contrast");

  } else {

    readingText.classList.remove("high-contrast");

    readingText.style.backgroundColor =
      backgroundColor.value;

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

// Shows the story in the language of the selected voice and returns the text to read.
// Returns null if a newer request replaced this one.
async function showTextForCurrentVoice() {
  const token = ++viewToken;

  // Capture the original text while the original is on screen
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

// ---------- READING ALOUD ----------
// The text is read one sentence at a time, so Pause can continue
// from the word where it stopped (browser pause/resume is unreliable).
let sentences = [];
let currentIndex = 0;
let wordOffset = 0; // where inside the current sentence to continue from (updated word by word)
let isPlaying = false;
let isPaused = false;
let isTranslating = false;
let runId = 0; // changes on every start/pause/stop so old events are ignored
let currentUtterance = null; // keep a reference so the browser doesn't garbage-collect it mid-speech

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
  playPauseBtn.textContent = "▶";
}

// Stops everything and resets the button
function resetAudio() {
  runId++;
  synth.cancel();
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

  // Only speak the part of the sentence that hasn't been read yet
  const utterance = new SpeechSynthesisUtterance(fullSentence.slice(startOffset));
  currentUtterance = utterance;

  const speed = parseFloat(speedControl.value);
  utterance.rate = isNaN(speed) ? 1 : speed;

  const chosen = getSelectedVoice();
  if (chosen) utterance.voice = chosen;

  // Track the word being spoken, so Pause knows exactly where to continue.
  // (Voices that don't send word events fall back to the start of the sentence part.)
  utterance.addEventListener("boundary", function (e) {
    if (myRun !== runId) return;
    if (e.name && e.name !== "word") return;
    wordOffset = startOffset + e.charIndex;
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

// Continue from the current word with a short delay
// (some browsers drop speech that starts right after cancel())
function resumeFromCurrentSentence() {
  runId++;
  const myRun = runId;
  synth.cancel();
  setTimeout(function () {
    speakCurrentSentence(myRun);
  }, 60);
}

// PLAY / PAUSE
playPauseBtn.addEventListener("click", async function () {
  if (isTranslating) return;

  if (!isPlaying) {
    // Start from the beginning: show the story in the voice's language first
    isTranslating = true;
    const myRun = ++runId;
    playPauseBtn.textContent = "…";

    const text = await showTextForCurrentVoice();
    if (myRun !== runId) return;          // Stop was pressed while translating
    if (text === null) { finishReading(); return; }

    isTranslating = false;
    sentences = splitIntoSentences(text);
    currentIndex = 0;
    wordOffset = 0;
    isPlaying = true;
    isPaused = false;
    playPauseBtn.textContent = "❚❚";
    resumeFromCurrentSentence();
  } else if (isPaused) {
    // Continue from the word where it stopped
    isPaused = false;
    playPauseBtn.textContent = "❚❚";
    resumeFromCurrentSentence();
  } else {
    // Pause: stop speaking but remember the sentence AND the word (currentIndex, wordOffset)
    isPaused = true;
    runId++;
    synth.cancel();
    playPauseBtn.textContent = "▶";
  }
});

// STOP
stopBtn.addEventListener("click", resetAudio);

// READING SPEED: keep the position.
// - Playing: continue from the current word with the new setting.
// - Paused: the new setting is used when you press play.
function applyNewSetting() {
  if (isPlaying && !isPaused) {
    resumeFromCurrentSentence();
  }
}
speedControl.addEventListener("change", applyNewSetting);

// VOICE: same language = keep the position.
// Different language = stop, then show the story translated (or the original).
voiceControl.addEventListener("change", async function () {
  if (getSelectedLanguage() !== displayedLang) {
    resetAudio();
    await showTextForCurrentVoice();
  } else {
    applyNewSetting();
  }
});
});
