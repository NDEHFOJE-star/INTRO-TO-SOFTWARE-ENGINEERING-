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
// ===============================
const synth = window.speechSynthesis;
const playPauseBtn = document.getElementById("playPauseBtn");
const stopBtn = document.getElementById("stopBtn");
const speedControl = document.getElementById("speedControl");
const voiceControl = document.getElementById("voiceControl");

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

// The text is read one sentence at a time, so Pause can continue
// from the sentence where it stopped (browser pause/resume is unreliable).
let sentences = [];
let currentIndex = 0;
let isPlaying = false;
let isPaused = false;
let runId = 0; // changes on every start/pause/stop so old events are ignored
let wordOffset = 0; // where inside the current sentence to continue from (updated word by word)
let currentUtterance = null; // FIX: keep a reference so the browser doesn't garbage-collect it mid-speech

function splitIntoSentences(text) {
  const parts = text.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) || [text];
  return parts
    .map(function (p) { return p.trim(); })
    .filter(function (p) { return p.length > 0; });
}

function finishReading() {
  isPlaying = false;
  isPaused = false;
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

  const chosen = synth.getVoices().find(function (v) {
    return v.name === voiceControl.value;
  });
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
playPauseBtn.addEventListener("click", function () {
  if (!isPlaying) {
    // Start from the beginning
    const text = document.getElementById("readingText").innerText;
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

// READING SPEED and VOICE: keep the position.
// - Playing: continue from the current word with the new setting.
// - Paused: the new setting is used when you press play.
// - Not started: nothing to do.
function applyNewSetting() {
  if (isPlaying && !isPaused) {
    resumeFromCurrentSentence();
  }
}
speedControl.addEventListener("change", applyNewSetting);
voiceControl.addEventListener("change", applyNewSetting);
