import os
import chromadb
from app.config import CHROMA_API_KEY, TENANT_ID, DB_NAME

# Initialize the ChromaDB client
client = chromadb.CloudClient(api_key=CHROMA_API_KEY, tenant=TENANT_ID, database=DB_NAME)

# Store chunks with embeddings
def store_chunks(chunks, embeddings, collection_name):
    collection = client.get_or_create_collection(name=collection_name)
    for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        collection.add(
            documents=[chunk],
            embeddings=[embedding],
            ids=[f"chunk-{idx}"]
        )

# Fetch all documents from a collection and combine them
def fetch_combined(collection_name):
    collection = client.get_collection(name=collection_name)
    docs = []
    offset, limit = 0, 100
    while True:
        result = collection.get(include=["documents"], offset=offset, limit=limit)
        docs += result["documents"]
        if len(result["documents"]) < limit:
            break
        offset += limit
    return "\n\n".join(docs)

# Store summary with a dynamic ID based on PDF filename
def store_summary(summary_text, collection_name, pdf_filename):
    # Generate a unique ID from the filename
    doc_id = os.path.splitext(os.path.basename(pdf_filename))[0] + "_summary"

    collection = client.get_or_create_collection(name=collection_name)
    collection.add(
        documents=[summary_text],
        ids=[doc_id]
    )
    
    # Add this to chromadb_service.py

def query(text_query, top_k=3, collection_name=None):
    """
    Retrieve top_k relevant documents from a collection using the query text.
    """
    if collection_name is None:
        raise ValueError("collection_name must be specified")

    collection = client.get_collection(name=collection_name)
    # Perform similarity search
    result = collection.query(
        query_texts=[text_query],
        n_results=top_k,
        include=["documents"]
    )
    # Chroma returns list of lists for "documents"
    return {"documents": result["documents"]}
