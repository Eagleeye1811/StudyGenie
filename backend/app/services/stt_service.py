# app/services/stt_service.py
import os
from vosk import Model, KaldiRecognizer
import wave
import json

# -----------------------------
# Load Vosk model
# -----------------------------
# Choose either small or full model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../vosk-model-en-us-0.22/vosk-model-en-us-0.22")
model = None
try:
    model = Model(MODEL_PATH)
    print("Vosk model loaded successfully!")
except Exception as e:
    print(f"Warning: Failed to load Vosk model: {str(e)}")
    print("Speech-to-text functionality will be disabled. Download the model from https://alphacephei.com/vosk/models")

# -----------------------------
# Speech-to-Text function
# -----------------------------
def speech_to_text(audio_file_path: str) -> str:
    """
    Convert speech in a WAV file to text using Vosk.
    Args:
        audio_file_path (str): path to the WAV file
    Returns:
        str: transcribed text
    """
    if model is None:
        return "[Speech-to-text model not available. Please install the Vosk model.]"
        
    wf = wave.open(audio_file_path, "rb")

    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() not in [8000, 16000, 44100]:
     raise ValueError("Audio file must be WAV format mono PCM")


    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)

    result_text = ""
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            res = json.loads(rec.Result())
            result_text += " " + res.get("text", "")
    # Get final partial result
    res = json.loads(rec.FinalResult())
    result_text += " " + res.get("text", "")

    return result_text.strip()
