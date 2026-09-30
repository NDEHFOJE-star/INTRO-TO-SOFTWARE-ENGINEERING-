const express = require("express");
const cors = require("cors");
const { EdgeTTS } = require("node-edge-tts");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// AUDIO FOLDER
const audioFolder = path.join(__dirname, "audio");
if (!fs.existsSync(audioFolder)) {
    fs.mkdirSync(audioFolder);
}
app.use("/audio", express.static(audioFolder));

// READING SPEED
function getRate(rate) {
    const value = String(rate).toLowerCase().trim();

    if (value.includes("slow")) {
        return "-30%";
    }
    if (value.includes("fast")) {
        return "+30%";
    }

    let number = parseFloat(value);
    if (isNaN(number)) {
        return "default";
    }
    if (number > 3) {
        number = number / 100;
    }
    if (number < 1) {
        return "-30%";
    }
    if (number > 1) {
        return "+30%";
    }
    return "default";
}

// VOICE
function getVoice(voice) {
    const value = String(voice).toLowerCase().trim();

    if (value.includes("guy")) {
        return "en-US-GuyNeural";
    }
    if (value.includes("jenny")) {
        return "en-US-JennyNeural";
    }
    return "en-US-AriaNeural";
}

// HEALTH CHECK
app.get("/api/health", (req, res) => {
    res.json({ status: "Backend is working" });
});

// READ ALOUD
app.post("/api/read-aloud", async (req, res) => {
    const { text, rate, voice } = req.body;

    console.log("Received rate:", rate);
    console.log("Received voice:", voice);

    if (!text || text.trim() === "") {
        return res.status(400).json({ error: "Text is required" });
    }

    const selectedRate = getRate(rate);
    const selectedVoice = getVoice(voice);

    console.log("Using rate:", selectedRate);
    console.log("Using voice:", selectedVoice);

    try {
        const fileName = `speech-${Date.now()}.mp3`;
        const filePath = path.join(audioFolder, fileName);

        const tts = new EdgeTTS({
            voice: selectedVoice,
            lang: "en-US",
            outputFormat: "audio-24khz-48kbitrate-mono-mp3",
            rate: selectedRate
        });

        await tts.ttsPromise(text.trim(), filePath);

        console.log("Audio created:", fileName);
        res.json({ audio_url: `/audio/${fileName}` });

    } catch (error) {
        console.error("TTS ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});