from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import summarizer, chat, realtime_chat, auth
from app.db.mongo import setup_db_indexes

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Frontend dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the router with the correct prefix
app.include_router(summarizer.router, prefix="/api/summarize", tags=["summarizer"])
app.include_router(chat.router, prefix="/chatbot")
app.include_router(realtime_chat.router)
app.include_router(auth.router, prefix="/auth", tags=["authentication"])

# Setup database indexes
@app.on_event("startup")
async def startup_db_client():
    await setup_db_indexes()
