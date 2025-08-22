import tempfile
import subprocess
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services import stt_service, tts_service, rag_service, gemini_service
import os
import base64

router = APIRouter()
active_sessions = {}

@router.websocket("/ws/assistant")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    session_id = id(websocket)
    active_sessions[session_id] = {"context": "", "collection": None}

    try:
        while True:
            message = await websocket.receive()

            # If frontend sends JSON (text message)
            if "text" in message:
                data = message["text"]
                if data.startswith("SET_COLLECTION:"):
                    collection_name = data.replace("SET_COLLECTION:", "").strip()
                    active_sessions[session_id]["collection"] = collection_name
                    continue

            # If frontend sends audio (binary)
            if "bytes" in message:
                data = message["bytes"]

                # same as your flow...
                with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp_webm:
                    tmp_webm.write(data)
                    tmp_webm_path = tmp_webm.name

                tmp_wav_path = tmp_webm_path.replace(".webm", ".wav")
                subprocess.run([
                    "ffmpeg", "-y", "-i", tmp_webm_path, "-ar", "16000", "-ac", "1", tmp_wav_path
                ], check=True)

                user_query = stt_service.speech_to_text(tmp_wav_path)

                os.remove(tmp_webm_path)
                os.remove(tmp_wav_path)

                if not user_query.strip():
                    continue

                await websocket.send_json({"type": "user", "content": user_query})

                # ✅ Use dynamic collection
                user_session = active_sessions[session_id]
                collection_name = user_session.get("collection")
                if not collection_name:
                    await websocket.send_json({
                        "type": "error",
                        "message": "No collection selected. Please set collection first."
                    })
                    continue

                rag_context = rag_service.retrieve_context(user_query, collection_name)
                combined_context = f"{user_session['context']} {rag_context}".strip()

                answer = gemini_service.get_answer(user_query, combined_context)

                user_session["context"] = combined_context + " " + answer

                audio_bytes = tts_service.text_to_speech_bytes(answer)
                audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

                await websocket.send_json({
                    "type": "assistant",
                    "text": answer,
                    "audio": audio_b64
                })

    except WebSocketDisconnect:
        active_sessions.pop(session_id, None)
        print("Client disconnected")
