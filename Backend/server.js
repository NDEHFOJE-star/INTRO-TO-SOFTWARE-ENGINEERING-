const express = require("express");
const cors = require("cors");
const { EdgeTTS } = require("node-edge-tts");
const path = require("path");

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

const audioFolder = path.join(__dirname, "audio");

const fs = require("fs");

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

    try {
        const fileName = `speech-${Date.now()}.mp3`;
        const filePath = path.join(audioFolder, fileName);

        const tts = new EdgeTTS({
            voice: voice || "en-US-AriaNeural",
            lang: "en-US",
            outputFormat: "audio-24khz-48kbitrate-mono-mp3"
        });

        await tts.synthesize(
            text.trim(),
            filePath
        );

        res.json({
            message: "Speech generated successfully",
            audio_url: `/audio/${fileName}`
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Could not generate speech"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});