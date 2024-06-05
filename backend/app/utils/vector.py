from app import chroma_client 
from langchain_community.vectorstores import Chroma
from app.utils.embeddings import embeddings
import json
import hashlib
from datetime import datetime, timezone
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.utils.classify_url import classify_url


def get_collection(collection_name: str, create_if_not_exists: bool = False):
  if create_if_not_exists:
    return chroma_client.get_or_create_collection(collection_name, embedding_function=embeddings)
  else:
    return chroma_client.get_collection(collection_name, embedding_function=embeddings)


def get_search_results(query, site):
    langchain_chroma = Chroma(
        client=chroma_client,
        collection_name=f"{site.name}_{site.user_id}",
        embedding_function=embeddings,
    )

    search_results = langchain_chroma.similarity_search(query)
    combined_search_results = "\n".join([p.page_content for p in search_results])
    return combined_search_results


def get_combined_source_chunks(collection, source):
    """
    Grab the contents of a source (combining all chunks)
    """
    query_results = collection.get(where={"source": source}, include=["metadatas", "documents"])
    if not query_results['ids']:
        return None

    query_documents = query_results['documents']
    if not query_documents:
        return None

    documents = []
    for document in query_documents:
        json_content = json.loads(document)
        chunk_index = json_content['chunk_index']
        documents.append((chunk_index, json_content['content']))

    documents.sort(key=lambda x: x[0])
    combined_documents = "".join([content for _, content in documents])
    
    return combined_documents


def chunk_text(text: str):
  text_splitter = RecursiveCharacterTextSplitter(
      chunk_size=1024,
      chunk_overlap=32,
      # length_function=len,
  )
  return text_splitter.split_text(text)

def generate_upsertables(source: str, source_type: str, content: str, page_date = "", display_title = ""):

  """
  Generate upsertables for the vector db.
  This ensures that there can only be one document per source
  """
  
  updated_at = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
  metadata = {
          "source": source,
          "source_type": source_type,
          # "page_date": strdate_to_intdate(date_str)
          "page_date": page_date,
          "updated_at_datetime": updated_at,
          "type": classify_url(source),
  }
  
  chunks = chunk_text(content)

  return_upsertables = []
  for idx, chunk in enumerate(chunks):
      document = json.dumps({
          "title": display_title if display_title else source,
          "content": chunk,
          "chunk_index": idx
      })

      chunk_id = hashlib.md5(f"{source}_{idx}".encode('utf-8')).hexdigest()
      
      return_upsertables.append({
          "id": chunk_id,
          "document": document,
          "metadata": metadata
      })

  return return_upsertables