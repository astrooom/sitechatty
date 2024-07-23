import trafilatura
import json
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
from playwright_stealth import stealth_sync

playwright = sync_playwright().start()
print("Playwright started")

def scrape_url(url: str, timeout: int = 10000):
    results = ""  # Initialize results

    try:
        print("Starting browser...")
        browser = playwright.firefox.launch(headless=True)
        print("Opening page...")
        page = browser.new_page()
        print("Enabling stealth mode")
        stealth_sync(page)
        print("Navigating to page...")
        page.goto(url, timeout=timeout)
        page.wait_for_selector('body', timeout=timeout)
        print("Page loaded")
        results = page.content()
        print("Content scraped")
    except PlaywrightTimeoutError:
        print("Timed out waiting for page to load")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        print("Closing page...")
        page.close()
        print("Closing browser...")
        browser.close()
          
    print("Scraping complete")
    return results
def extract_content(url: str = None, html: str = None):
  
    if not url and not html:
        raise Exception("Either url or html must be provided")
  
    if not html:
        html = trafilatura.fetch_url(url=url)
            
    data_str = trafilatura.extract(filecontent=html, output_format="json")
  
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