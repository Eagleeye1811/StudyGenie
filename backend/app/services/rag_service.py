# chat.py
from app.services import chromadb_service
from .stt_service import speech_to_text
from .tts_service import text_to_speech_bytes
import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

def retrieve_context(query: str, top_k: int = 3) -> str:
    # Add your collection name here
    collection_name = "nmc-regulations"  
    results = chromadb_service.query(query, top_k, collection_name=collection_name)
    if not results or "documents" not in results:
        return ""
    return " ".join([doc for docs in results["documents"] for doc in docs])


def generate_gemini_response(query: str, context: str) -> str:
    """
    Sends query + context to Gemini API (LLM) and returns answer.
    """
    prompt = f"Answer the question using context:\nContext: {context}\nQuestion: {query}"
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

def rag_interactive(audio_path: str, tts_output_path: str):
    query = speech_to_text(audio_path)
    if "❌" in query or "⚠️" in query:
        return query

    context = retrieve_context(query)
    answer = generate_gemini_response(query, context)
    text_to_speech_bytes(answer, tts_output_path)
    return tts_output_path
