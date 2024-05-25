import hashlib
import re
from typing import List
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async
import asyncio
from datetime import datetime
from langchain.text_splitter import RecursiveCharacterTextSplitter
import trafilatura
from app.utils.date import strdate_to_intdate
import json

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
            
            # ? Consider adding RAG step here to "grab relevant content from the body into markdown"
            # If so, we can change the RecursiveCharacterTextSplitter to a DocumentTextSplitter with markdown.
            
            chunks = self.chunk_text(content)
            
            updated_at = int(datetime.now().strftime('%Y%m%d%H%M%S'))
            for idx, chunk in enumerate(chunks):
                document = json.dumps({
                    "title": title,
                    "content": chunk,
                    "chunk_index": idx
                })

            metadata = {
                    "source": url,
                    "title": title,
                    "page_date": strdate_to_intdate(date_str), # Allows filtering by gt and lt operators (https://docs.trychroma.com/guides#using-logical-operators)
                    "updated_at_datetime": updated_at, 
                    "type": classify_url(url)
            }
            
            chunk_id = hashlib.md5(f"{url}_{idx}".encode('utf-8')).hexdigest()
        
            # Save each document to the vector DB as it is crawled
            self.upsert_to_db(
                id=chunk_id,
                document=document, 
                metadata=metadata
            )
            
            added_chunk_ids.append(chunk_id)
            
        if do_cleanup:
            """Only run if doing full url crawling"""
            print("Cleaning up old chunks...")
            self.cleanup_old_chunks(added_chunk_ids)

    def upsert_to_db(self, id: str, document: str, metadata: dict):
        self.chroma_collection.upsert(
            documents=[document],
            metadatas=[metadata],
            ids=[id]
        )
    
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
            
    def get_old_chunk_ids(self, days_ago: int) -> List[dict]:
        comparator = datetime.now() - datetime.timedelta(days=days_ago)
        comparator = int(comparator.strftime('%Y%m%d%H%M%S'))
        results = self.chroma_collection.query(
            where={"updated_at_datetime": {"$gt": comparator}},
            query_texts="",
            n_results=9999999999999999
        ) 
        return results

def classify_url(url):
    """
    Classifies a url based on its content, to be used in the vector db metadata 'type'.
    """ 
    
    doc_keywords = [
        'docs', 'documentation', 'kb', 'knowledgebase', 'help', 'support', 'announcement',
        'guide', 'tutorial', 'faq', 'manual', 'how-to', 'learn', 'article', 'contact'
    ]
    
    commerce_keywords = [
        'shop', 'store', 'product', 'buy', 'cart', 'checkout', 'sale', 'ecommerce', 'hosting', 'host',
        'payment', 'shipping', 'vps', 'cloud', 'domain', 'email', 'payment', 'subscription', 'domain',
        'server', 'game'
    ]
    
    blog_keywords = [
        'blog', 'news', 'post', 'article', 'journal', 'story', 'entry', 'update'
    ]
    
    forum_keywords = [
        'forum', 'community', 'discussion', 'thread', 'topic', 'board', 'post', 'message'
    ]
    
    social_keywords = [
        'social', 'network', 'share', 'follow', 'like', 'comment', 'friend', 'connect', 
        'profile', 'timeline', 'feed', 'group', 'event', 'mention', 'retweet', 'hashtag',
        'facebook', 'youtube', 'whatsapp', 'instagram', 'tiktok', 'wechat', 'messenger',
        'linkedin', 'telegram', 'snapchat', 'douyin', 'kuaishou', 'weibo', 'qq', 'twitter',
        'qzone', 'reddit', 'pinterest', 'quora', 'josh', 'teams', 'skype', 'tieba', 'viber',
        'imo', 'xiaohongshu', 'twitch', 'line', 'discord', 'threads', 'likee', 'picsart',
        'vevo', 'tumblr', 'vk'
    ]
    
    auth_keywords = [
        'auth', 'login', 'signup', 'account', 'password', 'forgot', 'reset', 'register',
    ]
    
    legal_keywords = [
        'legal', 'privacy', 'terms', 'disclaimer', 'copyright', 'intellectual', 'property',
    ]
    
    # Compile regex patterns for each type
    doc_pattern = re.compile(r'\b(' + '|'.join(doc_keywords) + r')\b', re.IGNORECASE)
    commerce_pattern = re.compile(r'\b(' + '|'.join(commerce_keywords) + r')\b', re.IGNORECASE)
    blog_pattern = re.compile(r'\b(' + '|'.join(blog_keywords) + r')\b', re.IGNORECASE)
    forum_pattern = re.compile(r'\b(' + '|'.join(forum_keywords) + r')\b', re.IGNORECASE)
    social_keywords = re.compile(r'\b(' + '|'.join(social_keywords) + r')\b', re.IGNORECASE)
    auth_keywords = re.compile(r'\b(' + '|'.join(auth_keywords) + r')\b', re.IGNORECASE)
    legal_keywords = re.compile(r'\b(' + '|'.join(legal_keywords) + r')\b', re.IGNORECASE)
        
    # Determine the type based on the presence of keywords in the URL
    if doc_pattern.search(url):
        return "doc"
    elif commerce_pattern.search(url):
        return "commerce"
    elif blog_pattern.search(url):
        return "blog"
    elif social_keywords.search(url):
        return "social"
    elif forum_pattern.search(url):
        return "forum"
    elif auth_keywords.search(url):
        return "auth"
    elif legal_keywords.search(url):
        return "legal"
    else:
        return "unknown"