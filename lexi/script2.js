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



// ===============================
// PERSON 3 - TEXT TO SPEECH
// ===============================

const BACKEND_URL = "http://127.0.0.1:8000";

const playPauseBtn = document.getElementById("playPauseBtn");

let audio = null;

playPauseBtn.addEventListener("click", async function () {

    const textElement = document.getElementById("readingText");
    const text = textElement.innerText;

    if (!audio) {
         try{
        const response = await fetch(`${BACKEND_URL}/api/read-aloud`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text,
                rate:document.getElementById("speedControl").value,
                voice:document.getElementById("voiceControl").value
            })
        });

        if(!response.ok){
            throw new Error ("Speech generation failed.");
        }
        const data = await response.json();

        audio = new Audio(
            `${BACKEND_URL}${data.audio_url}?t=${Date.now()}`
        );
        audio.addEventListener("ended", function () {
    audio = null;

    playPauseBtn.textContent = "▶"

       });

        audio.play();
    playPauseBtn.text = "⏸️"
           
} catch (error) {
               console.error(error);
               alert("Could not generate speech.");
           }

      } else {

        if (audio.paused) {
            audio.play();
            playPauseBtn.textContent = "⏸️"
         } else {
            audio.pause();
            playPauseBtn.textContent = "▶"
        }

    }

});
const stopBtn = document.getElementById("stopBtn");

stopBtn.addEventListener("click", function () {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        playPauseBtn.textContent = "▶"
    }
});
const speedControl = document.getElementById("speedControl");

speedControl.addEventListener("change", function () {
    if (audio) {
        audio.pause();
        audio = null;

    }
  
});
const voiceControl = document.getElementById("voiceControl");

voiceControl.addEventListener("change", function () {
    if (audio) {
        audio.pause();
        audio = null;
    }
});



// NOTE: the play/pause button is intentionally not wired up.
// It's a UI component only — Person 3 attaches the real
// text-to-speech logic (play/pause/resume/stop) to it. 