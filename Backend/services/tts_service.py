import edge_tts


async def generate_speech(
    text: str,
    output_file: str,
    voice: str = "en-US-AriaNeural",
    rate: str = "+0%"
):
    communicate = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=rate
    )

    await communicate.save(output_file)

    return output_file