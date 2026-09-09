from fastapi import FastAPI

app = FastAPI(
title="Dyslexia Support App API",
description="Backend API for the reading engine",
version="1.0.0"
)

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