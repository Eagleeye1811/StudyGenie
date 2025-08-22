import os
import json
import random
import string
import requests
from app.config import GEMINI_API_KEY

# Helper: randomness for unique quizzes
def random_tag(length: int = 6) -> str:
    """Generate a random string of given length to add variety in quiz prompts."""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

# --- Utility: Safe JSON parsing with auto-repair ---
def safe_json_parse(text: str, fallback=None):
    """Try to parse JSON, attempt minimal repair if needed."""
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        print(f"⚠️ JSON parsing error: {e}\nRaw Gemini output: {text[:500]}...")
        # Try trimming at last closing bracket
        if "]" in text:
            repaired = text[: text.rfind("]") + 1]
            try:
                return json.loads(repaired)
            except:
                pass
        return fallback if fallback is not None else []

#  Summary function (deterministic)
def get_summary(text: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={GEMINI_API_KEY}"

    prompt = f"""
    Summarize the following technical content into 4–6 bullet points or short paragraphs. 
    Make it concise and easy to understand for students.

    Content:
    {text}
    """

    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    else:
        raise Exception(f"Gemini API Error: {response.text}")

#  Quiz function (always unique)
def get_quiz(summary: str) -> list:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={GEMINI_API_KEY}"
    unique_tag = random_tag()

    prompt = f"""
    You are a quiz generator. Generate exactly 5 multiple-choice questions based ONLY on the summary below.

    Rules:
    - Each question must have exactly 4 options.
    - Provide the correct option explicitly in the "answer" field.
    - Output must be STRICT JSON with no markdown, no extra text.
    - JSON format: 
    [
      {{"question": "...", "options": ["A","B","C","D"], "answer": "..."}},
      ...
    ]

    Randomizer Key: {unique_tag}

    Summary:
    {summary}
    """

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.9,
            "topP": 0.95,
            "topK": 40,
            "maxOutputTokens": 512
        }
    }

    headers = {"Content-Type": "application/json"}
    res = requests.post(url, headers=headers, json=payload)

    if res.status_code == 200:
        response_data = res.json()
        text = response_data['candidates'][0]['content']['parts'][0]['text'].strip()

        # Remove wrappers
        if text.startswith("```"):
            start_idx = text.find("[")
            end_idx = text.rfind("]") + 1
            text = text[start_idx:end_idx]

        # ✅ Use safe_json_parse
        quiz_json = safe_json_parse(text, fallback=[
            {
                "question": "Fallback Question?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "answer": "Option A"
            }
        ])
        return quiz_json
    else:
        raise Exception(f"Gemini Quiz API failed: {res.text}")

# Precise bullet summary for flashcards
def get_precise_bullets(text: str, num_bullets: int = 10) -> list:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={GEMINI_API_KEY}"

    prompt = f"""
    Summarize the following into precise, important, technical points for students. 
    Each point should be concise and suitable for a flashcard. 
    Output STRICT JSON as an array of strings (no markdown, no extra text). 
    Provide up to {num_bullets} points, only the most important.

    Content:
    {text}
    """

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.9,
            "topK": 40,
            "maxOutputTokens": 512
        }
    }
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"].strip()

        if text.startswith("```"):
            start_idx = text.find("[")
            end_idx = text.rfind("]") + 1
            text = text[start_idx:end_idx]

        # ✅ Use safe_json_parse
        bullets = safe_json_parse(text, fallback=[])
        return bullets
    else:
        raise Exception(f"Gemini API Error: {response.text}")

def get_answer(query: str, context: str) -> str:
    """
    Generates an answer using Gemini API given a user query and context.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={GEMINI_API_KEY}"
    prompt = f"""
    You are an AI assistant. Answer the following question based on the provided context.

    Context:
    {context}

    Question:
    {query}

    Provide a concise, clear, and informative answer.
    """

    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    headers = {"Content-Type": "application/json"}

    res = requests.post(url, headers=headers, json=payload)
    if res.status_code == 200:
        return res.json()['candidates'][0]['content']['parts'][0]['text'].strip()
    else:
        raise Exception(f"Gemini API failed (answer): {res.text}")

