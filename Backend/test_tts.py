import asyncio

from services.tts_service import generate_speech


async def main():
    await generate_speech(
        text="Hello. This is a test of the Dyslexia Support App reading engine.",
        output_file="test_reading.mp3"
    )

    print("Speech generated successfully!")


asyncio.run(main())