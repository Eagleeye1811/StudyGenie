# app/routes/realtime_chat.py
import tempfile
import subprocess
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services import stt_service, tts_service, rag_service, gemini_service
import os

router = APIRouter()
active_sessions = {}

@router.websocket("/ws/assistant")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    session_id = id(websocket)
    active_sessions[session_id] = {"context": ""}

    try:
        while True:
            # Receive audio chunk from frontend
            data = await websocket.receive_bytes()

            # 1️⃣ Save raw browser audio (WebM/Opus) temporarily
            with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp_webm:
                tmp_webm.write(data)
                tmp_webm_path = tmp_webm.name

            # 2️⃣ Convert WebM → WAV mono PCM using ffmpeg
            tmp_wav_path = tmp_webm_path.replace(".webm", ".wav")
            subprocess.run([
                "ffmpeg", "-y", "-i", tmp_webm_path, "-ar", "16000", "-ac", "1", tmp_wav_path
            ], check=True)

            # 3️⃣ STT: convert WAV to text
            user_query = stt_service.speech_to_text(tmp_wav_path)

            # Clean up temp files
            os.remove(tmp_webm_path)
            os.remove(tmp_wav_path)

            if not user_query.strip():
                continue

            # 4️⃣ Optional: send recognized text back to frontend
            await websocket.send_json({"type": "text", "content": user_query})

            # 5️⃣ RAG: retrieve context
            user_session = active_sessions[session_id]
            previous_context = user_session.get("context", "")
            rag_context = rag_service.retrieve_context(user_query)
            combined_context = f"{previous_context} {rag_context}".strip()

            # 6️⃣ LLM: generate answer
            answer = gemini_service.get_answer(user_query, combined_context)

            # Update session context
            user_session["context"] = combined_context + " " + answer

            # 7️⃣ TTS: convert answer to audio bytes
            audio_bytes = tts_service.text_to_speech_bytes(answer)

            # 8️⃣ Send audio bytes back to frontend
            await websocket.send_bytes(audio_bytes)

    except WebSocketDisconnect:
        active_sessions.pop(session_id, None)
        print("Client disconnected")
