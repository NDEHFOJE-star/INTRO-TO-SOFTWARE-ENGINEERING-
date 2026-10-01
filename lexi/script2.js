// Navigation between screens
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
}


// ==============================
// WORD HIGHLIGHTING + TEXT TO SPEECH
// ==============================

var speech = window.speechSynthesis;

var readingText = document.getElementById('readingText');
var playPauseBtn = document.getElementById('playPauseBtn');
var stopBtn = document.getElementById('stopBtn');

var utterance = null;
var words = [];
var isPaused = false;


// Convert the reading paragraph into individual word spans
function prepareWords() {
  var text = readingText.textContent;

  readingText.innerHTML = '';

  words = [];

  var parts = text.split(/(\s+)/);

  for (var i = 0; i < parts.length; i++) {

    if (parts[i] === '') {
      continue;
    }

    if (/^\s+$/.test(parts[i])) {

      readingText.appendChild(
        document.createTextNode(parts[i])
      );

    } else {

      var span = document.createElement('span');

      span.textContent = parts[i];
      span.className = 'reading-word';

      readingText.appendChild(span);

      words.push(span);
    }
  }
}


// Remove the yellow highlight from every word
function clearHighlight() {

  for (var i = 0; i < words.length; i++) {
    words[i].classList.remove('word-highlight');
  }
}


// Highlight the word currently being spoken
function highlightWord(charIndex) {

  clearHighlight();

  var textPosition = 0;

  for (var i = 0; i < words.length; i++) {

    var word = words[i].textContent;

    var start = textPosition;
    var end = textPosition + word.length;

    if (charIndex >= start && charIndex < end) {

      words[i].classList.add('word-highlight');

      // Keep the currently spoken word visible
      words[i].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });

      return;
    }

    textPosition = end;

    // Account for the space after each word
    textPosition++;
  }
}


// Start reading the passage
function startReading() {

  speech.cancel();

  prepareWords();

  var text = readingText.textContent;

  utterance = new SpeechSynthesisUtterance(text);

  utterance.rate = 1;

  utterance.onboundary = function(event) {

    if (event.name === 'word') {
      highlightWord(event.charIndex);
    }
  };


  utterance.onend = function() {

    clearHighlight();

    playPauseBtn.textContent = '▶';

    isPaused = false;
  };


  speech.speak(utterance);

  playPauseBtn.textContent = '⏸';

  isPaused = false;
}


// Play / Pause button
playPauseBtn.addEventListener('click', function() {

  if (!speech.speaking && !speech.paused) {

    startReading();

    return;
  }


  if (speech.speaking && !speech.paused) {

    speech.pause();

    playPauseBtn.textContent = '▶';

    isPaused = true;

    return;
  }


  if (speech.paused) {

    speech.resume();

    playPauseBtn.textContent = '⏸';

    isPaused = false;
  }

});


// Stop button
stopBtn.addEventListener('click', function() {

  speech.cancel();

  clearHighlight();

  playPauseBtn.textContent = '▶';

  isPaused = false;
});
