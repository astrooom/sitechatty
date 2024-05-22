from app import celery, db, chroma_client
from app.models.models import Site
from app.utils.embeddings import embeddings


from .scanner import Scanner
from .crawler import Crawler

@celery.task
def scan_url(base_url, site_id, max_depth):
    scanner = Scanner(base_url, max_depth, db_site_id=site_id, db_session=db.session) # Scans paths recursively from a base url and puts them in the DB.
    scanner.start_scanning()
    
@celery.task
def crawl_urls(site_id: int, urls: list, delete_first: bool = False, do_cleanup: bool = False):
    # Get the site from the DB
    site = Site.query.filter_by(id=site_id).first()
    if not site:
        raise Exception("Site not found")
    
    # Name the collection <site_name>_<user_id> to avoid overwriting same site names accross users.
    collection_name = f"{site.name}_{site.user_id}"
    
    if delete_first:
        chroma_client.delete_collection(collection_name)

    collection = chroma_client.get_or_create_collection(collection_name, embedding_function=embeddings)
    
    crawler = Crawler(collection)
    crawler.process_urls(urls, do_cleanup=do_cleanup)