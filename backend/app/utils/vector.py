from app import chroma_client 
from langchain_community.vectorstores import Chroma
from app.utils.embeddings import embeddings
import json

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