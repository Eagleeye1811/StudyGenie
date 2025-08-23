# app/db/mongo.py

from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pymongo import IndexModel, ASCENDING

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL")
client = AsyncIOMotorClient(MONGO_URL)

db = client["notes_summarizer"]
summary_collection = db["summaries"]
users_collection = db["users"]

# Create unique index on email
async def setup_db_indexes():
    # Create an index on email to ensure uniqueness
    await users_collection.create_index([("email", ASCENDING)], unique=True)
