from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services import chromadb_service, gemini_service, tts_service
from app.services.cloudinary_services import upload_audio_to_cloudinary
from app.models.schemas import ChatResponse
import os
import time
import aiofiles

# Ensure directories exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("audio", exist_ok=True)

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(
    file: UploadFile = File(None),  # Optional audio input
    query: str = Form(None)         # Optional text input
):
    """
    Chat endpoint: accepts either audio or text query.
    Returns: Bot response in text + audio URL
    """
    if not file and not query:
        raise HTTPException(status_code=400, detail="❌ No input provided.")

    # 1️⃣ If audio, convert to text using STT
    if file:
        file_path = f"uploads/{int(time.time())}_{file.filename}"
        try:
            async with aiofiles.open(file_path, "wb") as f:
                await f.write(await file.read())

            from app.services.stt_service import speech_to_text
            query = speech_to_text(file_path)

            if not query.strip():
                raise HTTPException(status_code=400, detail="⚠️ Speech-to-text failed, no words detected.")
        finally:
            # Clean up uploaded file after processing
            if os.path.exists(file_path):
                os.remove(file_path)

    # 2️⃣ Retrieve context from ChromaDB
    context = chromadb_service.query(query, top_k=3)
    combined_context = " ".join([doc for docs in context.get("documents", []) for doc in docs]) or ""

    # 3️⃣ Generate response using Gemini
    response_text = gemini_service.get_answer(query, combined_context)

    # 4️⃣ Convert response to speech
    audio_filename = f"audio/chat_{int(time.time())}.mp3"
    await tts_service.generate_audio(response_text, audio_filename)

    # 5️⃣ Upload to Cloudinary for access
    audio_url = upload_audio_to_cloudinary(audio_filename)

    # Clean up local audio file after upload
    if os.path.exists(audio_filename):
        os.remove(audio_filename)

    return ChatResponse(text=response_text, audio_url=audio_url)