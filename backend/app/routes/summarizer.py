from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services import pdf_service, gemini_service, chromadb_service, tts_service, mongodb_service
from app.models.schemas import SummarizeResponse
from app.services.cloudinary_services import upload_audio_to_cloudinary
import os

# Ensure directories exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("audio", exist_ok=True)

router = APIRouter()

# 6️⃣ Get precise flashcard bullets from summary
@router.get("/flashcards/{summary_id}")
async def get_flashcard_bullets(summary_id: str):
    summary_data = mongodb_service.get_summaries_by_id(summary_id)
    if not summary_data or not summary_data[0].get("summary"):
        raise HTTPException(status_code=404, detail="Summary not found")
    combined = summary_data[0]["summary"]
    # Use Gemini to get 10 precise bulleted points
    bullets = gemini_service.get_precise_bullets(combined, num_bullets=10)
    return {"bullets": bullets}
# -----------------------------
# 1️⃣ Generate Quiz (matches React GET)
# -----------------------------
@router.get("/quiz/{summary_id}")
async def get_quiz_by_id(summary_id: str, timed: bool = False):
    """
    Generate a quiz for a given summary_id and return quiz + quiz_id.
    """
    summary_data = mongodb_service.get_summaries_by_id(summary_id)
    if not summary_data or not summary_data[0].get("summary"):
        raise HTTPException(status_code=404, detail="Summary not found")
    
    combined = summary_data[0]["summary"]
    
    # Always generate a new quiz using Gemini
    quiz_data = gemini_service.get_quiz(combined)
    if not quiz_data:
        raise HTTPException(status_code=404, detail="Quiz generation failed")

    # Do NOT store quiz in MongoDB, just return fresh quiz
    return {
        "quiz_id": None,
        "questions": quiz_data
    }

# -----------------------------
# 2️⃣ Submit Score
# -----------------------------
@router.post("/quiz/submit/{quiz_id}")
async def submit_quiz_score(quiz_id: str, score: int = Form(...)):
    """
    Submit score for a quiz by quiz_id and update in MongoDB.
    """
    quizzes_collection = mongodb_service.db["quizzes"]
    result = quizzes_collection.update_one(
        {"_id": mongodb_service.ObjectId(quiz_id)},
        {"$set": {"score": score}}
    )
    if result.modified_count == 0:
        return {"message": "Quiz not found or score unchanged"}
    return {"message": "Score updated successfully", "score": score}

# -----------------------------
# 3️⃣ Summarize PDF
# -----------------------------
@router.post("/pdf", response_model=SummarizeResponse)
async def summarize_pdf(file: UploadFile = File(...), name: str = Form(...)):
    """
    Upload PDF, extract text, generate summary, store summary & audio.
    """
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    base_id = os.path.splitext(file.filename)[0]

    # Extract chunks & embeddings
    chunks = pdf_service.extract_chunks(file_path)
    embeddings = pdf_service.get_embeddings(chunks)

    # Store in ChromaDB
    chromadb_service.store_chunks(chunks, embeddings, base_id)

    # Fetch combined content
    combined = chromadb_service.fetch_combined(base_id)

    # Generate summary (no random tag here)
    summary = gemini_service.get_summary(combined)

    # Store summary in ChromaDB
    chromadb_service.store_summary(summary, collection_name=f"{base_id}_summary", pdf_filename=file.filename)

    # Generate audio locally
    audio_path = f"audio/{base_id}_summary.mp3"
    await tts_service.generate_audio(summary, audio_path)

    # Upload to Cloudinary
    cloudinary_url = upload_audio_to_cloudinary(audio_path)

    # Store summary in MongoDB
    summary_id = mongodb_service.store_summary(summary, file.filename, cloudinary_url, name)

    return SummarizeResponse(
        name=name,
        score=0,
        summary=summary,
        audio_path=audio_path,
        summary_id=summary_id
    )

# -----------------------------
# 4️⃣ Get all summaries
# -----------------------------
@router.get("/summaries")
async def get_summaries():
    return mongodb_service.get_summaries()

# -----------------------------
# 5️⃣ Get summary by ID
# -----------------------------
@router.get("/summaries/{summary_id}")
async def get_summary_by_id(summary_id: str):
    return mongodb_service.get_summaries_by_id(summary_id)
