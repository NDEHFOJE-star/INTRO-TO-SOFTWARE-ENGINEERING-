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

  const utterance = new SpeechSynthesisUtterance(sentences[currentIndex]);

  const speed = parseFloat(speedControl.value);
  utterance.rate = isNaN(speed) ? 1 : speed;

  const chosen = synth.getVoices().find(function (v) {
    return v.name === voiceControl.value;
  });
  if (chosen) utterance.voice = chosen;

  utterance.addEventListener("end", function () {
    if (myRun !== runId) return;
    currentIndex++;
    speakCurrentSentence(myRun);
  });
  utterance.addEventListener("error", function () {
    if (myRun !== runId) return;
    finishReading();
  });

  synth.speak(utterance);
}

// PLAY / PAUSE
playPauseBtn.addEventListener("click", function () {
  if (!isPlaying) {
    // Start from the beginning
    const text = document.getElementById("readingText").innerText;
    sentences = splitIntoSentences(text);
    currentIndex = 0;
    isPlaying = true;
    isPaused = false;
    runId++;
    playPauseBtn.textContent = "❚❚";
    speakCurrentSentence(runId);
  } else if (isPaused) {
    // Continue from the sentence where it stopped
    isPaused = false;
    runId++;
    playPauseBtn.textContent = "❚❚";
    speakCurrentSentence(runId);
  } else {
    // Pause: stop speaking but remember the sentence
    isPaused = true;
    runId++;
    synth.cancel();
    playPauseBtn.textContent = "▶";
  }
});

// STOP
stopBtn.addEventListener("click", resetAudio);

// READING SPEED and VOICE: stop so the next play uses the new setting
speedControl.addEventListener("change", resetAudio);
voiceControl.addEventListener("change", resetAudio);
voiceControl.addEventListener("change", resetAudio);
