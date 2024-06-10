from typing import List
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async
import asyncio
from langchain.text_splitter import RecursiveCharacterTextSplitter
import trafilatura
from app.utils.date import strdate_to_intdate
import json
from app.utils.vector import generate_upsertables

class Crawler:
    def __init__(self, chroma_collection):
        self.chroma_collection = chroma_collection
        
    def extract_content(self, html: str):
        data_str = trafilatura.extract(html, output_format="json")
        data = json.loads(data_str)
        title, date, content = data.get("title"), data.get("date"), data.get("raw_text")
        
        if not title:
            raise Exception("Title not found")
        if not date:
            raise Exception("Date not found")
        if not content:
            raise Exception("Content not found")
        
        trimmed_content = trafilatura.utils.trim(content)
        trimmed_content = trafilatura.utils.sanitize(trimmed_content)
        
        return title, date, trimmed_content
    
    async def scrape_url(self, url: str):
        async with async_playwright() as p:
            browser = await p.firefox.launch(
                headless=True,
            )
            page = await browser.new_page()
            await stealth_async(page)
            await page.goto(url)
            results = await page.content()  # Simply get the HTML content
            await browser.close()
            return results
    
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
        
        added_chunk_ids = []
        for url in urls:
            try:
                html = asyncio.run(self.scrape_url(url))
            except Exception as e:
                print(f"Error scraping url (skipping) {url}: {e}")
                continue
            try:
                title, date_str, content = self.extract_content(html)
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
            
        if do_cleanup:
            """Only run if doing full url crawling"""
            print("Cleaning up old chunks...")
            self.cleanup_old_chunks(added_chunk_ids)
    
    def get_existing_chunks_ids(self) -> List[dict]:
        results = self.chroma_collection.query(
            query_texts="",
            n_results=9999999999999999
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