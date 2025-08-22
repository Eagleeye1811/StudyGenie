# app/services/tts_service.py
import requests
import os

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE = "siw1N9V8LmYeEWKyWBxv"  # change if needed

def text_to_speech_file(text: str, output_path: str):
    """
    Convert text to audio using ElevenLabs API and save to file.
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


def text_to_speech_bytes(text: str) -> bytes:
    """
    Convert text to audio using ElevenLabs API and return raw bytes (no temp file).
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
        return response.content  # raw audio bytes
    else:
        raise Exception(f"TTS failed: {response.text}")
