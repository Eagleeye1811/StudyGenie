# real_time_assistant.py
import sys
import os
import queue
import json
import asyncio
import tempfile
import sounddevice as sd
import numpy as np
import noisereduce as nr
import soundfile as sf
import subprocess

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services import chromadb_service, gemini_service, tts_service
from app.services import stt_service  # Whisper STT

# -----------------------------
# Configuration
# -----------------------------
SAMPLE_RATE = 16000  # Hz
DEFAULT_COLLECTION = "all_summaries"
AUDIO_CHUNK_SECONDS = 3  # duration of each chunk to send to STT

# Audio queue
q = queue.Queue()

# -----------------------------
# Microphone callback
# -----------------------------
def callback(indata, frames, time, status):
    if status:
        print(status, file=sys.stderr)
    q.put(indata.copy())

# -----------------------------
# Process audio chunk (denoise + convert to 16bit PCM)
# -----------------------------
def process_audio_chunk(chunk: np.ndarray):
    # Convert float32 [-1,1] -> int16
    chunk_int16 = np.int16(chunk * 32767)
    # Denoise
    chunk_denoised = nr.reduce_noise(y=chunk_int16, sr=SAMPLE_RATE)
    return chunk_denoised

# -----------------------------
# Main async assistant
# -----------------------------
async def main():
    print("🎙️ Assistant started. Say something...")

    # Start microphone stream
    with sd.InputStream(samplerate=SAMPLE_RATE, channels=1, dtype='float32', callback=callback):
        buffer = np.zeros((0,), dtype=np.float32)
        while True:
            chunk = q.get()
            buffer = np.concatenate([buffer, chunk[:, 0]])  # flatten to 1D

            # Once we have enough audio for a chunk
            if len(buffer) >= SAMPLE_RATE * AUDIO_CHUNK_SECONDS:
                audio_chunk = buffer[:SAMPLE_RATE * AUDIO_CHUNK_SECONDS]
                buffer = buffer[SAMPLE_RATE * AUDIO_CHUNK_SECONDS:]

                # Process audio
                audio_processed = process_audio_chunk(audio_chunk)

                # Save temp file for Whisper
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                    sf.write(tmp.name, audio_processed, SAMPLE_RATE)
                    tmp_file_path = tmp.name

                # -----------------------------
                # 1️⃣ STT: convert speech to text
                # -----------------------------
                user_query = stt_service.speech_to_text(tmp_file_path)
                os.remove(tmp_file_path)  # cleanup temp file

                if not user_query.strip():
                    continue
                print("🗣️ You said:", user_query)

                # -----------------------------
                # 2️⃣ Retrieve context from ChromaDB
                # -----------------------------
                try:
                    chromadb_service.client.get_or_create_collection(name=DEFAULT_COLLECTION)
                    context_result = chromadb_service.query(
                        user_query, top_k=3, collection_name=DEFAULT_COLLECTION
                    )
                    combined_context = " ".join(
                        [doc for docs in context_result.get("documents", []) for doc in docs]
                    )
                except Exception as e:
                    print("⚠️ ChromaDB query failed:", e)
                    combined_context = ""

                # -----------------------------
                # 3️⃣ Generate answer from Gemini
                # -----------------------------
                try:
                    answer = gemini_service.get_answer(user_query, combined_context)
                    print("🤖 Assistant:", answer)
                except Exception as e:
                    answer = "⚠️ Sorry, I could not generate an answer."
                    print("⚠️ Gemini error:", e)

                # -----------------------------
                # 4️⃣ Convert answer → speech using ElevenLabs
                # -----------------------------
                try:
                    output_audio = "assistant_response.mp3"
                    tts_service.text_to_speech(answer, output_audio)
                    subprocess.run(["afplay", output_audio])  # Mac audio
                except Exception as e:
                    print("⚠️ TTS error:", e)

# -----------------------------
# Run assistant
# -----------------------------
if __name__ == "__main__":
    asyncio.run(main())
