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

// Fill the voice dropdown with the voices this browser has
function loadVoices() {
  let voices = synth.getVoices();
  if (voices.length === 0) return;
  const english = voices.filter(function (v) {
    return v.lang.startsWith("en");
  });
  if (english.length > 0) voices = english;
  voiceControl.innerHTML = "";
  voices.forEach(function (v) {
    voiceControl.add(new Option(v.name + " (" + v.lang + ")", v.name));
  });
}
loadVoices();
synth.addEventListener("voiceschanged", loadVoices);

// Stops the speech and resets the button
function resetAudio() {
  synth.cancel();
  playPauseBtn.textContent = "▶️";
}

// PLAY / PAUSE
playPauseBtn.addEventListener("click", function () {
  if (!synth.speaking) {
    // Start reading
    const text = document.getElementById("readingText").innerText;
    const utterance = new SpeechSynthesisUtterance(text);

    const speed = parseFloat(speedControl.value);
    utterance.rate = isNaN(speed) ? 1 : speed;

    const chosen = synth.getVoices().find(function (v) {
      return v.name === voiceControl.value;
    });
    if (chosen) utterance.voice = chosen;

    utterance.addEventListener("end", function () {
      playPauseBtn.textContent = "▶️";
    });
    utterance.addEventListener("error", function () {
      playPauseBtn.textContent = "▶️";
    });

    synth.speak(utterance);
    playPauseBtn.textContent = "⏸️";
  } else if (synth.paused) {
    synth.resume();
    playPauseBtn.textContent = "⏸️";
  } else {
    synth.pause();
    playPauseBtn.textContent = "▶️";
  }
});

// STOP
stopBtn.addEventListener("click", resetAudio);

// READING SPEED and VOICE: stop so the next play uses the new setting
speedControl.addEventListener("change", resetAudio);
voiceControl.addEventListener("change", resetAudio);
voiceControl.addEventListener("change", resetAudio);
