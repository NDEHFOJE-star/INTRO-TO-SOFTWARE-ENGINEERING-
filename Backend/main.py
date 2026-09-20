from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from Backend.services.tts_service import generate_speech


app = FastAPI(
    title="Dyslexia Support App API",
    description="Backend API for the reading engine",
    version="1.0.0"
)


AUDIO_DIR = Path("Backend/audio")
AUDIO_DIR.mkdir(exist_ok=True)


app.mount(
    "/audio",
    StaticFiles(directory=AUDIO_DIR),
    name="audio"
)


class SpeechRequest(BaseModel):
    text: str
    voice: str = "en-US-AriaNeural"
    rate: str = "+0%"


@app.get("/")
def home():
    return {
        "message": "Dyslexia Support App API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/api/read-aloud")
async def read_aloud(request: SpeechRequest):

    if not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty."
        )

    output_file = AUDIO_DIR / "reading.mp3"

    try:
        await generate_speech(
            text=request.text,
            output_file=str(output_file),
            voice=request.voice,
            rate=request.rate
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Speech generation failed: {error}"
        )

    return {
        "message": "Speech generated successfully",
        "audio_url": "/audio/reading.mp3"
    }