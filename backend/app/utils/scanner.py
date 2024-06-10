import requests
import re
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
from app.models.models import SiteAddedSources, Site

class Scanner:
    def __init__(self, base_url, max_depth, db_session, db_site_id, max_urls_allowed=100, ignore_query=True, ignore_hash=True):
        self.base_url = base_url
        self.max_depth = max_depth
        self.db_session = db_session
        self.db_site_id = db_site_id
        self.ignore_query = ignore_query
        self.ignore_hash = ignore_hash
        self.max_urls_allowed = max_urls_allowed
        self.visited_urls = set()
        self.initial_visited_count = self.count_visited_urls()

    def get_absolute_url(self, base, link):
        return link if link.startswith('http') else urljoin(base, link)

    def get_favicon(self, url):
        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()
        except requests.RequestException:
            return None

        soup = BeautifulSoup(response.text, 'html.parser')
        icon_link = soup.find('link', rel='icon') or soup.find('link', rel='shortcut icon')

        return self.get_absolute_url(url, icon_link.get('href')) if icon_link else None

    def is_valid_url(self, url):
        parsed = urlparse(url)
        return bool(parsed.netloc) and bool(parsed.scheme) and not parsed.path.endswith(('.png', '.jpg', '.jpeg', '.svg', '.pdf'))

    def count_visited_urls(self):
        return self.db_session.query(SiteAddedSources).filter_by(site_id=self.db_site_id).count()

    def set_favicon_if_needed(self):
        site = self.db_session.query(Site).filter_by(id=self.db_site_id).first()
        if site and not site.favicon_url:
            favicon_url = self.get_favicon(self.base_url)
            if favicon_url:
                site.favicon_url = favicon_url
                self.db_session.commit()

    def scan(self, url, depth=0):
        if depth > self.max_depth or \
           (self.ignore_query and '?' in url) or \
           (self.ignore_hash and "#" in url) or \
           not self.is_valid_url(url) or \
           self.initial_visited_count + len(self.visited_urls) >= self.max_urls_allowed:
            return

        if url in self.visited_urls:
            return

        self.visited_urls.add(url)

        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Request failed for {url}: {e}")
            return

        print(f"Scanning: {url} at depth {depth}")
        soup = BeautifulSoup(response.text, 'html.parser')
        links = [self.get_absolute_url(url, link.get('href')) for link in soup.find_all('a', href=True)]

        if not self.db_session.query(SiteAddedSources).filter_by(source=url).count():
            new_source = SiteAddedSources(site_id=self.db_site_id, source=url, source_type="webpage")
            self.db_session.add(new_source)
            self.db_session.commit()

        for link in links:
            self.scan(link, depth + 1)

    def start_scanning(self):
        # Set favicon URL if it does not exist yet
        self.set_favicon_if_needed()
        # Start scanning the base URL
        self.scan(self.base_url)
