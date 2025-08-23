# app/services/lang_service.py
from app.services import gemini_service

SUPPORTED_BCP47 = {
    # extend as needed
    "en": "English",
    "hi": "Hindi",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "mr": "Marathi",
    "ta": "Tamil",
    "te": "Telugu",
    "bn": "Bengali",
    "pa": "Punjabi",
    "gu": "Gujarati",
    "ur": "Urdu",
    "kn": "Kannada",
    "ml": "Malayalam",
    "ar": "Arabic",
    "zh": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
}

def detect_language(text: str) -> str:
    """
    Detect user language (returns BCP-47 like 'en', 'hi', ...).
    Falls back to 'en' if detection fails.
    """
    try:
        return gemini_service.detect_language(text) or "en"
    except Exception:
        return "en"

def to_english(text: str) -> str:
    """Translate arbitrary text to English."""
    return gemini_service.translate_text(text, target_lang="en")

def from_english(text_en: str, target_lang: str) -> str:
    """Translate English text to target language."""
    if not target_lang or target_lang.lower().startswith("en"):
        return text_en
    return gemini_service.translate_text(text_en, target_lang=target_lang)
