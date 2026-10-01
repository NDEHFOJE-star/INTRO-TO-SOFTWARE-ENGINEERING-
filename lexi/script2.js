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
}

// NOTE: the play/pause button is intentionally not wired up.
// It's a UI component only — Person 3 attaches the real
// text-to-speech logic (play/pause/resume/stop) to it.
// ==============================
// FONT TOGGLE
// ==============================

var fontSelect = document.getElementById('fontSelect');
var increaseFont = document.getElementById('increaseFont');
var decreaseFont = document.getElementById('decreaseFont');
var fontSizeDisplay = document.getElementById('fontSizeDisplay');

var currentFontSize = 20;


// Change reading font
fontSelect.addEventListener('change', function() {

  readingText.style.fontFamily = this.value;

});


// Increase font size
increaseFont.addEventListener('click', function() {

  if (currentFontSize < 32) {
    currentFontSize += 2;
  }

  readingText.style.fontSize = currentFontSize + 'px';

  fontSizeDisplay.textContent = currentFontSize + 'px';

});


// Decrease font size
decreaseFont.addEventListener('click', function() {

  if (currentFontSize > 12) {
    currentFontSize -= 2;
  }

  readingText.style.fontSize = currentFontSize + 'px';

  fontSizeDisplay.textContent = currentFontSize + 'px';

});
