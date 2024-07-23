from typing import List
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.utils.date import strdate_to_intdate
from app.utils.vector import generate_upsertables, MAX_BIGINT_VALUE
from app.utils.scraping import extract_content, scrape_url

class Crawler:
    def __init__(self, chroma_collection):
        self.chroma_collection = chroma_collection
    
    def chunk_text(self, text: str):
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1024,
            chunk_overlap=32,
            # length_function=len,
        )
        return text_splitter.split_text(text)
        

    def process_urls(self, urls: List[str], do_cleanup: bool = False):  
        
        if len(urls) < 2:
            # Should onyl run if we are doing full url crawling
            do_cleanup = False     
        
        return_contents = ""
        
        added_chunk_ids = []
        for url in urls:
            try:
                html = scrape_url(url)
            except Exception as e:
                print(f"Error scraping url (skipping) {url}: {e}")
                continue
            try:
                title, date_str, content = extract_content(html)
            except Exception as e:
                print(f"Error extracting content (skipping) {url}: {e}")
                continue
            
            upsertables = generate_upsertables(source=url, source_type="webpage", content=content, page_date=strdate_to_intdate(date_str), display_title=title)
            for upsertable in upsertables:
                self.chroma_collection.upsert(
                    documents=[upsertable['document']],
                    metadatas=[upsertable['metadata']],
                    ids=[upsertable['id']]
                )
                added_chunk_ids.append(upsertable['id'])
            
            
            # updated_at = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
            # metadata = {
            #         "source": url,
            #         "source_type": "webpage",
            #         "page_date": strdate_to_intdate(date_str), # Allows filtering by gt and lt operators (https://docs.trychroma.com/guides#using-logical-operators)
            #         "updated_at_datetime": updated_at,
            #         "type": classify_url(url),
            # }

            # ? Consider adding RAG step here to "grab relevant content from the body into markdown"
            # If so, we can change the RecursiveCharacterTextSplitter to a DocumentTextSplitter with markdown.
            
            #chunks = self.chunk_text(content)

            # for idx, chunk in enumerate(chunks):
            #     document = json.dumps({
            #         "title": title,
            #         "content": chunk,
            #         "chunk_index": idx
            #     })
            
            #     chunk_id = hashlib.md5(f"{url}_{idx}".encode('utf-8')).hexdigest()
        
            #     # Save each document to the vector DB as it is crawled
            #     self.upsert_to_db(
            #         id=chunk_id,
            #         document=document, 
            #         metadata=metadata
            #     )
            
            #     added_chunk_ids.append(chunk_id)
            
            return_contents += content
            
        if do_cleanup:
            """Only run if doing full url crawling"""
            print("Cleaning up old chunks...")
            self.cleanup_old_chunks(added_chunk_ids)
            
        return return_contents
    
    def get_existing_chunks_ids(self) -> List[dict]:
        results = self.chroma_collection.query(
            query_texts="",
            n_results=MAX_BIGINT_VALUE
        )
        return [chunk_id for sublist in results["ids"] for chunk_id in sublist]

    def delete_chunks(self, chunk_ids: List[str]):
        self.chroma_collection.delete(ids=chunk_ids)
        
    def cleanup_old_chunks(self, added_chunk_ids: List[str]):
        """
        Deletes all chunk ids which are not in the list of added chunk ids. 
        This should only ever run if doing full url crawling.
        """
        
        # Retrieve all existing chunks for the URL from the vector DB
        existing_chunks = self.get_existing_chunks_ids()

        # Determine old chunks to delete using list comprehension
        old_chunk_ids = [chunk_id for chunk_id in existing_chunks if chunk_id not in added_chunk_ids]

        # Delete old chunks if there are any
        if old_chunk_ids:
            print("Deleting old chunks: ", old_chunk_ids)
            self.delete_chunks(old_chunk_ids)