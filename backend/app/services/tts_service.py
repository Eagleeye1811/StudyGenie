# app/services/tts_service.py
import requests
import os

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")  # make sure this is set in your environment
ELEVENLABS_VOICE = "siw1N9V8LmYeEWKyWBxv"  # you can change to any available voice

def text_to_speech(text: str, output_path: str):
    """
    Convert text to audio using ElevenLabs API and save to output_path.
    """
    if ELEVENLABS_API_KEY is None:
        raise ValueError("ELEVENLABS_API_KEY not set in environment")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "voice_settings": {"stability": 0.7, "similarity_boost": 0.75}
    }

    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        with open(output_path, "wb") as f:
            f.write(response.content)
        return output_path
    else:
        raise Exception(f"TTS failed: {response.text}")
