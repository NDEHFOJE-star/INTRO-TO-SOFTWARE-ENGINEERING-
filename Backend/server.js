const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        status: "Backend is working"
    });
});

app.post("/api/read-aloud", (req, res) => {
    const { text, rate, voice } = req.body;

    if (!text || text.trim() === "") {
        return res.status(400).json({
            error: "Text is required"
        });
    }

    res.json({
        message: "Reading request received",
        text: text.trim(),
        rate: rate || "normal",
        voice: voice || "default"
    });
});

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});