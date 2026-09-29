const express = require("express");
const cors = require("cors");
const { EdgeTTS } = require("node-edge-tts");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 4000;
app.use(cors());
app.use(express.json());
// ===============================
// AUDIO FOLDER
// ===============================
const audioFolder = path.join(__dirname, "audio");
if (!fs.existsSync(audioFolder)) {
    fs.mkdirSync(audioFolder);
}
app.use("/audio", express.static(audioFolder));
// ===============================
// HEALTH CHECK
// ===============================
app.get("/api/health", (req, res) => {
    res.json({
        status: "Backend is working"
    });
});
// ===============================
// READ ALOUD
// ===============================
app.post("/api/read-aloud", async (req, res) => {
    const { text, rate, voice } = req.body;
    console.log("Received text:", text);
    console.log("Received speed:", rate);
    console.log("Received voice:", voice);
    // Check that text was provided
    if (!text || text.trim() === "") {
        return res.status(400).json({
            error: "Text is required"
        });
    }
    // If no rate was received, use normal speed
    const selectedRate = rate || "+0%";
    // If no voice was received, use Aria
    const selectedVoice = voice || "en-US-AriaNeural";
    console.log("Using speed:", selectedRate);
    console.log("Using voice:", selectedVoice);
    try {
        // Create a unique audio filename
        const fileName = "speech-" + Date.now() + ".mp3";
        const filePath = path.join(audioFolder, fileName);
        // Create TTS
        const tts = new EdgeTTS({
            voice: selectedVoice,
            lang: "en-US",
            outputFormat: "audio-24khz-48kbitrate-mono-mp3",
            // IMPORTANT:
            // This receives -25%, +0%, or +25%
            rate: selectedRate
        });
        // Generate speech
        await tts.ttsPromise(
            text.trim(),
            filePath
        );
        console.log("Speech generated successfully.");
        console.log("Audio file:", fileName);
        // Send audio location back to Lexi
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
// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
    console.log(
        "Backend running at http://localhost:" + PORT
    );
});