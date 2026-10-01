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

/* Accessibility Controls */

const readingText = document.getElementById("readingText");

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