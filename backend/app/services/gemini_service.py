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
    You are a quiz generator. Generate **5 unique multiple-choice questions** based ONLY on the following summary.
    Requirements:
    - Each question must have exactly 4 options.
    - Specify clearly which option is correct.
    - Format your output strictly as a JSON array of objects, each with keys:
        "question", "options" (array), "answer"
    - Do not include markdown, explanations, or any extra text.
    - Ensure questions are varied every time this prompt is used.

    Randomizer Key: {unique_tag}  # <-- ensures new set each call

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

        # Remove markdown/code block wrappers and extract JSON array
        if text.startswith("```"):
            start_idx = text.find("[")
            end_idx = text.rfind("]") + 1
            text = text[start_idx:end_idx]
        # Remove any leading/trailing text before/after JSON array
        if not text.startswith("["):
            start_idx = text.find("[")
            if start_idx != -1:
                text = text[start_idx:]
        if not text.endswith("]"):
            end_idx = text.rfind("]")
            if end_idx != -1:
                text = text[:end_idx+1]

        try:
            quiz_json = json.loads(text)
            return quiz_json
        except Exception as e:
            print(f"⚠️ JSON parsing error: {e}\nRaw Gemini output: {text}")
            # fallback single question
            return [
                {
                    "question": "Fallback Question?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "answer": "Option A"
                }
            ]
    else:
        raise Exception(f"Gemini Quiz API failed: {res.text}")

# Precise bullet summary for flashcards
def get_precise_bullets(text: str, num_bullets: int = 10) -> list:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={GEMINI_API_KEY}"

    prompt = f"""
    Summarize the following content into very precise, important, and technical bullet points for students. 
    Each point should be concise and suitable for a flashcard. 
    Format your output as a JSON array of strings, with no extra text or markdown. 
    If possible, provide up to {num_bullets} points, but only as many as are truly important.

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
        # Remove markdown/code block wrappers and extract JSON array
        if text.startswith("```"):
            start_idx = text.find("[")
            end_idx = text.rfind("]") + 1
            text = text[start_idx:end_idx]
        # Remove any leading/trailing text before/after JSON array
        if not text.startswith("["):
            start_idx = text.find("[")
            if start_idx != -1:
                text = text[start_idx:]
        if not text.endswith("]"):
            end_idx = text.rfind("]")
            if end_idx != -1:
                text = text[:end_idx+1]
        try:
            bullets = json.loads(text)
            return bullets
        except Exception as e:
            print(f"⚠️ JSON parsing error: {e}\nRaw Gemini output: {text}")
            return []
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