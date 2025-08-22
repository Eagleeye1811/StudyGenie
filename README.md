# 🧠 Notes Summarizer Backend – FastAPI

This is the backend for the **Notes Summarizer** project, built using **FastAPI**. It provides API endpoints for processing and summarizing uploaded notes or text.

---

## 🚀 How to Run the Backend

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo/backend
````

---

### 2. Set Up a Virtual Environment

#### For macOS / Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

#### For Windows:

```bash
python -m venv .venv
.venv\Scripts\activate
```

---

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

> If `requirements.txt` is missing, install packages manually:
>
> ```bash
> pip install fastapi uvicorn
> pip freeze > requirements.txt
> ```

---

### 4. Run the FastAPI Server

```bash
uvicorn main:app --reload
```

* `main:app` means:

  * `main.py` is the file
  * `app = FastAPI()` is the app instance

> Adjust this if your file structure differs.

---

### 5. Access the API Docs

Once the server is running, open your browser and go to:

* Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 📁 Project Structure

```
summarizer-backend/
├── app/
│   ├── __init__.py
│   ├── config.py                ← Environment variables & API keys
│   ├── models/
│   │   └── schemas.py           ← (Optional) Pydantic schemas
│   ├── routes/
│   │   └── summarizer.py        ← API routes (PDF upload, summary, audio)
│   ├── services/
│   │   ├── pdf_service.py       ← Extract text, chunk it, embed it
│   │   ├── chromadb_service.py  ← Vector DB integration
│   │   ├── gemini_service.py    ← Gemini summarization
│   │   └── tts_service.py       ← Edge TTS to generate audio
│   └── utils/                   ← (Optional) helper functions
├── audio/                       ← Stores generated MP3 files
├── uploads/                     ← Stores uploaded PDFs
├── venv/                        ← Python virtual environment
├── main.py                      ← FastAPI entry point
├── requirements.txt             ← Project dependencies
├── .env                         ← API keys & credentials
└── README.md
```

---

## ⚙️ Environment Variables (Optional)

If you're using environment variables, create a `.env` file like this:

```
GEMINI_API_KEY=your_gemini_key
CHROMA_API_KEY=your_chroma_key
TENANT_ID=your_tenant_id
```

Use `python-dotenv` in your code to load it:

```python
from dotenv import load_dotenv
load_dotenv()
```

Install it via:

```bash
pip install python-dotenv
```

---

## 🛠 Tech Stack

* **FastAPI**
* **Uvicorn**
* **Pydantic**
* **Python 3.8+**




