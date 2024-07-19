from typing import Literal
from korvus import Collection
from app.config import Config
from datetime import datetime, timezone
from time import time
from app.utils.classify_url import classify_url

def get_collection(collection_name: str):
  return Collection(collection_name, Config.KORVUS_DATABASE_URL)

def generate_upsertable(source: str, source_type: Literal['input', 'webpage'], content: str, page_date: int = "", display_title: str = ""):
    """
    Generate upsertable document for the vector database.
    This ensures that there can only be one document per source.
    """

    if page_date:
        try:
            datetime.fromtimestamp(int(page_date))
        except ValueError as e:
            print(f"Error parsing page date {page_date}: {e}")
            raise ValueError("page_date must be a valid Unix timestamp or an empty string.")

    updated_at = int(time())
    
    return {
        "id": source,
        "source_type": source_type,
        "page_date": page_date,
        "updated_at": updated_at,
        "content_type": classify_url(source),
        "title": display_title if display_title else source,
        "text": content
    }
  
async def upsert_documents(collection_name: str, documents: list, merge: bool = False):
    """
    Upsert documents into the specified collection with optional merging.
    """
    collection = get_collection(collection_name)
    await collection.upsert_documents(documents, {"merge": merge})