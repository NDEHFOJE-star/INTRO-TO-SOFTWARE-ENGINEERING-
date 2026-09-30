// PERSON 3 - READING  Engine BACKEND
const express = require("express");
const cors = require("cors");
const { EdgeTTS } = require("node-edge-tts");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const audioFolder = path.join(__dirname, "audio");

if (!fs.existsSync(audioFolder)) {
    fs.mkdirSync(audioFolder);
}

app.use("/audio", express.static(audioFolder));

app.get("/api/health", (req, res) => {
    res.json({
        status: "Backend is working"
    });
});

app.post("/api/read-aloud", async (req, res) => {
    const { text, rate, voice } = req.body;

    if (!text || text.trim() === "") {
        return res.status(400).json({
            error: "Text is required"
        });
    }

    const selectedRate = rate || "+0%";
    const selectedVoice = voice || "en-US-AriaNeural";

    try {
        const fileName = "speech-" + Date.now() + ".mp3";
        const filePath = path.join(audioFolder, fileName);

        const tts = new EdgeTTS({
            voice: selectedVoice,
            lang: "en-US",
            outputFormat: "audio-24khz-48kbitrate-mono-mp3",
            rate: selectedRate
        });

        await tts.ttsPromise(text.trim(), filePath);

        res.json({
            audio_url: "/audio/" + fileName
        });

    } catch (error) {
        console.error("TTS ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log("Backend running at http://localhost:" + PORT);
});