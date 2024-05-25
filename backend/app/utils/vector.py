from app import chroma_client 
from langchain_community.vectorstores import Chroma
from app.utils.embeddings import embeddings

def get_search_results(query, site):
    langchain_chroma = Chroma(
        client=chroma_client,
        collection_name=f"{site.name}_{site.user_id}",
        embedding_function=embeddings,
    )

    search_results = langchain_chroma.similarity_search(query)
    combined_search_results = "\n".join([p.page_content for p in search_results])
    return combined_search_results