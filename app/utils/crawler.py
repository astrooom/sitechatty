import hashlib
import re
import trafilatura
from .date import date_to_int
from typing import List
import json

class Crawler:
    def __init__(self, chroma_collection):
        self.chroma_collection = chroma_collection

    def process_urls(self, urls: List[str]):
        for url in urls:
            downloaded = trafilatura.fetch_url(url)
            if not downloaded:
                print(f"Failed to download content from '{url}'. Skipping.")
                continue
            
            extraction_str = trafilatura.extract(downloaded, output_format="json", favor_recall=True)
            if not extraction_str:
                print(f"Failed to extract content from '{url}'. Skipping.")
                continue
            
            extraction = json.loads(extraction_str)
            
            content = extraction.get("text") or extraction.get("raw_text")
            title = extraction.get("title")
            
            # Probably not needed here - can check metadata during url scan..
            # if not content or not title:
            #     print(f"Failed to extract content or title from '{url}'. Skipping.")
            #     continue
            
            source = extraction.get("source")
            date = extraction.get("date")
            added = extraction.get("filedate")

            date_int = None
            if date:
                date_int = date_to_int(date)
                
            added_int = None
            if added:
                added_int = date_to_int(added)
                
            document = json.dumps({
                    "source": source,
                    "title": title,
                    "content": content,
            })
            
            metadata = {
                    "source": source,
                    "title": title,
                    "date": date_int, # Allows filtering by gt and lt operators (https://docs.trychroma.com/guides#using-logical-operators)
                    "updated": added_int,
                    "type": classify_url(url)
            }
            
            # Save each document to the vector DB as it is crawled
            self.upsert_to_db(
                id=hashlib.md5(url.encode('utf-8')).hexdigest(),
                document=document, 
                metadata=metadata
            )

    def upsert_to_db(self, id: str, document: str, metadata: dict):
        self.chroma_collection.upsert(
            documents=[document],
            metadatas=[metadata],
            ids=[id]
        )

def classify_url(url):
    """
    Classifies a url based on its content, to be used in the vector db metadata 'type'.
    """ 
    doc_keywords = [
        'docs', 'documentation', 'kb', 'knowledgebase', 'help', 'support', 'announcement',
        'guide', 'tutorial', 'faq', 'manual', 'how-to', 'learn', 'article', 'contact'
    ]
    
    commerce_keywords = [
        'shop', 'store', 'product', 'buy', 'cart', 'checkout', 'sale', 'ecommerce', 'hosting',
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