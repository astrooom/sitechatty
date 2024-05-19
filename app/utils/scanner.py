import requests
import re
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
from app.models.models import ScannerFoundUrls, ScannerMainUrl

class Scanner:
    def __init__(self, base_url, max_depth, db_session, db_site_id, ignore_query=True, ignore_hash=True):
        self.base_url = base_url
        self.max_depth = max_depth
        self.db_session = db_session
        self.db_site_id = db_site_id
        self.ignore_query = ignore_query
        self.ignore_hash = ignore_hash
        self.main_url_record = None  # To store the ScannerMainUrl record

    def get_absolute_url(self, base, link):
        if link.startswith('http'):
            return link
        else:
            return urljoin(base, link)

    def get_favicon(self, url):
        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()
        except requests.RequestException:
            return None

        soup = BeautifulSoup(response.text, 'html.parser')
        icon_link = soup.find('link', rel='icon')
        if not icon_link:
            icon_link = soup.find('link', rel='shortcut icon')

        if icon_link:
            favicon_url = self.get_absolute_url(url, icon_link.get('href'))
            return favicon_url
        return None

    def is_valid_url(self, url):
        parsed = urlparse(url)
        return bool(parsed.netloc) and bool(parsed.scheme) and not parsed.path.endswith(('.png', '.jpg', '.jpeg', '.svg', '.pdf'))

    def url_visited(self, url):
        query = self.db_session.query(ScannerFoundUrls).filter_by(url=url)
        return query.count() > 0
    
    def main_url_exists(self):
        query = self.db_session.query(ScannerMainUrl).filter_by(url=self.base_url, site_id=self.db_site_id)
        return query.first()

    def count_visited_urls(self):
        query = self.db_session.query(ScannerFoundUrls).filter_by(main_id=self.main_url_record.id)
        return query.count()

    def scan(self, url, depth=0):
        if self.ignore_query and '?' in url:
            return
        
        if self.ignore_hash and "#" in url:
            return
        
        # Ignore index pages.
        if url.endswith('/') or re.search(r'\/index(\.[^\/]*)?$', url):
            return

        if depth > self.max_depth:
            return

        if not self.is_valid_url(url):
            return

        if (self.main_url_record is not None) and (self.count_visited_urls() >= self.main_url_record.max_urls_allowed):
            print(f"Reached the maximum limit of {self.main_url_record.max_urls_allowed} URLs in DB. Stopping scan.")
            return

        # Only skip URLs that are already in the database, not those in the current session
        already_in_db = False
        if self.url_visited(url):
            already_in_db = True

        print(f"Scanning: {url} at depth {depth}")

        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Request failed for {url}: {e}")
            return

        soup = BeautifulSoup(response.text, 'html.parser')
        links = [self.get_absolute_url(url, link.get('href')) for link in soup.find_all('a', href=True)]

        if depth == 0 and self.main_url_record is None:
            
            main_url_exists = self.main_url_exists()
            if not main_url_exists:
                # Save the main URL and its favicon to the database
                favicon_url = self.get_favicon(url)
                self.main_url_record = ScannerMainUrl(url=url, favicon_url=favicon_url, site_id=self.db_site_id)
                self.db_session.add(self.main_url_record)
                self.db_session.commit()
            else:
                self.main_url_record = main_url_exists
        else:
            if not already_in_db:
                # Save the found URL to the database
                found_url_record = ScannerFoundUrls(main_id=self.main_url_record.id, url=url)
                self.db_session.add(found_url_record)
                self.db_session.commit()

        for link in links:
            self.scan(link, depth + 1)

    def start_scanning(self):
        self.scan(self.base_url)
